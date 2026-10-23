export type DashboardRole = "Owner" | "Manager" | "Staff";
export type DashboardAction =
  | "receive"
  | "dispatch"
  | "count"
  | "continue-count"
  | "scan"
  | "stock"
  | "expense"
  | "approvals"
  | "activity"
  | "reports"
  | "team";
export type DashboardTab = "home" | "stock" | "scan" | "activity" | "more";
export type DashboardTask = {
  id: string;
  organizationId: string;
  assignedUserId: string;
  kind: "receive" | "dispatch" | "count" | "scan" | "approval";
  title: string;
  detail: string;
  status: "pending" | "in_progress" | "completed";
  completedUnits: number;
  totalUnits: number;
  startedAt: string | null;
  locationName?: string;
};
export type DashboardActivity = {
  id: string;
  organizationId: string;
  actorUserId: string;
  kind: "receive" | "dispatch" | "count" | "adjustment" | "expense";
  title: string;
  detail: string;
  actorLabel: string;
  occurredAt: string;
};
export type DashboardSummary = {
  lowStockItems: number;
  pendingApprovals: number;
  movementsToday: number;
  movementChange: number | null;
  expensesMinor?: number;
  expenseChange?: number | null;
  stock: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    untracked: number;
  };
};
export type DashboardData = {
  role: DashboardRole;
  organizationId: string;
  organizationName: string;
  location: string;
  firstName: string;
  initials: string;
  actions: DashboardAction[];
  state: "ready" | "empty";
  updatedAt: string | null;
  summary: DashboardSummary | null;
  tasks: DashboardTask[];
  activity: DashboardActivity[];
  taskTotals: { completed: number; total: number };
};
export type DashboardScreenProps = {
  data: DashboardData;
  preview?: boolean;
  offline?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh: () => void;
  onSwitchOrganization: () => void;
  onAccount: () => void;
  onNotifications: () => void;
  onAction: (action: DashboardAction, task?: DashboardTask) => void;
  onTab: (tab: DashboardTab) => void;
};
