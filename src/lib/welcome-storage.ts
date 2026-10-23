import * as SecureStore from "expo-secure-store";

const key = "ogadesk.welcome-complete";

export async function hasSeenWelcome(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(key)) === "true";
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, "true");
  } catch {
    // Introductory slides are optional. A storage failure must not block sign-in.
  }
}
