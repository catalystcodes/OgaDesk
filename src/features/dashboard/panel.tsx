import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ColorIcon,
  EmptyCard,
  font,
  Icon,
  palette,
  useDashboardScale,
} from "./components";
import { ActivityList, StockOverview, TaskList } from "./sections";
import type { DashboardAction, DashboardData, DashboardTask } from "./types";

export type DashboardPanel = DashboardAction | "tasks" | "more" | null;
export const actionTitles: Record<DashboardAction, string> = {
  receive: "Receive stock",
  dispatch: "Dispatch stock",
  count: "Start stock count",
  "continue-count": "Continue counting",
  scan: "Scan product",
  stock: "Stock overview",
  expense: "Expenses",
  approvals: "Pending approvals",
  activity: "Recent activity",
  reports: "Reports",
  team: "Team",
};

export function DashboardDetailPanel({
  panel,
  task,
  data,
  onClose,
  onAction,
  onAccount,
  onSwitchOrganization,
  preview,
}: {
  panel: DashboardPanel;
  task?: DashboardTask;
  data: DashboardData;
  onClose: () => void;
  onAction: (action: DashboardAction, task?: DashboardTask) => void;
  onAccount: () => void;
  onSwitchOrganization: () => void;
  preview?: boolean;
}) {
  const { s, f } = useDashboardScale();
  if (!panel) return null;
  const tasks =
    panel === "tasks"
      ? data.tasks
      : data.tasks.filter((item) =>
          panel === "continue-count"
            ? item.kind === "count"
            : panel === "approvals"
              ? item.kind === "approval"
              : item.kind === panel,
        );
  return (
    <Modal
      visible={!!panel}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBFDFC" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: s(18),
            paddingVertical: s(14),
            gap: s(12),
            borderBottomWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: font.bold,
              fontSize: f(22),
              color: palette.text,
              flex: 1,
            }}
          >
            {panel === "more"
              ? "Workspace"
              : panel === "tasks"
                ? "Your tasks"
                : panel
                  ? actionTitles[panel]
                  : ""}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close dashboard details"
            onPress={onClose}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: s(18),
            gap: s(16),
            maxWidth: 600,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {panel === "more" ? (
            <>
              <Text
                style={{
                  fontFamily: font.semibold,
                  color: palette.text,
                  fontSize: f(18),
                }}
              >
                {data.organizationName}
              </Text>
              <Text style={{ fontFamily: font.regular, color: palette.muted }}>
                {data.role} · {data.location}
              </Text>
              {data.actions.map((action) => (
                <Pressable
                  key={action}
                  accessibilityRole="button"
                  onPress={() => onAction(action)}
                  style={{
                    minHeight: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: font.medium,
                      fontSize: f(15),
                      color: palette.text,
                      flex: 1,
                    }}
                  >
                    {actionTitles[action]}
                  </Text>
                  <Icon name="chevron" size={18} />
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={onSwitchOrganization}
                style={{ minHeight: 48, justifyContent: "center" }}
              >
                <Text
                  style={{ fontFamily: font.semibold, color: palette.teal }}
                >
                  Switch organisation
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onAccount}
                style={{ minHeight: 48, justifyContent: "center" }}
              >
                <Text
                  style={{ fontFamily: font.semibold, color: palette.teal }}
                >
                  Account and sign out
                </Text>
              </Pressable>
            </>
          ) : task ? (
            <>
              <ColorIcon
                name={
                  task.kind === "count"
                    ? "box"
                    : task.kind === "dispatch"
                      ? "truck"
                      : "receipt"
                }
                size={52}
                soft
              />
              <Text
                style={{
                  fontFamily: font.bold,
                  color: palette.text,
                  fontSize: f(23),
                }}
              >
                {task.title}
              </Text>
              <Text
                style={{
                  fontFamily: font.regular,
                  color: palette.muted,
                  fontSize: f(15),
                  lineHeight: f(23),
                }}
              >
                {task.detail}
              </Text>
              <Text style={{ fontFamily: font.medium, color: palette.teal }}>
                Status: {task.status.replaceAll("_", " ")}
              </Text>
              {task.totalUnits ? (
                <Text
                  style={{ fontFamily: font.semibold, color: palette.text }}
                >
                  {task.completedUnits} of {task.totalUnits} completed
                </Text>
              ) : null}
              <EmptyCard
                title="Task details"
                message="This dashboard shows your assigned work. Stock recording and counting are handled in the stock workflow."
              />
            </>
          ) : panel === "stock" || panel === "reports" ? (
            <StockOverview data={data} />
          ) : panel === "activity" ? (
            <ActivityList
              activity={data.activity}
              limit={data.activity.length}
              onActivity={() => {}}
              preview={preview}
            />
          ) : panel === "expense" ? (
            <>
              <Text
                style={{
                  fontFamily: font.bold,
                  fontSize: f(30),
                  color: palette.text,
                }}
              >
                {data.summary?.expensesMinor === undefined
                  ? "—"
                  : `₦${(data.summary.expensesMinor / 100).toLocaleString("en-NG")}`}
              </Text>
              <ActivityList
                limit={data.activity.length}
                activity={data.activity.filter(
                  (item) => item.kind === "expense",
                )}
                onActivity={() => {}}
                preview={preview}
              />
            </>
          ) : tasks.length ? (
            <TaskList
              tasks={tasks}
              limit={tasks.length}
              staff={data.role === "Staff"}
              onTask={(item) =>
                onAction(
                  item.kind === "count" && data.role === "Staff"
                    ? "continue-count"
                    : item.kind === "approval"
                      ? "approvals"
                      : item.kind,
                  item,
                )
              }
            />
          ) : (
            <EmptyCard
              title={
                panel === "tasks"
                  ? "No tasks assigned"
                  : panel === "approvals"
                    ? "Nothing waiting for review"
                    : "No records yet"
              }
              message={
                panel === "scan"
                  ? "Product scanning is part of the stock workflow. Your dashboard gives you access to your stock and assigned tasks."
                  : "Records for this workspace will appear here as your team starts recording work."
              }
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
