import { allowedActions } from "./permissions";
import type {
  DashboardActivity,
  DashboardData,
  DashboardRole,
  DashboardTask,
} from "./types";

// Reference-only data. Imported exclusively by the development preview route.
export function dashboardFixture(role: DashboardRole): DashboardData {
  const organizationId = "preview-kano";
  const actorUserId = "preview-user";
  const makeTask = (
    id: string,
    kind: DashboardTask["kind"],
    title: string,
    detail: string,
    inProgress = false,
  ): DashboardTask => ({
    id,
    organizationId,
    assignedUserId: actorUserId,
    kind,
    title,
    detail,
    status: inProgress ? "in_progress" : "pending",
    completedUnits: kind === "count" ? 14 : 0,
    totalUnits: kind === "count" ? 50 : 0,
    startedAt: inProgress ? "2026-10-21T09:15:00+01:00" : null,
    locationName: kind === "count" ? "Aisle B" : undefined,
  });
  const makeActivity = (
    id: string,
    kind: DashboardActivity["kind"],
    title: string,
    detail: string,
    actorLabel = "",
  ): DashboardActivity => ({
    id,
    kind,
    organizationId,
    actorUserId,
    title,
    detail,
    actorLabel,
    occurredAt: "2026-10-21T10:24:00+01:00",
  });
  return {
    role,
    organizationId,
    organizationName: "Kano Agro Distributors",
    location: "HQ Warehouse",
    firstName:
      role === "Owner" ? "Umar" : role === "Manager" ? "Musa" : "Aisha",
    initials: role === "Owner" ? "UF" : role === "Manager" ? "MA" : "AB",
    actions: allowedActions(role),
    state: "ready",
    updatedAt: "2026-10-21T10:24:00+01:00",
    summary: {
      lowStockItems: 4,
      pendingApprovals: role === "Owner" ? 2 : 1,
      movementsToday: 18,
      movementChange: 12,
      ...(role === "Owner" ? { expensesMinor: 4520000, expenseChange: 8 } : {}),
      stock: { inStock: 1210, lowStock: 56, outOfStock: 28, untracked: 188 },
    },
    tasks:
      role === "Staff"
        ? [
            makeTask(
              "receive",
              "receive",
              "Receive incoming stock",
              "2 deliveries expected",
            ),
            makeTask(
              "count",
              "count",
              "Continue Aisle B count",
              "14 of 50 products counted",
              true,
            ),
            makeTask(
              "dispatch",
              "dispatch",
              "Dispatch customer orders",
              "3 orders pending",
            ),
            makeTask(
              "scan",
              "scan",
              "Scan and verify products",
              "Verify 10 items",
            ),
          ]
        : [
            makeTask(
              "count",
              "count",
              "Continue Aisle B count",
              "14 of 50 products counted",
              true,
            ),
            makeTask(
              "approval",
              "approval",
              "Review 1 stock adjustment",
              "Needs your approval",
            ),
            makeTask(
              "receive",
              "receive",
              "Receive incoming stock",
              "3 deliveries expected",
            ),
            makeTask(
              "dispatch",
              "dispatch",
              "Dispatch customer orders",
              "5 pending",
            ),
          ],
    activity:
      role === "Owner"
        ? [
            makeActivity(
              "a1",
              "receive",
              "Received 20 CTN",
              "Indomie Instant Noodles (IND-001)",
              "Musa A. - Staff",
            ),
            makeActivity(
              "a2",
              "dispatch",
              "Dispatched 5 CTN",
              "Golden Penny Semovita (GP-002)",
              "Aisha K. - Staff",
            ),
            makeActivity(
              "a3",
              "expense",
              "Transport Expense (₦12,000)",
              "Ibrahim S. - Manager",
            ),
            makeActivity(
              "a4",
              "receive",
              "Received 10 CTN",
              "Milo Chocolate Drink (MIL-004)",
            ),
          ]
        : role === "Manager"
          ? [
              makeActivity(
                "a1",
                "receive",
                "Received 50 CTN",
                "Indomie Instant Noodles (IND-001)",
                "Musa A. - Warehouse Team",
              ),
              makeActivity(
                "a2",
                "dispatch",
                "Dispatched 5 CTN",
                "Golden Penny Semovita (GP-002)",
                "Aisha K. - Logistics",
              ),
              makeActivity(
                "a3",
                "adjustment",
                "Stock adjustment submitted",
                "Aisle C - 3 items",
              ),
            ]
          : [
              makeActivity(
                "a1",
                "count",
                "Scanned 20 items",
                "Aisle B - General Stock",
              ),
              makeActivity(
                "a2",
                "dispatch",
                "Dispatched 5 CTN",
                "Customer Order #OD-2847",
              ),
              makeActivity(
                "a3",
                "receive",
                "Received 10 CTN",
                "Supplier: Kano Foods",
              ),
            ],
    taskTotals: { completed: 3, total: 5 },
  };
}
