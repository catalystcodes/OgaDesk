import type {
  DashboardAction,
  DashboardActivity,
  DashboardData,
  DashboardRole,
  DashboardSummary,
  DashboardTask,
} from "./types";

const actions: Record<DashboardRole, readonly DashboardAction[]> = {
  Owner: [
    "receive",
    "dispatch",
    "count",
    "scan",
    "stock",
    "expense",
    "approvals",
    "activity",
    "reports",
    "team",
  ],
  Manager: [
    "receive",
    "dispatch",
    "count",
    "scan",
    "stock",
    "approvals",
    "activity",
    "reports",
  ],
  Staff: ["receive", "dispatch", "continue-count", "scan", "stock", "activity"],
};

export function dashboardRole(serverRole: string): DashboardRole | null {
  if (serverRole === "org:admin" || serverRole === "org:owner") return "Owner";
  if (serverRole === "org:manager") return "Manager";
  if (serverRole === "org:member") return "Staff";
  return null;
}

export function allowedActions(role: DashboardRole): DashboardAction[] {
  return [...actions[role]];
}

export function canPerform(
  role: DashboardRole,
  action: DashboardAction,
): boolean {
  return actions[role].includes(action);
}

export function projectDashboard({
  role,
  organizationId,
  userId,
  summary,
  tasks,
  activity,
  identity,
  updatedAt,
}: {
  role: DashboardRole;
  organizationId: string;
  userId: string;
  summary: DashboardSummary | null;
  tasks: DashboardTask[];
  activity: DashboardActivity[];
  identity: Pick<
    DashboardData,
    "organizationName" | "location" | "firstName" | "initials"
  >;
  updatedAt: string | null;
}): DashboardData {
  const visibleTasks = tasks.filter(
    (task) =>
      task.organizationId === organizationId &&
      task.assignedUserId === userId &&
      (role !== "Staff" || task.kind !== "approval"),
  );
  const visibleActivity = activity.filter(
    (item) =>
      item.organizationId === organizationId &&
      (role === "Owner" || item.kind !== "expense") &&
      (role !== "Staff" || item.actorUserId === userId),
  );
  // Explicit fields prevent financial/private fields leaking through spreads.
  const visibleSummary =
    summary && role !== "Staff"
      ? {
          lowStockItems: summary.lowStockItems,
          pendingApprovals: summary.pendingApprovals,
          movementsToday: summary.movementsToday,
          movementChange: summary.movementChange,
          stock: {
            inStock: summary.stock.inStock,
            lowStock: summary.stock.lowStock,
            outOfStock: summary.stock.outOfStock,
            untracked: summary.stock.untracked,
          },
          ...(role === "Owner"
            ? {
                expensesMinor: summary.expensesMinor,
                expenseChange: summary.expenseChange,
              }
            : {}),
        }
      : null;
  return {
    ...identity,
    role,
    organizationId,
    actions: allowedActions(role),
    summary: visibleSummary,
    tasks: visibleTasks,
    activity: visibleActivity,
    updatedAt,
    state:
      summary || visibleTasks.length || visibleActivity.length
        ? "ready"
        : "empty",
    taskTotals: {
      completed: visibleTasks.filter((task) => task.status === "completed")
        .length,
      total: visibleTasks.length,
    },
  };
}

export function assertDashboardMembership(
  identity: { userId: string; organizationId: string; sessionStatus: string },
  membership: { userId: string; organizationId: string; role: string } | null,
): DashboardRole | null {
  if (
    identity.sessionStatus !== "active" ||
    !membership ||
    membership.userId !== identity.userId ||
    membership.organizationId !== identity.organizationId
  )
    return null;
  return dashboardRole(membership.role);
}
