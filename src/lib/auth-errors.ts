// Only show Clerk's user-facing messages. Never render raw requests or tokens.
export function getAuthErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray(error.errors)
  ) {
    const first = error.errors[0];
    if (first?.code === "network_error") {
      return "Check your internet connection and try again.";
    }
    if (typeof first?.longMessage === "string" && first.longMessage)
      return first.longMessage;
    if (typeof first?.message === "string" && first.message)
      return first.message;
  }
  return "We couldn’t sign you in. Please try again.";
}
