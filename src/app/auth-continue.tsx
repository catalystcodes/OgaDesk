import { useSession, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";

import { AuthContinuation } from "@/components/auth/auth-continuation";
import { parseSavedSetup, resumeSetupStep } from "@/features/setup/model";

export default function ContinueAuthentication() {
  const { session } = useSession();
  const { user } = useUser();
  if (session?.currentTask?.key === "choose-organization")
    return <Redirect href={parseSavedSetup(user?.unsafeMetadata.ogadeskSetup)
      ? "/select-organisation" : `/${resumeSetupStep(user?.unsafeMetadata.ogadeskSetupDraft)}`} />;
  return <AuthContinuation />;
}
