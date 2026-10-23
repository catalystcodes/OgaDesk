import { useAuth, useSession, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { BrandedSplashScreen } from "@/components/onboarding/branded-splash-screen";
import { hasSeenWelcome } from "@/lib/welcome-storage";
import { parseSavedSetup, resumeSetupStep } from "@/features/setup/model";
import { sessionAccess } from "@/lib/session-routing";

export default function Index() {
  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { session } = useSession();
  const { user } = useUser();
  const [seenWelcome, setSeenWelcome] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const finish = useCallback(() => setFinished(true), []);

  useEffect(() => {
    let active = true;
    void hasSeenWelcome().then((seen) => {
      if (active) setSeenWelcome(seen);
    });
    return () => { active = false; };
  }, []);

  if (finished && seenWelcome !== null) {
    if (sessionAccess(isSignedIn, session?.currentTask?.key).choosingOrganization) {
      return <Redirect href={parseSavedSetup(user?.unsafeMetadata.ogadeskSetup)
        ? "/select-organisation" : `/${resumeSetupStep(user?.unsafeMetadata.ogadeskSetupDraft)}`} />;
    }
    if (session?.currentTask) return <Redirect href="/auth-continue" />;
    if (isSignedIn) return <Redirect href="/account" />;
    return <Redirect href={seenWelcome ? "/sign-in" : "/onboarding"} />;
  }
  return <BrandedSplashScreen onFinish={finish} />;
}
