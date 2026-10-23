import { Redirect } from "expo-router";
import { SetupPreview } from "@/features/setup/preview";

export default function DesignPreview() {
  if (!__DEV__) return <Redirect href="/" />;
  return <SetupPreview />;
}
