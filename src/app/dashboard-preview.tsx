import { Redirect } from "expo-router";
import { DashboardPreview } from "@/features/dashboard/preview";

export default function DashboardDesignPreview() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DashboardPreview />;
}
