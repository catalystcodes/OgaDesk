/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const clerk = vi.hoisted(() => ({
  sessions: { getSession: vi.fn() },
  organizations: {
    getOrganizationMembershipList: vi.fn(),
    getOrganization: vi.fn(),
  },
  users: { getUser: vi.fn() },
}));
vi.mock("@clerk/backend", () => ({ createClerkClient: () => clerk }));
const modules = import.meta.glob("./**/*.ts");
const day = new Date(Date.now() + 3600000).toISOString().slice(0, 10);
const userIdentity = {
  subject: "user_a",
  issuer: "https://test.clerk.accounts.dev",
  tokenIdentifier: "https://test.clerk.accounts.dev|user_a",
  sid: "sess_a",
  "o.id": "org_a",
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CLERK_SECRET_KEY", "test-only");
  vi.stubEnv("CLERK_AUTHORIZED_PARTIES", "http://localhost:8081");
  clerk.sessions.getSession.mockResolvedValue({
    userId: "user_a",
    status: "active",
  });
  clerk.organizations.getOrganizationMembershipList.mockResolvedValue({
    data: [
      {
        publicUserData: { userId: "user_a" },
        organization: { id: "org_a" },
        role: "org:admin",
      },
    ],
  });
  clerk.organizations.getOrganization.mockResolvedValue({
    name: "Test warehouse",
    publicMetadata: {},
  });
  clerk.users.getUser.mockResolvedValue({
    firstName: "Ada",
    lastName: "Okafor",
  });
});

async function setup() {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    await ctx.db.insert("dashboardSummaries", {
      organizationId: "org_a",
      businessDate: day,
      updatedAt: 1000,
      lowStockItems: 4,
      pendingApprovals: 2,
      movementsToday: 18,
      previousMovements: 16,
      inStock: 1210,
      lowStock: 56,
      outOfStock: 28,
      untracked: 188,
    });
    await ctx.db.insert("dashboardExpenses", {
      organizationId: "org_a",
      businessDate: day,
      expensesMinor: 4520000,
      previousExpensesMinor: 4200000,
      updatedAt: 1000,
    });
    for (const [organizationId, assignedUserId, kind, title] of [
      ["org_a", "user_a", "count", "Own count"],
      ["org_a", "user_a", "approval", "Approval"],
      ["org_a", "user_b", "receive", "Other user task"],
      ["org_b", "user_a", "count", "Other tenant task"],
    ] as const)
      await ctx.db.insert("dashboardTasks", {
        orgId: organizationId,
        userId: assignedUserId,
        kind,
        title,
        detail: "",
        status: "pending",
        completedUnits: 0,
        totalUnits: 10,
        startedAt: null,
        day,
        updatedAt: 1000,
      });
    await ctx.db.insert("dashboardTaskTotals", {
      organizationId: "org_a",
      assignedUserId: "user_a",
      businessDate: day,
      total: 2,
      completed: 0,
      approvalTotal: 1,
      approvalCompleted: 0,
    });
    for (const [organizationId, actorUserId, kind, title] of [
      ["org_a", "user_a", "receive", "Own receipt"],
      ["org_a", "user_b", "dispatch", "Team dispatch"],
      ["org_a", "user_a", "expense", "Private expense"],
      ["org_b", "user_a", "receive", "Other tenant receipt"],
    ] as const)
      await ctx.db.insert("dashboardActivity", {
        organizationId,
        actorUserId,
        kind,
        title,
        detail: "",
        actorLabel: "Test member",
        occurredAt: 1000,
      });
  });
  return t;
}

test("anonymous requests are rejected before Clerk or data access", async () => {
  const t = await setup();
  expect(
    await t.action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 401 });
  expect(clerk.sessions.getSession).not.toHaveBeenCalled();
});
test("client organisation IDs cannot select another tenant", async () => {
  const t = await setup();
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_b" }),
  ).toMatchObject({ ok: false, status: 403 });
  expect(clerk.sessions.getSession).not.toHaveBeenCalled();
});
test("an identity without a Clerk session cannot enter", async () => {
  const t = await setup();
  expect(
    await t
      .withIdentity({ ...userIdentity, sid: undefined })
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 401 });
});
test.each(["pending", "revoked", "ended"])(
  "%s sessions are denied",
  async (status) => {
    const t = await setup();
    clerk.sessions.getSession.mockResolvedValue({ userId: "user_a", status });
    expect(
      await t
        .withIdentity(userIdentity)
        .action(api.dashboard.load, { organizationId: "org_a" }),
    ).toMatchObject({ ok: false, status: 403 });
  },
);
test("removed memberships and unknown roles cannot read data", async () => {
  const t = await setup();
  clerk.organizations.getOrganizationMembershipList.mockResolvedValue({
    data: [],
  });
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 403 });
  clerk.organizations.getOrganizationMembershipList.mockResolvedValue({
    data: [
      {
        publicUserData: { userId: "user_a" },
        organization: { id: "org_a" },
        role: "org:unknown",
      },
    ],
  });
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 403 });
});
test("session and membership identities must match the authenticated caller", async () => {
  const t = await setup();
  expect(
    await t
      .withIdentity({
        ...userIdentity,
        subject: "user_b",
        tokenIdentifier: "https://test.clerk.accounts.dev|user_b",
      })
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 403 });
});
test("foreign app origins are denied", async () => {
  const t = await setup();
  expect(
    await t
      .withIdentity({ ...userIdentity, azp: "https://other.example" })
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 403 });
});

test("Clerk v2 nested organisation claims select only the signed organisation", async () => {
  const t = await setup();
  const nested = {
    ...userIdentity,
    "o.id": undefined,
    o: { id: "org_a", rol: "admin" },
  };
  expect(
    await t
      .withIdentity(nested)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: true });
  expect(
    await t
      .withIdentity(nested)
      .action(api.dashboard.load, { organizationId: "org_b" }),
  ).toMatchObject({ ok: false, status: 403 });
});
test.each(["Owner", "Manager", "Staff"] as const)(
  "%s sees only its permitted records",
  async (role) => {
    const t = await setup();
    const serverRole = {
      Owner: "org:admin",
      Manager: "org:manager",
      Staff: "org:member",
    }[role];
    clerk.organizations.getOrganizationMembershipList.mockResolvedValue({
      data: [
        {
          publicUserData: { userId: "user_a" },
          organization: { id: "org_a" },
          role: serverRole,
        },
      ],
    });
    // A stale Owner token must never override the fresh membership role.
    const response = await t
      .withIdentity({ ...userIdentity, org_role: "org:admin" })
      .action(api.dashboard.load, { organizationId: "org_a" });
    expect(response.ok).toBe(true);
    if (!response.ok) throw new Error(response.message);
    expect(response.data.role).toBe(role);
    expect(response.data.tasks.map((t) => t.title)).toEqual(
      role === "Staff" ? ["Own count"] : ["Own count", "Approval"],
    );
    expect(response.data.activity.map((a) => a.title)).toEqual(
      role === "Staff"
        ? ["Own receipt"]
        : role === "Manager"
          ? ["Own receipt", "Team dispatch"]
          : ["Own receipt", "Team dispatch", "Private expense"],
    );
    if (role === "Owner")
      expect(response.data.summary?.expensesMinor).toBe(4520000);
    else expect(JSON.stringify(response.data)).not.toContain("4520000");
    if (role === "Staff") {
      expect(response.data.summary).toBeNull();
      expect(response.data.actions).not.toContain("approvals");
    }
  },
);
test("task totals remain exact beyond the 100 displayed tasks", async () => {
  const t = await setup();
  await t.run(async (ctx) => {
    for (let i = 0; i < 105; i++)
      await ctx.db.insert("dashboardTasks", {
        orgId: "org_c",
        userId: "user_c",
        day,
        kind: "count",
        status: "completed",
        title: "Count",
        detail: "",
        completedUnits: 1,
        totalUnits: 1,
        startedAt: null,
        updatedAt: i,
      });
    await ctx.db.insert("dashboardTaskTotals", {
      organizationId: "org_c",
      assignedUserId: "user_c",
      businessDate: day,
      total: 105,
      completed: 105,
      approvalTotal: 0,
      approvalCompleted: 0,
    });
  });
  const result = await t.query(internal.dashboardData.read, {
    organizationId: "org_c",
    userId: "user_c",
    role: "Staff",
    businessDate: day,
  });
  expect(result.tasks).toHaveLength(100);
  expect(result.taskTotals).toEqual({ total: 105, completed: 105 });
});
test("missing data returns a real empty workspace", async () => {
  const t = convexTest(schema, modules);
  const response = await t
    .withIdentity(userIdentity)
    .action(api.dashboard.load, { organizationId: "org_a" });
  expect(response.ok).toBe(true);
  if (response.ok)
    expect(response.data).toMatchObject({
      state: "empty",
      summary: null,
      tasks: [],
      activity: [],
      taskTotals: { total: 0, completed: 0 },
    });
});
test("yesterday's aggregates and assignments are not shown today", async () => {
  const t = await setup();
  const result = await t.query(internal.dashboardData.read, {
    organizationId: "org_a",
    userId: "user_a",
    role: "Owner",
    businessDate: "2000-01-01",
  });
  expect(result.summary).toBeNull();
  expect(result.tasks).toEqual([]);
  expect(result.taskTotals.total).toBe(0);
});
test("Clerk outages return a retryable error without data", async () => {
  const t = await setup();
  clerk.users.getUser.mockRejectedValue(
    new Error("sensitive provider failure"),
  );
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toEqual({
    ok: false,
    status: 503,
    code: "service_unavailable",
    message: "We couldn’t load your workspace. Please try again.",
  });
});

test("invalid progress is rejected rather than rendered", async () => {
  const t = await setup();
  await t.run(async (ctx) => {
    await ctx.db.insert("dashboardTasks", {
      orgId: "org_a",
      userId: "user_a",
      day,
      kind: "count",
      status: "pending",
      title: "Invalid",
      detail: "",
      completedUnits: 3,
      totalUnits: 2,
      startedAt: null,
      updatedAt: 1000,
    });
  });
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 503 });
});

test("missing counters cannot silently truncate progress totals", async () => {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    for (let i = 0; i < 105; i++)
      await ctx.db.insert("dashboardTasks", {
        orgId: "org_a",
        userId: "user_a",
        day,
        kind: "count",
        status: "pending",
        title: "Count",
        detail: "",
        completedUnits: 0,
        totalUnits: 1,
        startedAt: null,
        updatedAt: i,
      });
  });
  expect(
    await t
      .withIdentity(userIdentity)
      .action(api.dashboard.load, { organizationId: "org_a" }),
  ).toMatchObject({ ok: false, status: 503 });
});
