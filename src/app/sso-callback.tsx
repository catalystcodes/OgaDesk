import { useAuth, useSession } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { colors } from "@/constants/theme";

// On web, this notifies the original sign-in tab and closes the OAuth popup.
const result = WebBrowser.maybeCompleteAuthSession();

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  if (isLoaded && session?.currentTask)
    return <Redirect href="/auth-continue" />;
  if (isLoaded && isSignedIn) return <Redirect href="/account" />;

  return (
    <View style={styles.screen}>
      <AuthLoadingScreen message="Finishing sign-in…" />
      {Platform.OS !== "web" || result.type === "failed" ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace("/sign-in")}
          style={styles.returnLink}
        >
          <Text style={styles.link}>Return to sign in</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  returnLink: { alignSelf: "center", padding: 24, marginBottom: 32 },
  link: { color: colors.primary, fontSize: 16, fontWeight: "600" },
});
