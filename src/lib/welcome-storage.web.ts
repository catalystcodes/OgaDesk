const key = "ogadesk.welcome-complete";

export async function hasSeenWelcome(): Promise<boolean> {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    localStorage.setItem(key, "true");
  } catch {
    // Private browsing or disabled storage must not block authentication.
  }
}
