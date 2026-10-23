import { useHostedAuth } from "@clerk/expo/hosted-auth";
import { useClerk } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage } from "@/lib/auth-errors";

// Clerk's hosted flow covers additional instance requirements, including MFA,
// required profile fields, and session tasks without shipping native UI modules.
export function AuthContinuation() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { startHostedAuth } = useHostedAuth();
  const clerk = useClerk();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function finishSignIn() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await startHostedAuth({
        mode: mode === "sign-up" ? "sign-up" : "sign-in",
        redirectUrl: makeRedirectUri({
          scheme: "ogadesk",
          path: "sso-callback",
        }),
      });
      if (
        !result.createdSessionId &&
        result.authSessionResult?.type !== "cancel" &&
        result.authSessionResult?.type !== "dismiss"
      ) {
        setError("Sign-in didn’t finish. Please try again.");
      } else if (result.createdSessionId && !clerk.session?.currentTask) {
        router.replace("/account");
      }
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function backToSignIn() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      if (clerk.session) await clerk.signOut();
      router.replace("/sign-in");
    } catch {
      setError("We couldn’t leave verification. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <BrandLogo />
        <Text accessibilityRole="header" style={styles.title}>
          One more step
        </Text>
        <Text style={styles.description}>
          Your account needs a little more information or verification. Continue
          securely to finish signing in.
        </Text>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          onPress={finishSignIn}
          style={styles.button}
        >
          {pending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Finish signing in</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="link"
          disabled={pending}
          onPress={backToSignIn}
          style={styles.link}
        >
          <Text style={styles.linkText}>Back to sign in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: { width: "100%", maxWidth: 420 },
  title: { marginTop: 40, fontSize: 30, fontWeight: "700", color: colors.text },
  description: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  buttonText: { color: "white", fontSize: 17, fontWeight: "600" },
  error: { color: "#A32935", marginTop: 16, fontSize: 15, lineHeight: 22 },
  link: { alignSelf: "center", padding: 20 },
  linkText: { color: colors.primary, fontSize: 16 },
});
