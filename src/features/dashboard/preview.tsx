import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { dashboardFixture } from "./fixtures";
import { DashboardDetailPanel, type DashboardPanel } from "./panel";
import { DashboardScreen } from "./screen";
import type { DashboardAction, DashboardTask } from "./types";
import { useDashboardFonts } from "./use-fonts";

export function DashboardPreview() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const data = dashboardFixture(
    role === "manager" ? "Manager" : role === "staff" ? "Staff" : "Owner",
  );
  const [loaded, error] = useDashboardFonts();
  const [panel, setPanel] = useState<DashboardPanel>(null);
  const [task, setTask] = useState<DashboardTask>();
  const action = (next: DashboardAction, selected?: DashboardTask) => {
    if (data.actions.includes(next)) {
      setTask(selected);
      setPanel(next);
    }
  };
  if (!loaded && !error)
    return <AuthLoadingScreen message="Opening dashboard…" />;
  return (
    <>
      <DashboardScreen
        data={data}
        preview
        offline={data.role === "Staff"}
        onRefresh={() => {}}
        onAccount={() => setPanel("more")}
        onSwitchOrganization={() => setPanel("more")}
        onNotifications={() => setPanel("tasks")}
        onAction={action}
        onTab={(tab) => {
          if (tab === "home") setPanel(null);
          else if (tab === "more") setPanel("more");
          else action(tab);
        }}
      />
      <DashboardDetailPanel
        panel={panel}
        task={task}
        data={data}
        preview
        onClose={() => {
          setPanel(null);
          setTask(undefined);
        }}
        onAction={action}
        onAccount={() => router.push("/account")}
        onSwitchOrganization={() => setPanel(null)}
      />
    </>
  );
}
