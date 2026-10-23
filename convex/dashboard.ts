"use node";

import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import { action, env } from "./_generated/server";
import { internal } from "./_generated/api";
import { result } from "./validators";
import {
  assertDashboardMembership,
  projectDashboard,
} from "../src/features/dashboard/permissions";
import type { DashboardData } from "../src/features/dashboard/types";

type DashboardResponse =
  | { ok: true; data: DashboardData }
  | { ok: false; status: number; code: string; message: string };

export const load = action({
  args: { organizationId: v.string() },
  returns: result,
  handler: async (ctx, { organizationId }): Promise<DashboardResponse> => {
    const fail = (status: number, code: string, message: string) => ({
      ok: false as const,
      status,
      code,
      message,
    });
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return fail(401, "unauthenticated", "Sign in to open your workspace.");
    const userId = identity.subject;
    const sessionId = identity.sid;
    // Clerk v2 uses a nested `o` claim. Accept the flattened representation
    // used by some JWT adapters as well as legacy Clerk org_id tokens.
    const organizationClaim = identity.o;
    const activeOrg =
      identity.org_id ||
      identity["o.id"] ||
      (organizationClaim &&
      typeof organizationClaim === "object" &&
      !Array.isArray(organizationClaim)
        ? organizationClaim.id
        : undefined);
    if (!userId || typeof sessionId !== "string")
      return fail(
        401,
        "unauthenticated",
        "Your session has expired. Please sign in again.",
      );
    if (activeOrg !== organizationId)
      return fail(
        403,
        "access_denied",
        "Select your active organisation to continue.",
      );
    const parties =
      env.CLERK_AUTHORIZED_PARTIES?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) || [];
    if (
      identity.azp &&
      (!parties.length ||
        typeof identity.azp !== "string" ||
        !parties.includes(identity.azp))
    )
      return fail(
        403,
        "access_denied",
        "This app is not authorised to open your workspace.",
      );
    let stage = "clerk";
    try {
      const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
      const [session, memberships, organization, user] = await Promise.all([
        clerk.sessions.getSession(sessionId),
        clerk.organizations.getOrganizationMembershipList({
          organizationId,
          userId: [userId],
          limit: 1,
        }),
        clerk.organizations.getOrganization({ organizationId }),
        clerk.users.getUser(userId),
      ]);
      const membership = memberships.data.find(
        (item) => item.publicUserData?.userId === userId,
      );
      const role = assertDashboardMembership(
        {
          userId,
          organizationId,
          sessionStatus: session.userId === userId ? session.status : "invalid",
        },
        membership
          ? {
              userId: membership.publicUserData!.userId,
              organizationId: membership.organization.id,
              role: membership.role,
            }
          : null,
      );
      if (!role)
        return fail(
          403,
          "access_denied",
          "Your workspace access has changed. Select an organisation or contact its owner.",
        );
      // The action chooses today's Lagos date; callers cannot request another day.
      const businessDate = new Date(Date.now() + 3600000)
        .toISOString()
        .slice(0, 10);
      stage = "data";
      const records = await ctx.runQuery(internal.dashboardData.read, {
        organizationId,
        userId,
        role,
        businessDate,
      });
      stage = "projection";
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "Team member";
      const data: DashboardData = projectDashboard({
        role,
        organizationId,
        userId,
        ...records,
        identity: {
          organizationName: organization.name,
          location:
            typeof organization.publicMetadata?.primaryLocation === "string"
              ? organization.publicMetadata.primaryLocation
              : "Main location",
          firstName: user.firstName || name.split(" ")[0],
          initials: name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
        },
      });
      return {
        ok: true as const,
        data: { ...data, taskTotals: records.taskTotals },
      };
    } catch (error) {
      // Log only classification, never provider messages, identity, or tokens.
      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : null;
      console.warn("Dashboard load failed", { stage, status });
      return fail(
        503,
        "service_unavailable",
        "We couldn’t load your workspace. Please try again.",
      );
    }
  },
});
