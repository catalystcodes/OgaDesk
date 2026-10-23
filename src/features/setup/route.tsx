import { useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { SetupScreen } from "./screens";
import { parseSavedSetup, setupRouteRedirect } from "./model";
import { useBusinessSetup } from "./provider";
import type { SetupStep } from "./types";

export function BusinessSetupRoute({ step }: { step: SetupStep }) {
  const context = useBusinessSetup();
  const { user } = useUser();
  if (step === "setup-success" && !context.confirmed)
    return <Redirect href={parseSavedSetup(user?.unsafeMetadata.ogadeskSetup) ? "/account" : "/create-profile"} />;
  const selected = context.choices.find((choice) => choice.id === context.draft.selectedId);
  const redirect = setupRouteRedirect(step, context.draft, selected?.kind, !!context.loading);
  if (redirect) return <Redirect href={`/${redirect}`} />;
  if (context.loading && (step === "join-organisation" || step === "review-confirm"))
    return <AuthLoadingScreen message="Loading your organisation…" />;
  return (
    <SetupScreen
      {...context}
      step={step}
      onBack={() => context.backFrom(step)}
      onContinue={() => context.continueFrom(step)}
      onEdit={context.edit}
    />
  );
}
