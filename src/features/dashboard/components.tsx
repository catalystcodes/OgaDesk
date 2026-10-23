import { Image } from "expo-image";
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dashboardIcon, tileFill, type DashboardIcon } from "./artwork";

export const palette = {
  text: "#0C103B",
  muted: "#64749E",
  teal: "#008C7D",
  border: "#E3EAF3",
  red: "#FF2F38",
  amber: "#FF9800",
  blue: "#0785FF",
};
export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extra: "Inter_800ExtraBold",
};

export function useDashboardScale() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width, 480) / 393;
  const density = Math.max(
    0.82,
    Math.min(
      1.04,
      (height - insets.top - insets.bottom - 54 * scale) / (835 * scale),
    ),
  );
  return {
    s: (n: number) => n * scale,
    v: (n: number) => n * scale * density,
    f: (n: number) => n * scale * (0.96 + 0.04 * density),
    insets,
  };
}

export function Icon({
  name,
  size = 24,
  color = palette.teal,
}: {
  name: DashboardIcon;
  size?: number;
  color?: string;
}) {
  return (
    <Image
      source={dashboardIcon(name, color)}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible={false}
    />
  );
}

export function ColorIcon({
  name,
  color = palette.teal,
  size = 34,
  circle = false,
  soft = false,
}: {
  name: DashboardIcon;
  color?: string;
  size?: number;
  circle?: boolean;
  soft?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: circle ? size / 2 : size * 0.22,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: soft ? `${color}14` : color,
      }}
    >
      {!soft && !circle ? (
        <Image
          source={tileFill(color)}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
        />
      ) : null}
      <Icon name={name} color={soft ? color : "white"} size={size * 0.59} />
    </View>
  );
}

export function SectionHeading({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  const { s, v, f } = useDashboardScale();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: v(8),
        marginBottom: v(4),
        minHeight: v(23),
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: font.bold,
          fontSize: f(18),
          letterSpacing: -0.55,
          color: palette.text,
        }}
      >
        {title}
      </Text>
      {onSeeAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`See all ${title.toLowerCase()}`}
          onPress={onSeeAll}
          hitSlop={11}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: s(5),
            minHeight: 22,
          }}
        >
          <Text
            style={{
              fontFamily: font.medium,
              fontSize: f(12.5),
              color: palette.muted,
            }}
          >
            See all
          </Text>
          <Icon name="arrow" color={palette.muted} size={s(16)} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function MetricCard({
  title,
  value,
  icon,
  tone,
  footer,
  onPress,
  compact = false,
}: {
  title: string;
  value: string;
  icon: DashboardIcon;
  tone: "red" | "amber" | "teal" | "blue";
  footer: string;
  onPress: () => void;
  compact?: boolean;
}) {
  const { s, v, f } = useDashboardScale();
  const colors = {
    red: ["#FFF5F6", "#FFDCDD", "#EC0010"],
    amber: ["#FFFAF0", "#FFE6B8", "#B83F00"],
    teal: ["#F0FBFA", "#D0EEEC", palette.teal],
    blue: ["#F0F8FF", "#D2E8FF", palette.blue],
  }[tone];
  const accent = tone === "red" || tone === "amber";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}. ${footer}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        minHeight: v(compact ? 94 : 104),
        paddingHorizontal: s(compact ? 12 : 17),
        paddingVertical: v(6),
        borderRadius: s(9),
        backgroundColor: colors[0],
        borderColor: colors[1],
        borderWidth: 1,
        opacity: pressed ? 0.75 : 1,
        justifyContent: "space-between",
      })}
    >
      <ColorIcon
        name={icon}
        color={
          tone === "amber"
            ? palette.amber
            : tone === "red"
              ? palette.red
              : tone === "blue"
                ? palette.blue
                : palette.teal
        }
        circle
        size={s(compact ? 20 : 22)}
      />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{
          fontFamily: font.semibold,
          color: accent ? colors[2] : palette.text,
          fontSize: f(compact ? 10.5 : 12),
          marginTop: v(2),
        }}
      >
        {title}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{
          fontFamily: font.bold,
          fontVariant: ["tabular-nums"],
          fontSize: f(compact ? 25 : 28),
          lineHeight: f(compact ? 30 : 32),
          letterSpacing: -0.9,
          color: accent ? colors[2] : palette.text,
        }}
      >
        {value}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: s(4) }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors[2],
            fontFamily: font.medium,
            fontSize: f(compact ? 10 : 12),
            flexShrink: 1,
          }}
        >
          {footer}
        </Text>
        <Icon
          name={accent ? "arrow" : "up"}
          color={accent ? colors[2] : palette.teal}
          size={s(compact ? 13 : 14)}
        />
      </View>
    </Pressable>
  );
}

export function EmptyCard({
  title,
  message,
  onPress,
  action,
}: {
  title: string;
  message: string;
  onPress?: () => void;
  action?: string;
}) {
  const { s, f } = useDashboardScale();
  return (
    <View style={[styles.card, { padding: s(18), gap: s(8) }]}>
      <Text
        style={{
          fontFamily: font.semibold,
          color: palette.text,
          fontSize: f(15),
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: font.regular,
          color: palette.muted,
          fontSize: f(12.5),
          lineHeight: f(19),
        }}
      >
        {message}
      </Text>
      {onPress && action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text
            style={{
              fontFamily: font.semibold,
              color: palette.teal,
              fontSize: f(13),
            }}
          >
            {action} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "white",
  },
});
