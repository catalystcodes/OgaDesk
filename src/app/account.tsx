import { useClerk, useUser } from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
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
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { colors } from "@/constants/theme";
import {
  parseSavedSetup,
  readableRole,
  resumeSetupStep,
} from "@/features/setup/model";
import { useWorkspaceAccess } from "@/features/setup/use-workspace-access";

export default function Account() {
  const { settings } = useLocalSearchParams<{ settings?: string }>();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const setup = parseSavedSetup(user?.unsafeMetadata.ogadeskSetup);
  const access = useWorkspaceAccess();

  async function handleSignOut() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      await signOut();
      router.replace("/sign-in");
    } catch {
      setError(
        "We couldn’t sign you out. Check your connection and try again.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  if (!setup)
    return (
      <Redirect
        href={`/${resumeSetupStep(user?.unsafeMetadata.ogadeskSetupDraft)}`}
      />
    );
  if (access.state.status === "missing")
    return <Redirect href="/select-organisation" />;
  if (access.state.status === "checking")
    return <AuthLoadingScreen message="Checking your workspace…" />;
  if (access.state.status === "ready" && settings !== "1")
    return <Redirect href="/dashboard" />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <BrandLogo />
        <Text accessibilityRole="header" style={styles.title}>
          {setup.fullName || user?.firstName
            ? `Welcome, ${setup.fullName || user?.firstName}`
            : "Welcome to OgaDesk"}
        </Text>
        <Text style={styles.description}>
          {access.state.status === "ready"
            ? `You’re signed in to ${access.state.name}.`
            : "We couldn’t verify your workspace. Check your connection and try again."}
        </Text>
        {access.state.status === "ready" ? (
          <Text style={styles.email}>{readableRole(access.state.role)}</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={access.retry}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        )}
        {user?.primaryEmailAddress?.emailAddress ? (
          <Text selectable style={styles.email}>
            {user.primaryEmailAddress.emailAddress}
          </Text>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/select-organisation")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Switch organisation</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          onPress={handleSignOut}
          style={styles.button}
        >
          {pending ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.buttonText}>Sign out</Text>
          )}
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
  title: {
    marginTop: 48,
    color: colors.text,
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 40,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 12,
  },
  email: { color: colors.text, fontSize: 16, marginTop: 24 },
  error: { color: "#A32935", fontSize: 15, lineHeight: 22, marginTop: 16 },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 58,
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.primary, fontSize: 17, fontWeight: "600" },
});
