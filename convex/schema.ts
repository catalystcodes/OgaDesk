import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { activityKind, taskKind, taskStatus } from "./validators";

export default defineSchema({
  dashboardSummaries: defineTable({
    organizationId: v.string(),
    businessDate: v.string(),
    updatedAt: v.number(),
    lowStockItems: v.number(),
    pendingApprovals: v.number(),
    movementsToday: v.number(),
    previousMovements: v.union(v.number(), v.null()),
    inStock: v.number(),
    lowStock: v.number(),
    outOfStock: v.number(),
    untracked: v.number(),
  }).index("by_organizationId_and_businessDate", [
    "organizationId",
    "businessDate",
  ]),
  dashboardExpenses: defineTable({
    organizationId: v.string(),
    businessDate: v.string(),
    expensesMinor: v.number(),
    previousExpensesMinor: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  }).index("by_organizationId_and_businessDate", [
    "organizationId",
    "businessDate",
  ]),
  dashboardTasks: defineTable({
    orgId: v.string(),
    userId: v.string(),
    day: v.string(),
    kind: taskKind,
    status: taskStatus,
    title: v.string(),
    detail: v.string(),
    completedUnits: v.number(),
    totalUnits: v.number(),
    startedAt: v.union(v.number(), v.null()),
    locationName: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_orgId_and_userId_and_day_and_kind_and_status_and_updatedAt", [
    "orgId",
    "userId",
    "day",
    "kind",
    "status",
    "updatedAt",
  ]),
  dashboardTaskTotals: defineTable({
    organizationId: v.string(),
    assignedUserId: v.string(),
    businessDate: v.string(),
    total: v.number(),
    completed: v.number(),
    approvalTotal: v.number(),
    approvalCompleted: v.number(),
  }).index("by_organizationId_and_assignedUserId_and_businessDate", [
    "organizationId",
    "assignedUserId",
    "businessDate",
  ]),
  dashboardActivity: defineTable({
    organizationId: v.string(),
    actorUserId: v.string(),
    kind: activityKind,
    title: v.string(),
    detail: v.string(),
    actorLabel: v.string(),
    occurredAt: v.number(),
  })
    .index("by_organizationId_and_kind_and_occurredAt", [
      "organizationId",
      "kind",
      "occurredAt",
    ])
    .index("by_organizationId_and_actorUserId_and_kind_and_occurredAt", [
      "organizationId",
      "actorUserId",
      "kind",
      "occurredAt",
    ]),
});
