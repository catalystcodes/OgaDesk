import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

const features = [
  {
    label: "Track Stock",
    path: "M6 8h5v5H6zM13 8h5v5h-5zM6 15h5v5H6zM13 15h5v5h-5z",
  },
  {
    label: "Manage Orders",
    path: "M5 6h14v14H5zM8 4v5M12 4v5M16 4v5M8 12h8M8 16h8",
  },
  {
    label: "Record Expenses",
    path: "M7 4h10v17l-2-1-3 1-3-1-2 1V4ZM10 9h4M10 13h4M10 17h3",
  },
  {
    label: "Work Offline",
    path: "m6 12 4 4 8-8M5 8a10 10 0 0 1 14 0M8 5l2 2M14 5l2 2",
  },
] as const;

export function FeatureCard({ scale }: { scale: number }) {
  return (
    <View
      style={[styles.card, { padding: 16 * scale, borderRadius: 15 * scale }]}
    >
      {features.map(({ label, path }) => (
        <View
          key={label}
          style={[styles.row, { minHeight: 36 * scale, gap: 18 * scale }]}
        >
          <View
            style={[styles.icon, { width: 25 * scale, height: 25 * scale }]}
          >
            <Image
              source={{
                uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="none" stroke="white" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/></svg>`)}`,
              }}
              style={{ width: 19 * scale, height: 19 * scale }}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[
              styles.label,
              { fontSize: 16 * scale, paddingRight: 12 * scale },
            ]}
          >
            {label}
          </Text>
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.chevron, { fontSize: 25 * scale }]}
          >
            ›
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFC",
    boxShadow: "0 8px 24px rgba(15, 58, 57, 0.1)",
  },
  row: { flexDirection: "row", alignItems: "center" },
  icon: {
    borderRadius: 50,
    backgroundColor: "#009A7B",
    justifyContent: "center",
    alignItems: "center",
  },
  label: { color: colors.text, flex: 1, paddingRight: 12 },
  chevron: {
    position: "absolute",
    right: 0,
    color: "#CCD9DF",
    fontWeight: "300",
  },
});
