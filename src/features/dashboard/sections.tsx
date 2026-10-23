import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { ringChart } from "./artwork";
import {
  ColorIcon,
  EmptyCard,
  font,
  Icon,
  palette,
  styles,
  useDashboardScale,
} from "./components";
import type {
  DashboardAction,
  DashboardActivity,
  DashboardData,
  DashboardTask,
} from "./types";

export function QuickActions({
  data,
  onAction,
}: {
  data: DashboardData;
  onAction: (action: DashboardAction) => void;
}) {
  const { s, v, f } = useDashboardScale();
  const items =
    data.role === "Owner"
      ? ([
          ["receive", "Receive\nStock", "plus", palette.teal],
          ["dispatch", "Dispatch\nStock", "minus", palette.red],
          ["count", "Start\nCount", "barcode", palette.amber],
          ["expense", "Record\nExpense", "receipt", palette.blue],
        ] as const)
      : data.role === "Manager"
        ? ([
            ["receive", "Receive\nStock", "plus", palette.teal],
            ["dispatch", "Dispatch\nStock", "minus", palette.red],
            ["scan", "Scan\nProduct", "barcode", palette.blue],
            ["count", "Start\nCount", "barcode", palette.amber],
          ] as const)
        : ([
            ["receive", "Receive\nStock", "plus", palette.teal],
            ["dispatch", "Dispatch\nStock", "minus", palette.red],
            ["scan", "Scan\nProduct", "barcode", palette.amber],
            ["stock", "View\nStock", "receipt", palette.blue],
          ] as const);
  return (
    <View style={{ flexDirection: "row", gap: s(9) }}>
      {items
        .filter(([action]) => data.actions.includes(action))
        .map(([action, title, icon, color]) => (
          <Pressable
            key={action}
            accessibilityRole="button"
            accessibilityLabel={title.replace("\n", " ")}
            onPress={() => onAction(action)}
            style={({ pressed }) => [
              styles.card,
              {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                minHeight: v(87),
                gap: v(6),
                paddingVertical: v(9),
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <ColorIcon name={icon} color={color} size={s(33)} />
            <Text
              style={{
                fontFamily: font.semibold,
                color: palette.text,
                fontSize: f(11.2),
                lineHeight: f(13),
                textAlign: "center",
              }}
            >
              {title}
            </Text>
          </Pressable>
        ))}
    </View>
  );
}

export function StockOverview({ data }: { data: DashboardData }) {
  const { s, v, f } = useDashboardScale();
  const stock = data.summary?.stock;
  if (!stock)
    return (
      <EmptyCard
        title="Your stock at a glance"
        message="Your product totals will appear here once stock is recorded."
      />
    );
  const parts = [
    { value: stock.inStock, color: "#009C8A", label: "In Stock" },
    { value: stock.lowStock, color: "#FF9800", label: "Low Stock" },
    { value: stock.outOfStock, color: "#FF3039", label: "Out of Stock" },
    { value: stock.untracked, color: "#AEBAC4", label: "Untracked" },
  ];
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const percentages = parts.map((part) =>
    total ? Math.round((part.value / total) * 100) : 0,
  );
  if (total) {
    // Untracked is the residual category, keeping rounded labels at 100%.
    percentages[3] = Math.max(
      0,
      100 - percentages.slice(0, 3).reduce((sum, n) => sum + n, 0),
    );
    const remainder = 100 - percentages.reduce((sum, n) => sum + n, 0);
    if (remainder) {
      const largest = parts.reduce(
        (index, part, current) =>
          part.value > parts[index].value ? current : index,
        0,
      );
      percentages[largest] += remainder;
    }
  }
  return (
    <View
      accessibilityLabel={`${total.toLocaleString()} total products`}
      style={[
        styles.card,
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: s(12),
          paddingVertical: v(5),
          gap: s(22),
        },
      ]}
    >
      <View
        style={{
          width: s(118),
          height: v(108),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={ringChart(parts, total)}
          contentFit="contain"
          style={{ width: s(114), height: v(110) }}
        />
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: font.bold,
              fontSize: f(19),
              color: palette.text,
              letterSpacing: -0.7,
            }}
          >
            {total.toLocaleString()}
          </Text>
          <Text
            style={{
              fontFamily: font.regular,
              color: palette.muted,
              fontSize: f(8.3),
              marginTop: v(2),
            }}
          >
            Total Products
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: v(10) }}>
        {parts.map((part, index) => (
          <View
            key={part.label}
            style={{ flexDirection: "row", alignItems: "center", gap: s(10) }}
          >
            <View
              style={{
                width: s(10),
                height: s(10),
                borderRadius: 10,
                backgroundColor: part.color,
              }}
            />
            <Text
              style={{
                color: palette.text,
                fontFamily: font.semibold,
                fontSize: f(12),
                minWidth: s(35),
              }}
            >
              {part.value.toLocaleString()}
            </Text>
            <Text
              style={{
                color: palette.muted,
                fontFamily: font.regular,
                fontSize: f(11.5),
                flex: 1,
              }}
              numberOfLines={1}
            >
              {part.label}
            </Text>
            <Text
              style={{
                color: palette.muted,
                fontFamily: font.regular,
                fontSize: f(11.5),
              }}
            >
              {percentages[index]}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function CountSession({
  task,
  onContinue,
}: {
  task?: DashboardTask;
  onContinue: () => void;
}) {
  const { s, v, f } = useDashboardScale();
  if (!task)
    return (
      <EmptyCard
        title="No active stock count"
        message="Start a count to check your stock against the quantities on record."
        onPress={onContinue}
        action="Start count"
      />
    );
  const percent = task.totalUnits
    ? Math.min(100, Math.round((task.completedUnits / task.totalUnits) * 100))
    : 0;
  return (
    <View
      style={{
        borderColor: "#D2F1E2",
        backgroundColor: "#F0FDF7",
        borderWidth: 1,
        borderRadius: s(10),
        padding: s(12),
        gap: v(9),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: s(12) }}>
        <ColorIcon name="box" size={s(38)} circle />
        <View style={{ flex: 1, gap: v(2) }}>
          <Text
            style={{
              fontFamily: font.bold,
              color: palette.text,
              fontSize: f(14),
              letterSpacing: -0.3,
            }}
          >
            Active Stock Count Session
          </Text>
          <Text
            style={{
              fontFamily: font.regular,
              color: palette.muted,
              fontSize: f(11.5),
            }}
          >
            {task.locationName || task.detail}
            {task.startedAt
              ? ` · Started ${new Date(task.startedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).toUpperCase()}`
              : ""}
          </Text>
        </View>
        <Text
          style={{
            color: "#008019",
            backgroundColor: "#D9F9E7",
            fontFamily: font.semibold,
            fontSize: f(9),
            paddingHorizontal: s(9),
            paddingVertical: v(4),
            borderRadius: s(15),
          }}
        >
          In Progress
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: font.semibold,
            color: palette.text,
            fontSize: f(13),
          }}
        >
          {task.completedUnits} / {task.totalUnits} counted
        </Text>
        <Text
          style={{
            fontFamily: font.semibold,
            color: palette.muted,
            fontSize: f(12),
          }}
        >
          {percent}%
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: task.totalUnits,
          now: task.completedUnits,
        }}
        style={{
          height: v(10),
          backgroundColor: "#D4DCE5",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: palette.teal,
            borderRadius: 12,
          }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onContinue}
        style={{
          backgroundColor: "#00776C",
          minHeight: v(36),
          borderRadius: s(8),
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: s(10),
        }}
      >
        <Text
          style={{ color: "white", fontFamily: font.semibold, fontSize: f(14) }}
        >
          Continue Counting
        </Text>
        <Icon name="arrow" color="white" size={s(19)} />
      </Pressable>
    </View>
  );
}

export function TaskProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const { s, v, f } = useDashboardScale();
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <View style={{ flexDirection: "row", gap: s(9) }}>
      <View
        style={[
          styles.card,
          {
            flex: 2.25,
            minHeight: v(91),
            padding: s(7),
            flexDirection: "row",
            alignItems: "center",
            gap: s(9),
          },
        ]}
      >
        <View
          style={{
            width: s(79),
            height: s(79),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={ringChart(
              [{ value: completed, color: "#008F80" }],
              total,
              true,
            )}
            style={{ width: "100%", height: "100%" }}
          />
          <Text
            style={{
              position: "absolute",
              color: palette.text,
              fontFamily: font.bold,
              fontSize: f(18),
              letterSpacing: -0.8,
            }}
          >
            {percent}%
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: palette.text,
              fontFamily: font.bold,
              fontSize: f(16),
              letterSpacing: -0.4,
            }}
          >
            {completed} of {total}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={{
              color: palette.muted,
              fontFamily: font.regular,
              fontSize: f(10.5),
              marginTop: v(3),
            }}
          >
            tasks completed
          </Text>
        </View>
      </View>
      {[
        [
          "clock",
          Math.max(0, total - completed),
          "Remaining",
          "#FFF5F5",
          "#FFDDDF",
          "#E00000",
        ],
        ["check", total, "Total tasks", "#F0F8FF", "#D3E9FF", palette.blue],
      ].map(([icon, count, label, bg, border, color]) => (
        <View
          key={String(label)}
          style={{
            flex: 0.75,
            minWidth: 0,
            borderRadius: s(8),
            borderWidth: 1,
            borderColor: String(border),
            backgroundColor: String(bg),
            padding: s(11),
            justifyContent: "space-between",
          }}
        >
          <ColorIcon
            name={icon as "clock" | "check"}
            circle
            color={String(color)}
            size={s(22)}
          />
          <Text
            style={{
              fontFamily: font.bold,
              fontSize: f(26),
              color: icon === "clock" ? "#AB1C11" : palette.text,
              lineHeight: f(31),
            }}
          >
            {count}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: font.regular,
              color: icon === "clock" ? "#AA3932" : palette.muted,
              fontSize: f(10.5),
            }}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function TaskList({
  tasks,
  staff,
  onTask,
  limit = 4,
}: {
  tasks: DashboardTask[];
  staff: boolean;
  onTask: (task: DashboardTask) => void;
  limit?: number;
}) {
  const { s, v, f } = useDashboardScale();
  if (!tasks.length)
    return (
      <EmptyCard
        title="You’re up to date"
        message="Your assigned tasks will appear here."
      />
    );
  return (
    <View style={[styles.card, { paddingHorizontal: s(9) }]}>
      {tasks.slice(0, limit).map((task, index) => {
        const icon =
          task.kind === "count"
            ? staff
              ? "bars"
              : "box"
            : task.kind === "approval"
              ? "clock"
              : task.kind === "dispatch"
                ? staff
                  ? "truck"
                  : "receipt"
                : task.kind === "scan"
                  ? "barcode"
                  : staff
                    ? "box"
                    : "truck";
        const color =
          (task.kind === "count" && staff) || task.kind === "approval"
            ? palette.amber
            : task.kind === "dispatch"
              ? palette.red
              : task.kind === "scan"
                ? "#6154CF"
                : task.kind === "receive" && !staff
                  ? palette.blue
                  : palette.teal;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${task.title}. ${task.detail}`}
            key={task.id}
            onPress={() => onTask(task)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: s(12),
              minHeight: v(staff ? 51 : 40),
              paddingVertical: v(5),
              borderTopWidth: index ? 1 : 0,
              borderColor: "#EDF1F6",
            }}
          >
            <ColorIcon
              name={icon}
              color={color}
              soft
              size={s(staff ? 37 : 28)}
              circle={!staff}
            />
            <View style={{ flex: 1, gap: v(2) }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: font.semibold,
                  color: palette.text,
                  fontSize: f(12.3),
                  letterSpacing: -0.3,
                }}
              >
                {task.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: font.regular,
                  color: palette.muted,
                  fontSize: f(10.5),
                }}
              >
                {task.detail}
              </Text>
            </View>
            {staff ? (
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: f(11.5),
                  color:
                    task.status === "in_progress" ? palette.blue : palette.teal,
                  backgroundColor:
                    task.status === "in_progress" ? "#E9F5FF" : "#E7FBF4",
                  borderRadius: s(20),
                  paddingVertical: v(6),
                  textAlign: "center",
                  minWidth: s(75),
                }}
              >
                {task.status === "in_progress" ? "Continue" : "Start"}
              </Text>
            ) : null}
            <Icon name="chevron" color="#8B9ABA" size={s(15)} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function ActivityList({
  activity,
  onActivity,
  preview = false,
  limit = 4,
}: {
  activity: DashboardActivity[];
  onActivity: () => void;
  preview?: boolean;
  limit?: number;
}) {
  const { s, v, f } = useDashboardScale();
  if (!activity.length)
    return (
      <EmptyCard
        title="No activity yet"
        message="Stock movements and completed work will appear here."
      />
    );
  return (
    <View
      style={[styles.card, { paddingHorizontal: s(8), overflow: "hidden" }]}
    >
      {activity.slice(0, limit).map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          onPress={onActivity}
          style={{
            flexDirection: "row",
            gap: s(17),
            alignItems: "flex-start",
            paddingTop: v(5),
          }}
        >
          <ColorIcon
            name={
              item.kind === "dispatch"
                ? "minus"
                : item.kind === "expense" || item.kind === "adjustment"
                  ? "people"
                  : "plus"
            }
            color={
              item.kind === "dispatch"
                ? palette.red
                : item.kind === "expense" || item.kind === "adjustment"
                  ? palette.amber
                  : palette.teal
            }
            soft
            circle
            size={s(37)}
          />
          <View
            style={{
              flex: 1,
              borderBottomColor: "#E8EDF4",
              borderBottomWidth: index < activity.length - 1 ? 1 : 0,
              paddingBottom: v(5),
              minHeight: v(44),
            }}
          >
            <View style={{ flexDirection: "row", gap: s(5) }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: font.semibold,
                  color: palette.text,
                  fontSize: f(11.7),
                  flex: 1,
                  letterSpacing: -0.2,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontFamily: font.regular,
                  color: palette.muted,
                  fontSize: f(10.7),
                }}
              >
                {preview
                  ? ["10:24 AM", "09:18 AM", "08:45 AM", "Yesterday"][index]
                  : new Date(item.occurredAt).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </Text>
            </View>
            {item.detail ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: font.regular,
                  color: palette.muted,
                  fontSize: f(10.6),
                  marginTop: v(1),
                }}
              >
                {item.detail}
              </Text>
            ) : null}
            {item.actorLabel ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: font.regular,
                  color: palette.muted,
                  fontSize: f(10.6),
                  marginTop: v(1),
                }}
              >
                {item.actorLabel}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
