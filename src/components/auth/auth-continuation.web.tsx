import { SignIn, SignUp } from "@clerk/expo/web";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { colors } from "@/constants/theme";

export function AuthContinuation() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const props = { routing: "hash" as const, forceRedirectUrl: "/account" };
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {mode === "sign-up" ? <SignUp {...props} /> : <SignIn {...props} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
});
