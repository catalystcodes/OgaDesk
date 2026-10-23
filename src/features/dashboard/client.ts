import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export async function loadDashboard(
  token: string,
  organizationId: string,
  signal: AbortSignal,
) {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex URL is not configured");
  // A separate client per request prevents a new session inheriting old auth.
  const client = new ConvexHttpClient(url, {
    fetch: (input, init) => fetch(input, { ...init, signal }),
  });
  client.setAuth(token);
  return client.action(api.dashboard.load, { organizationId });
}
