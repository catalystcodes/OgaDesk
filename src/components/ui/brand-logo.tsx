import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { brandMark } from "@/components/auth/artwork";
import { colors } from "@/constants/theme";

export function BrandLogo({ scale = 1 }: { scale?: number }) {
  return (
    <View style={styles.logo} accessible accessibilityLabel="OgaDesk">
      <Image
        source={brandMark}
        contentFit="contain"
        style={{ width: 46 * scale, height: 48 * scale }}
      />
      <Text style={[styles.wordmark, { fontSize: 32 * scale }]}>
        Oga<Text style={styles.accent}>Desk</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordmark: { color: colors.text, fontWeight: "800", letterSpacing: -1.4 },
  accent: { color: colors.primary },
});
