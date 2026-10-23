import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/constants/theme";

export function AuthLoadingScreen({
  message = "Opening OgaDesk…",
}: {
  message?: string;
}) {
  return (
    <View style={styles.screen}>
      <BrandLogo />
      <ActivityIndicator color={colors.primary} style={styles.indicator} />
      <Text accessibilityLiveRegion="polite" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  indicator: { marginTop: 28 },
  message: { color: colors.textSecondary, fontSize: 16, marginTop: 12 },
});
