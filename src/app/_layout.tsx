import { ClerkProvider, useAuth, useSession, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { BrandedSplashScreen } from "@/components/onboarding/branded-splash-screen";
import { sessionAccess } from "@/lib/session-routing";

SplashScreen.setOptions({ duration: 200, fade: true });
const keepSplash = () => {};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env to connect Clerk.",
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthNavigator />
    </ClerkProvider>
  );
}

function AuthNavigator() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: sessionLoaded, session } = useSession();
  const { isLoaded: userLoaded } = useUser();
  const hasPendingTask = !!session?.currentTask;
  const access = sessionAccess(isSignedIn, session?.currentTask?.key);

  if (!isLoaded || !sessionLoaded || !userLoaded) {
    return <BrandedSplashScreen hold onFinish={keepSplash} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#FBFDFC" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={!isSignedIn && !hasPendingTask}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn || hasPendingTask}>
          <Stack.Screen name="auth-continue" />
        </Stack.Protected>
        <Stack.Protected guard={access.canOpenWorkspace}>
          <Stack.Screen name="account" />
          <Stack.Screen name="dashboard" />
        </Stack.Protected>
        <Stack.Protected guard={access.canSetUp}>
          <Stack.Screen name="(setup)" />
        </Stack.Protected>
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="design-preview" />
          <Stack.Screen name="dashboard-preview" />
        </Stack.Protected>
        <Stack.Screen name="sso-callback" />
      </Stack>
    </>
  );
}
