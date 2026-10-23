import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { records, role } from "./validators";
import type {
  DashboardActivity,
  DashboardSummary,
  DashboardTask,
} from "../src/features/dashboard/types";

function integer(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error("Invalid dashboard aggregate");
  return value;
}
function percent(current: number, previous: number | null) {
  if (previous !== null) integer(previous);
  return previous === null || previous <= 0
    ? null
    : Math.round(((current - previous) / previous) * 100);
}

// Only the server action can call this, after a fresh Clerk membership check.
export const read = internalQuery({
  args: {
    organizationId: v.string(),
    userId: v.string(),
    role,
    businessDate: v.string(),
  },
  returns: records,
  handler: async (ctx, args) => {
    const { organizationId, userId, role, businessDate } = args;
    const kinds =
      role === "Staff"
        ? (["receive", "dispatch", "count", "scan"] as const)
        : (["receive", "dispatch", "count", "scan", "approval"] as const);
    const taskGroups = await Promise.all(
      kinds.flatMap((kind) =>
        (["in_progress", "pending", "completed"] as const).map((status) =>
          ctx.db
            .query("dashboardTasks")
            .withIndex(
              "by_orgId_and_userId_and_day_and_kind_and_status_and_updatedAt",
              (q) =>
                q
                  .eq("orgId", organizationId)
                  .eq("userId", userId)
                  .eq("day", businessDate)
                  .eq("kind", kind)
                  .eq("status", status),
            )
            .order("desc")
            .take(100),
        ),
      ),
    );
    const priority = { in_progress: 0, pending: 1, completed: 2 };
    const taskRows = taskGroups
      .flat()
      .sort(
        (a, b) =>
          priority[a.status] - priority[b.status] || b.updatedAt - a.updatedAt,
      )
      .slice(0, 100);
    const activityKinds =
      role === "Owner"
        ? (["receive", "dispatch", "count", "adjustment", "expense"] as const)
        : (["receive", "dispatch", "count", "adjustment"] as const);
    const activityGroups = await Promise.all(
      activityKinds.map((kind) =>
        role === "Staff"
          ? ctx.db
              .query("dashboardActivity")
              .withIndex(
                "by_organizationId_and_actorUserId_and_kind_and_occurredAt",
                (q) =>
                  q
                    .eq("organizationId", organizationId)
                    .eq("actorUserId", userId)
                    .eq("kind", kind),
              )
              .order("desc")
              .take(20)
          : ctx.db
              .query("dashboardActivity")
              .withIndex("by_organizationId_and_kind_and_occurredAt", (q) =>
                q.eq("organizationId", organizationId).eq("kind", kind),
              )
              .order("desc")
              .take(20),
      ),
    );
    const activityRows = activityGroups
      .flat()
      .sort((a, b) => b.occurredAt - a.occurredAt)
      .slice(0, 20);
    const [row, expenses, counts] = await Promise.all([
      role === "Staff"
        ? null
        : ctx.db
            .query("dashboardSummaries")
            .withIndex("by_organizationId_and_businessDate", (q) =>
              q
                .eq("organizationId", organizationId)
                .eq("businessDate", businessDate),
            )
            .unique(),
      role !== "Owner"
        ? null
        : ctx.db
            .query("dashboardExpenses")
            .withIndex("by_organizationId_and_businessDate", (q) =>
              q
                .eq("organizationId", organizationId)
                .eq("businessDate", businessDate),
            )
            .unique(),
      ctx.db
        .query("dashboardTaskTotals")
        .withIndex(
          "by_organizationId_and_assignedUserId_and_businessDate",
          (q) =>
            q
              .eq("organizationId", organizationId)
              .eq("assignedUserId", userId)
              .eq("businessDate", businessDate),
        )
        .unique(),
    ]);
    const summary: DashboardSummary | null = row
      ? {
          lowStockItems: integer(row.lowStockItems),
          pendingApprovals: integer(row.pendingApprovals),
          movementsToday: integer(row.movementsToday),
          movementChange: percent(row.movementsToday, row.previousMovements),
          stock: {
            inStock: integer(row.inStock),
            lowStock: integer(row.lowStock),
            outOfStock: integer(row.outOfStock),
            untracked: integer(row.untracked),
          },
          ...(expenses
            ? {
                expensesMinor: integer(expenses.expensesMinor),
                expenseChange: percent(
                  expenses.expensesMinor,
                  expenses.previousExpensesMinor,
                ),
              }
            : {}),
        }
      : null;
    const tasks: DashboardTask[] = taskRows.map((row) => ({
      id: row._id,
      organizationId,
      assignedUserId: userId,
      kind: row.kind,
      title: row.title,
      detail: row.detail,
      status: row.status,
      completedUnits: integer(row.completedUnits),
      totalUnits: integer(row.totalUnits),
      startedAt:
        row.startedAt === null ? null : new Date(row.startedAt).toISOString(),
      ...(row.locationName === undefined
        ? {}
        : { locationName: row.locationName }),
    }));
    if (tasks.some((task) => task.completedUnits > task.totalUnits))
      throw new Error("Invalid task progress");
    const activity: DashboardActivity[] = activityRows.map((row) => ({
      id: row._id,
      organizationId,
      actorUserId: row.actorUserId,
      kind: row.kind,
      title: row.title,
      detail: row.detail,
      actorLabel: row.actorLabel,
      occurredAt: new Date(row.occurredAt).toISOString(),
    }));
    const timestamps = [
      row?.updatedAt,
      expenses?.updatedAt,
      ...taskRows.map((r) => r.updatedAt),
      ...activityRows.map((r) => r.occurredAt),
    ].filter((value): value is number => value !== undefined);
    // At the display limit we cannot infer a complete total from task rows.
    if (!counts && tasks.length === 100)
      throw new Error("Missing complete task totals");
    const taskTotals = counts
      ? {
          total: integer(
            counts.total - (role === "Staff" ? counts.approvalTotal : 0),
          ),
          completed: integer(
            counts.completed -
              (role === "Staff" ? counts.approvalCompleted : 0),
          ),
        }
      : {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === "completed").length,
        };
    if (taskTotals.completed > taskTotals.total)
      throw new Error("Invalid task totals");
    return {
      summary,
      tasks,
      activity,
      taskTotals,
      updatedAt: timestamps.length
        ? new Date(Math.max(...timestamps)).toISOString()
        : null,
    };
  },
});
