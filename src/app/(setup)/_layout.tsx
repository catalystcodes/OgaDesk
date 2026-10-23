import { Stack } from "expo-router";
import { BusinessSetupProvider } from "@/features/setup/provider";

export default function SetupLayout() {
  return (
    <BusinessSetupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#FBFDFC" },
        }}
      />
    </BusinessSetupProvider>
  );
}
