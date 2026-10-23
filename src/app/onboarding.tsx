import { router } from "expo-router";

import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { markWelcomeSeen } from "@/lib/welcome-storage";

export default function Onboarding() {
  async function continueToSignIn() {
    await markWelcomeSeen();
    router.replace("/sign-in");
  }
  return (
    <OnboardingScreen
      onGetStarted={continueToSignIn}
      onSignIn={continueToSignIn}
    />
  );
}
