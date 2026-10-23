import { v } from "convex/values";

export const role = v.union(
  v.literal("Owner"),
  v.literal("Manager"),
  v.literal("Staff"),
);
export const taskKind = v.union(
  v.literal("receive"),
  v.literal("dispatch"),
  v.literal("count"),
  v.literal("scan"),
  v.literal("approval"),
);
export const taskStatus = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
);
export const activityKind = v.union(
  v.literal("receive"),
  v.literal("dispatch"),
  v.literal("count"),
  v.literal("adjustment"),
  v.literal("expense"),
);
export const nullableNumber = v.union(v.number(), v.null());
export const nullableString = v.union(v.string(), v.null());
export const summary = v.object({
  lowStockItems: v.number(),
  pendingApprovals: v.number(),
  movementsToday: v.number(),
  movementChange: nullableNumber,
  expensesMinor: v.optional(v.number()),
  expenseChange: v.optional(nullableNumber),
  stock: v.object({
    inStock: v.number(),
    lowStock: v.number(),
    outOfStock: v.number(),
    untracked: v.number(),
  }),
});
export const task = v.object({
  id: v.string(),
  organizationId: v.string(),
  assignedUserId: v.string(),
  kind: taskKind,
  title: v.string(),
  detail: v.string(),
  status: taskStatus,
  completedUnits: v.number(),
  totalUnits: v.number(),
  startedAt: nullableString,
  locationName: v.optional(v.string()),
});
export const activity = v.object({
  id: v.string(),
  organizationId: v.string(),
  actorUserId: v.string(),
  kind: activityKind,
  title: v.string(),
  detail: v.string(),
  actorLabel: v.string(),
  occurredAt: v.string(),
});
export const totals = v.object({ completed: v.number(), total: v.number() });
export const records = v.object({
  summary: v.union(summary, v.null()),
  tasks: v.array(task),
  activity: v.array(activity),
  updatedAt: nullableString,
  taskTotals: totals,
});
export const dashboard = v.object({
  role,
  organizationId: v.string(),
  organizationName: v.string(),
  location: v.string(),
  firstName: v.string(),
  initials: v.string(),
  actions: v.array(
    v.union(
      v.literal("receive"),
      v.literal("dispatch"),
      v.literal("count"),
      v.literal("continue-count"),
      v.literal("scan"),
      v.literal("stock"),
      v.literal("expense"),
      v.literal("approvals"),
      v.literal("activity"),
      v.literal("reports"),
      v.literal("team"),
    ),
  ),
  state: v.union(v.literal("ready"), v.literal("empty")),
  updatedAt: nullableString,
  summary: v.union(summary, v.null()),
  tasks: v.array(task),
  activity: v.array(activity),
  taskTotals: totals,
});
export const result = v.union(
  v.object({ ok: v.literal(true), data: dashboard }),
  v.object({
    ok: v.literal(false),
    status: v.number(),
    code: v.string(),
    message: v.string(),
  }),
);
