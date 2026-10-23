import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allowedActions,
  assertDashboardMembership,
  canPerform,
  dashboardRole,
} from "../src/features/dashboard/permissions.ts";

test("dashboard layouts come from known server-assigned roles", () => {
  assert.equal(dashboardRole("org:admin"), "Owner");
  assert.equal(dashboardRole("org:manager"), "Manager");
  assert.equal(dashboardRole("org:member"), "Staff");
  for (const role of ["Owner", "admin", "org:supervisor", ""])
    assert.equal(dashboardRole(role), null);
});

test("pending/revoked sessions and mismatched memberships cannot open dashboards", () => {
  const identity = {
    userId: "user_a",
    organizationId: "org_a",
    sessionStatus: "active",
  };
  const membership = {
    userId: "user_a",
    organizationId: "org_a",
    role: "org:member",
  };
  assert.equal(assertDashboardMembership(identity, membership), "Staff");
  for (const status of ["pending", "ended", "revoked", "expired"])
    assert.equal(
      assertDashboardMembership(
        { ...identity, sessionStatus: status },
        membership,
      ),
      null,
    );
  assert.equal(assertDashboardMembership(identity, null), null);
  assert.equal(
    assertDashboardMembership(identity, {
      ...membership,
      organizationId: "org_b",
    }),
    null,
  );
  assert.equal(
    assertDashboardMembership(identity, { ...membership, userId: "user_b" }),
    null,
  );
});

test("staff can continue assigned counts but cannot start counts, approve, or read expenses", () => {
  assert.equal(canPerform("Staff", "continue-count"), true);
  for (const action of ["count", "approvals", "expense", "team", "reports"])
    assert.equal(canPerform("Staff", action), false);
  assert.equal(canPerform("Manager", "approvals"), true);
  assert.equal(canPerform("Manager", "expense"), false);
  assert.equal(canPerform("Owner", "expense"), true);
  const copy = allowedActions("Staff");
  copy.push("expense");
  assert.equal(canPerform("Staff", "expense"), false);
});
