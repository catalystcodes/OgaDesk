import { useAuth, useSSO } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import { SignInScreen, type Provider } from "@/components/auth/sign-in-screen";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { completeSSOFlow } from "@/lib/complete-sso";
import { markWelcomeSeen } from "@/lib/welcome-storage";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { isLoaded } = useAuth();
  const { startSSOFlow } = useSSO();
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    void markWelcomeSeen();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync().catch(() => undefined);
    return () => {
      void WebBrowser.coolDownAsync().catch(() => undefined);
    };
  }, []);

  async function signIn(provider: Provider) {
    if (!isLoaded || inFlight.current) return;
    inFlight.current = true;
    setPendingProvider(provider);
    setError(null);

    try {
      const result = await startSSOFlow({
        strategy: provider === "Google" ? "oauth_google" : "oauth_apple",
        redirectUrl: makeRedirectUri({
          scheme: "ogadesk",
          path: "sso-callback",
        }),
      });

      const outcome = await completeSSOFlow(result, () =>
        router.replace("/auth-continue"),
      );
      if (outcome === "sign-in" || outcome === "sign-up") {
        router.push({ pathname: "/auth-continue", params: { mode: outcome } });
      } else if (outcome === "signed-in") {
        router.replace("/account");
      } else if (outcome === "failed") {
        setError("Sign-in didn’t finish. Please try again.");
      }
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      inFlight.current = false;
      setPendingProvider(null);
    }
  }

  return (
    <SignInScreen
      onSignIn={signIn}
      pendingProvider={pendingProvider}
      disabled={!isLoaded}
      error={error}
      onOpenLegal={(document) =>
        Alert.alert(document, "This document will be available before launch.")
      }
    />
  );
}
