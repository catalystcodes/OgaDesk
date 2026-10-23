import { useAuth, useUser } from "@clerk/expo";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { parseSavedSetup, resumeSetupStep } from "@/features/setup/model";
import { DashboardDetailPanel, type DashboardPanel } from "./panel";
import { DashboardScreen } from "./screen";
import { font, palette } from "./components";
import type { DashboardAction, DashboardData, DashboardTask } from "./types";
import { useDashboardFonts } from "./use-fonts";
import { loadDashboard } from "./client";

type LoadState = {
  scope: string;
  data: DashboardData | null;
  status: "loading" | "ready" | "error" | "denied" | "expired";
  error: string | null;
};

export function DashboardRoute() {
  const { user } = useUser();
  const { orgId, sessionId, getToken } = useAuth();
  const setup = parseSavedSetup(user?.unsafeMetadata.ogadeskSetup);
  const scope = `${sessionId || ""}:${user?.id || ""}:${orgId || ""}`;
  const [fontsLoaded, fontError] = useDashboardFonts();
  const [state, setState] = useState<LoadState>({
    scope,
    data: null,
    status: "loading",
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [panel, setPanel] = useState<DashboardPanel>(null);
  const [task, setTask] = useState<DashboardTask>();
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  const getTokenRef = useRef(getToken);

  // Clerk Expo creates a new getToken wrapper each render. Keep the latest
  // wrapper without restarting the focus effect after its own state updates.
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let request = 0;
      let controller: AbortController | undefined;
      // Never keep another organisation's or an earlier role's data visible.
      setState({ scope, data: null, status: "loading", error: null });
      setPanel(null);
      setTask(undefined);
      async function load() {
        if (!orgId) return;
        const attempt = ++request;
        controller?.abort();
        controller = new AbortController();
        const currentController = controller;
        setRefreshing(true);
        const timeout = setTimeout(() => currentController.abort(), 12000);
        try {
          // The Clerk Convex integration adds aud=convex to session tokens.
          // Refresh first so enabling it does not require signing out.
          const token = await getTokenRef.current({ skipCache: true });
          if (!active || attempt !== request) return;
          if (!token) {
            setState({
              scope,
              data: null,
              status: "expired",
              error: "Your session has expired. Please sign in again.",
            });
            return;
          }
          const response = await loadDashboard(
            token,
            orgId,
            currentController.signal,
          );
          if (!active || attempt !== request) return;
          if (!response.ok) {
            setState({
              scope,
              data: null,
              status:
                response.status === 401
                  ? "expired"
                  : response.status === 403
                    ? "denied"
                    : "error",
              error: response.message,
            });
            return;
          }
          const body = response.data;
          if (
            body.organizationId !== orgId ||
            !["Owner", "Manager", "Staff"].includes(body.role) ||
            !Array.isArray(body.actions)
          )
            throw new Error("Invalid dashboard response");
          setState({ scope, data: body, status: "ready", error: null });
        } catch {
          if (active && attempt === request)
            setState({
              scope,
              data: null,
              status: "error",
              error:
                "We couldn’t load your workspace. Check your connection and try again.",
            });
        } finally {
          clearTimeout(timeout);
          if (active && attempt === request) setRefreshing(false);
        }
      }
      refreshRef.current = load;
      void load();
      const subscription = AppState.addEventListener("change", (next) => {
        if (next === "active") {
          setState({ scope, data: null, status: "loading", error: null });
          setPanel(null);
          void load();
        }
      });
      return () => {
        active = false;
        controller?.abort();
        if (refreshRef.current === load) refreshRef.current = null;
        subscription.remove();
      };
    }, [scope, orgId]),
  );

  if (!setup)
    return (
      <Redirect
        href={`/${resumeSetupStep(user?.unsafeMetadata.ogadeskSetupDraft)}`}
      />
    );
  // The account route restores and verifies the saved organisation first.
  if (orgId !== setup.organizationId) return <Redirect href="/account" />;
  if (
    (!fontsLoaded && !fontError) ||
    state.scope !== scope ||
    state.status === "loading"
  )
    return <AuthLoadingScreen message="Opening your workspace…" />;
  const refresh = () => {
    void refreshRef.current?.();
  };
  if (!state.data)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FBFDFC",
          justifyContent: "center",
          padding: 28,
          gap: 18,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ fontFamily: font.bold, fontSize: 26, color: palette.text }}
        >
          Your workspace
        </Text>
        <Text
          accessibilityRole="alert"
          style={{
            fontFamily: font.regular,
            fontSize: 16,
            lineHeight: 25,
            color: palette.muted,
          }}
        >
          {state.error}
        </Text>
        {state.status === "error" ? (
          <Pressable
            accessibilityRole="button"
            disabled={refreshing}
            onPress={refresh}
            style={{ minHeight: 52, justifyContent: "center" }}
          >
            <Text style={{ color: palette.teal, fontFamily: font.semibold }}>
              {refreshing ? "Trying again…" : "Try again"}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace({ pathname: "/account", params: { settings: "1" } })
          }
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={{ color: palette.teal, fontFamily: font.semibold }}>
            Account and organisations
          </Text>
        </Pressable>
      </View>
    );
  const data = state.data;
  const action = (next: DashboardAction, selected?: DashboardTask) => {
    if (!data.actions.includes(next)) return;
    if (selected && !data.tasks.some((item) => item.id === selected.id)) return;
    setTask(selected);
    setPanel(next);
  };
  const account = () => {
    setPanel(null);
    router.push({ pathname: "/account", params: { settings: "1" } });
  };
  const switchOrganization = () => {
    setPanel(null);
    router.push("/select-organisation");
  };
  return (
    <>
      <DashboardScreen
        data={data}
        refreshing={refreshing}
        onRefresh={refresh}
        onAccount={account}
        onSwitchOrganization={switchOrganization}
        onNotifications={() => {
          setTask(undefined);
          setPanel("tasks");
        }}
        onAction={action}
        onTab={(tab) => {
          setTask(undefined);
          if (tab === "home") setPanel(null);
          else if (tab === "more") setPanel("more");
          else action(tab);
        }}
      />
      <DashboardDetailPanel
        data={data}
        panel={panel}
        task={task}
        onClose={() => {
          setPanel(null);
          setTask(undefined);
        }}
        onAction={action}
        onAccount={account}
        onSwitchOrganization={switchOrganization}
      />
    </>
  );
}
