import type { useSSO } from "@clerk/expo";

type SSOResult = Awaited<ReturnType<ReturnType<typeof useSSO>["startSSOFlow"]>>;

// A browser redirect alone never grants access. Activate only a Clerk-created
// session, and leave incomplete attempts in the authentication flow.
export async function completeSSOFlow(
  result: SSOResult,
  onPendingTask: () => void,
) {
  const browserResult = result.authSessionResult?.type;
  if (browserResult === "cancel" || browserResult === "dismiss")
    return "cancelled";

  if (result.createdSessionId && result.setActive) {
    let pendingTask = false;
    await result.setActive({
      session: result.createdSessionId,
      navigate: async ({ session }) => {
        if (session?.currentTask) {
          pendingTask = true;
          onPendingTask();
        }
      },
    });
    return pendingTask ? "pending" : "signed-in";
  }

  if (browserResult === "success" && !result.createdSessionId) {
    return result.signUp?.status === "missing_requirements"
      ? "sign-up"
      : "sign-in";
  }

  return "failed";
}
