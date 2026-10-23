import { Image } from "expo-image";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { BrandLogo } from "@/components/ui/brand-logo";

import { appleIcon, googleIcon, socialIllustration } from "./artwork";

export type Provider = "Google" | "Apple";
type LegalDocument = "Terms of Service" | "Privacy Policy";

type SignInScreenProps = {
  onSignIn: (provider: Provider) => void;
  onOpenLegal: (document: LegalDocument) => void;
  pendingProvider?: Provider | null;
  disabled?: boolean;
  error?: string | null;
};

export function SignInScreen({
  onSignIn,
  onOpenLegal,
  pendingProvider = null,
  disabled = false,
  error,
}: SignInScreenProps) {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 393, 1.15);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.content, { paddingTop: 25 * scale }]}>
          <BrandLogo scale={scale} />

          <View style={{ marginTop: 62 * scale }}>
            <Text
              accessibilityRole="header"
              style={[
                styles.heading,
                { fontSize: 35 * scale, lineHeight: 40 * scale },
              ]}
            >
              Welcome to OgaDesk
            </Text>
            <Text
              style={[
                styles.subtitle,
                { fontSize: 22 * scale, lineHeight: 28 * scale },
              ]}
            >
              Sign in to your account to{"\n"}continue to OgaDesk.
            </Text>
          </View>

          <Image
            source={socialIllustration}
            contentFit="contain"
            style={[
              styles.illustration,
              {
                height: 202 * scale,
                marginTop: 10 * scale,
                marginBottom: 24 * scale,
              },
            ]}
          />

          <View style={{ gap: 12 * scale }}>
            {(["Google", "Apple"] as const).map((provider) => (
              <Pressable
                key={provider}
                accessibilityRole="button"
                accessibilityLabel={`Continue with ${provider}`}
                accessibilityState={{
                  disabled: disabled || pendingProvider !== null,
                  busy: pendingProvider === provider,
                }}
                disabled={disabled || pendingProvider !== null}
                onPress={() => onSignIn(provider)}
                style={({ pressed }) => [
                  styles.providerButton,
                  {
                    minHeight: 76 * scale,
                    paddingLeft: 110 * scale,
                    paddingRight: 20 * scale,
                  },
                  pressed && styles.providerButtonPressed,
                  (disabled ||
                    (pendingProvider !== null &&
                      pendingProvider !== provider)) &&
                    styles.providerButtonDisabled,
                ]}
              >
                {pendingProvider === provider ? (
                  <ActivityIndicator
                    color={colors.primary}
                    style={[styles.providerIcon, { left: 51 * scale }]}
                  />
                ) : (
                  <Image
                    source={provider === "Google" ? googleIcon : appleIcon}
                    contentFit="contain"
                    style={[
                      styles.providerIcon,
                      {
                        width: 40 * scale,
                        height: 40 * scale,
                        left: 43 * scale,
                      },
                    ]}
                  />
                )}
                <Text style={[styles.buttonLabel, { fontSize: 20 * scale }]}>
                  {pendingProvider === provider
                    ? "Connecting…"
                    : `Continue with ${provider}`}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}

          <View style={[styles.footer, { marginTop: 48 * scale }]}>
            <Text
              style={[
                styles.legalText,
                { fontSize: 18 * scale, lineHeight: 26 * scale },
              ]}
            >
              By continuing, you agree to our{"\n"}
              <Text
                accessibilityRole="link"
                onPress={() => onOpenLegal("Terms of Service")}
                style={styles.legalLink}
              >
                Terms of Service
              </Text>
              <Text style={styles.legalLink}>{" and "}</Text>
              <Text
                accessibilityRole="link"
                onPress={() => onOpenLegal("Privacy Policy")}
                style={styles.legalLink}
              >
                Privacy Policy.
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, alignItems: "center" },
  content: {
    width: "100%",
    maxWidth: 452,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heading: { color: colors.text, fontWeight: "700", letterSpacing: -1.2 },
  subtitle: { color: colors.textSecondary, marginTop: 2 },
  illustration: { width: "100%" },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    paddingVertical: 16,
    boxShadow: "0 5px 13px rgba(26, 80, 103, 0.055)",
  },
  providerButtonPressed: {
    backgroundColor: colors.pressed,
    borderColor: "#8DCABB",
  },
  providerButtonDisabled: { opacity: 0.5 },
  error: { color: "#A32935", fontSize: 15, lineHeight: 22, marginTop: 16 },
  providerIcon: { position: "absolute" },
  buttonLabel: { color: colors.text, fontWeight: "600", flexShrink: 1 },
  footer: { alignItems: "center" },
  legalText: { color: colors.textSecondary, textAlign: "center" },
  legalLink: { color: colors.primary, fontWeight: "500" },
});
