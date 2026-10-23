import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { organizationArtwork } from "./artwork";
import {
  ColorIcon,
  EmptyCard,
  font,
  Icon,
  MetricCard,
  palette,
  SectionHeading,
  styles,
  useDashboardScale,
} from "./components";
import {
  ActivityList,
  CountSession,
  QuickActions,
  StockOverview,
  TaskList,
  TaskProgress,
} from "./sections";
import type { DashboardScreenProps, DashboardTab } from "./types";

export function DashboardScreen(props: DashboardScreenProps) {
  const { data, onAction } = props;
  const { s, v, f, insets } = useDashboardScale();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const summary = data.summary;
  const count = data.tasks.find(
    (task) => task.kind === "count" && task.status === "in_progress",
  );
  const number = (value?: number) =>
    value === undefined ? "—" : value.toLocaleString("en-NG");
  const change = summary?.movementChange;
  const movementText =
    change === null || change === undefined
      ? "View activity"
      : `${change >= 0 ? "+" : ""}${change}% vs yesterday`;
  const ageMinutes = data.updatedAt
    ? Math.max(
        0,
        Math.floor((now - new Date(data.updatedAt).getTime()) / 60000),
      )
    : 0;
  const updateLabel = props.preview
    ? "2m ago"
    : ageMinutes < 1
      ? "Just updated"
      : ageMinutes < 60
        ? `${ageMinutes}m ago`
        : ageMinutes < 1440
          ? `${Math.floor(ageMinutes / 60)}h ago`
          : new Date(data.updatedAt!).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            });
  const greeting = props.preview
    ? "Good morning"
    : new Date(now).getHours() < 12
      ? "Good morning"
      : new Date(now).getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FBFDFC" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />
      <View
        style={{ flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" }}
      >
        <ScrollView
          testID="dashboard-scroll"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={!!props.refreshing}
              onRefresh={props.onRefresh}
              tintColor={palette.teal}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: s(16),
            paddingTop: v(3),
            paddingBottom: v(20),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              minHeight: v(37),
              marginBottom: v(4),
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open workspace menu"
              onPress={props.onAccount}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: s(6),
                flex: 1,
                minHeight: 44,
              }}
            >
              <BrandLogo scale={s(0.55)} />
              <Icon name="down" color={palette.muted} size={s(13)} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={props.onNotifications}
              style={{
                minHeight: 44,
                minWidth: 44,
                alignItems: "center",
                justifyContent: "center",
                marginRight: s(10),
              }}
            >
              <Icon name="bell" size={s(24)} color="#006C66" />
              {data.tasks.some((task) => task.status !== "completed") ? (
                <View
                  style={{
                    position: "absolute",
                    right: s(9),
                    top: s(5),
                    width: s(9),
                    height: s(9),
                    borderRadius: 8,
                    backgroundColor: palette.red,
                  }}
                />
              ) : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Your account"
              onPress={props.onAccount}
              style={{
                width: s(33),
                height: s(33),
                backgroundColor: "#738C95",
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: f(12),
                  color: "white",
                }}
              >
                {data.initials}
              </Text>
            </Pressable>
          </View>

          <View
            style={{ flexDirection: "row", gap: s(12), marginBottom: v(8) }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch organisation. ${data.organizationName}. ${data.location}`}
              onPress={props.onSwitchOrganization}
              style={[
                styles.card,
                {
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: s(5),
                  gap: s(12),
                  minHeight: v(49),
                  boxShadow: "0 2px 5px rgba(31,55,82,.05)",
                },
              ]}
            >
              <Image
                source={organizationArtwork}
                style={{ width: s(39), height: s(36), borderRadius: s(6) }}
                contentFit="cover"
              />
              <View style={{ flex: 1, gap: v(2) }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: font.bold,
                    fontSize: f(12.8),
                    letterSpacing: -0.35,
                    color: palette.text,
                  }}
                >
                  {data.organizationName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: font.regular,
                    fontSize: f(11.5),
                    color: palette.muted,
                  }}
                >
                  {data.location}
                </Text>
              </View>
              <Icon name="down" size={s(15)} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh workspace status"
              onPress={props.onRefresh}
              style={{
                width: s(props.offline ? 111 : 96),
                minHeight: v(49),
                borderRadius: s(9),
                backgroundColor: props.offline
                  ? "#FFF5E5"
                  : data.updatedAt
                    ? "#ECFFF0"
                    : "#F1F5FA",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: s(8),
              }}
            >
              <ColorIcon
                name={props.offline ? "wifi" : "check"}
                color={
                  props.offline
                    ? palette.amber
                    : data.updatedAt
                      ? "#00980B"
                      : palette.muted
                }
                size={s(17)}
                circle
                soft={props.offline || !data.updatedAt}
              />
              <View style={{ gap: v(3) }}>
                <Text
                  style={{
                    fontFamily: font.semibold,
                    color: props.offline
                      ? palette.amber
                      : data.updatedAt
                        ? "#005C0C"
                        : palette.muted,
                    fontSize: f(12),
                  }}
                >
                  {props.offline
                    ? "Offline"
                    : data.updatedAt
                      ? "Synced"
                      : "No updates"}
                </Text>
                <Text
                  style={{
                    fontFamily: font.regular,
                    color: props.offline
                      ? "#B66B30"
                      : data.updatedAt
                        ? "#176E20"
                        : palette.muted,
                    fontSize: f(props.offline ? 7.7 : 10.5),
                  }}
                >
                  {props.offline
                    ? "Using cached data"
                    : data.updatedAt
                      ? updateLabel
                      : "Pull to refresh"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{ marginBottom: v(7), gap: v(2) }}>
            <Text
              accessibilityRole="header"
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={{
                fontFamily: font.bold,
                color: palette.text,
                fontSize: f(22),
                lineHeight: f(28),
                letterSpacing: -0.85,
              }}
            >
              {greeting}, {data.firstName} 👋
            </Text>
            <Text
              style={{
                fontFamily: font.regular,
                color: palette.muted,
                fontSize: f(13),
                lineHeight: f(18),
              }}
            >
              {data.role === "Owner"
                ? "Here’s what’s happening across your business today."
                : data.role === "Manager"
                  ? "Here are your key updates for today."
                  : "Here are your tasks for today."}
            </Text>
          </View>

          {props.error ? (
            <EmptyCard
              title="Couldn’t refresh your workspace"
              message={props.error}
              onPress={props.onRefresh}
              action="Try again"
            />
          ) : null}
          {data.state === "empty" ? (
            <EmptyCard
              title="Welcome to your workspace"
              message="Your dashboard will fill up as products, stock movements and team tasks are recorded."
            />
          ) : null}

          {data.role === "Owner" ? (
            <>
              <View
                style={{ flexDirection: "row", gap: s(10), marginBottom: v(9) }}
              >
                <MetricCard
                  title="Low Stock Items"
                  value={number(summary?.lowStockItems)}
                  tone="red"
                  icon="warning"
                  footer="View items"
                  onPress={() => onAction("stock")}
                />
                <MetricCard
                  title="Pending Approvals"
                  value={number(summary?.pendingApprovals)}
                  tone="amber"
                  icon="clock"
                  footer="Review now"
                  onPress={() => onAction("approvals")}
                />
              </View>
              <View style={{ flexDirection: "row", gap: s(10) }}>
                <MetricCard
                  title="Today’s Movements"
                  value={number(summary?.movementsToday)}
                  tone="teal"
                  icon="movements"
                  footer={movementText}
                  onPress={() => onAction("activity")}
                />
                <MetricCard
                  title="Today’s Expenses"
                  value={
                    summary?.expensesMinor === undefined
                      ? "—"
                      : `₦${(summary.expensesMinor / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`
                  }
                  tone="blue"
                  icon="card"
                  footer={
                    summary?.expenseChange === undefined ||
                    summary.expenseChange === null
                      ? "View expenses"
                      : `${summary.expenseChange >= 0 ? "+" : ""}${summary.expenseChange}% vs yesterday`
                  }
                  onPress={() => onAction("expense")}
                />
              </View>
              <SectionHeading
                title="Quick Actions"
                onSeeAll={() => props.onTab("more")}
              />
              <QuickActions data={data} onAction={onAction} />
              <SectionHeading
                title="Stock Overview"
                onSeeAll={() => onAction("stock")}
              />
              <StockOverview data={data} />
            </>
          ) : data.role === "Manager" ? (
            <>
              <CountSession
                task={count}
                onContinue={() => onAction("count", count)}
              />
              <View
                style={{ flexDirection: "row", gap: s(8), marginTop: v(8) }}
              >
                <MetricCard
                  compact
                  title="Low Stock"
                  value={number(summary?.lowStockItems)}
                  icon="warning"
                  tone="red"
                  footer="View items"
                  onPress={() => onAction("stock")}
                />
                <MetricCard
                  compact
                  title="Pending Review"
                  value={number(summary?.pendingApprovals)}
                  icon="clock"
                  tone="amber"
                  footer="Review now"
                  onPress={() => onAction("approvals")}
                />
                <MetricCard
                  compact
                  title="Today’s Movements"
                  value={number(summary?.movementsToday)}
                  icon="movements"
                  tone="teal"
                  footer={movementText}
                  onPress={() => onAction("activity")}
                />
              </View>
              <SectionHeading
                title="Quick Actions"
                onSeeAll={() => props.onTab("more")}
              />
              <QuickActions data={data} onAction={onAction} />
              <SectionHeading
                title="My Tasks"
                onSeeAll={props.onNotifications}
              />
              <TaskList
                tasks={data.tasks.filter((task) => task.status !== "completed")}
                staff={false}
                onTask={(task) =>
                  onAction(
                    task.kind === "approval" ? "approvals" : task.kind,
                    task,
                  )
                }
              />
            </>
          ) : (
            <>
              <SectionHeading
                title="Today’s Progress"
                onSeeAll={props.onNotifications}
              />
              <TaskProgress
                completed={data.taskTotals.completed}
                total={data.taskTotals.total}
              />
              <SectionHeading
                title="My Tasks"
                onSeeAll={props.onNotifications}
              />
              <TaskList
                tasks={data.tasks.filter((task) => task.status !== "completed")}
                staff
                onTask={(task) =>
                  onAction(
                    task.kind === "count"
                      ? "continue-count"
                      : task.kind === "approval"
                        ? "approvals"
                        : task.kind,
                    task,
                  )
                }
              />
              <SectionHeading title="Quick Actions" />
              <QuickActions data={data} onAction={onAction} />
            </>
          )}
          <SectionHeading
            title="Recent Activity"
            onSeeAll={() => onAction("activity")}
          />
          <ActivityList
            activity={data.activity}
            onActivity={() => onAction("activity")}
            preview={props.preview}
          />
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderColor: "#E5EDF3",
            backgroundColor: "white",
            paddingBottom: Math.max(insets.bottom, s(6)),
            paddingTop: s(5),
            height: Math.max(s(53), 44 + s(5) + 1) + Math.max(insets.bottom, s(6)),
          }}
        >
          {(
            [
              ["home", "Home", "home"],
              ["stock", "Stock", "box"],
              ["scan", "Scan", "scan"],
              ["activity", "Activity", "activity"],
              ["more", "More", "menu"],
            ] as const
          ).map(([tab, label, icon]) => (
            <Pressable
              testID={`dashboard-tab-${tab}`}
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === "home" }}
              accessibilityLabel={label}
              onPress={() => props.onTab(tab as DashboardTab)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-end",
                minHeight: 44,
                gap: s(3),
              }}
            >
              {tab === "scan" ? (
                <View
                  style={{
                    marginTop: -s(17),
                    width: s(47),
                    height: s(47),
                    borderRadius: 50,
                    backgroundColor: "#008B80",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 3px 6px rgba(0,111,99,.18)",
                  }}
                >
                  <Icon name="scan" size={s(25)} color="white" />
                </View>
              ) : (
                <Icon
                  name={icon}
                  size={s(23)}
                  color={tab === "home" ? "#006D66" : "#50618A"}
                />
              )}
              <Text
                style={{
                  fontFamily: tab === "home" ? font.bold : font.regular,
                  fontSize: f(10.7),
                  color: tab === "home" ? "#006D66" : palette.muted,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
