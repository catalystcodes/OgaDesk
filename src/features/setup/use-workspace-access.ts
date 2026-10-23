import { useAuth, useClerk, useUser } from "@clerk/expo";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";

import { parseSavedSetup } from "./model";
import { restoreWorkspace } from "./verify-membership";

type AccessState =
  | { status: "checking" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; name: string; role: string };

export function useWorkspaceAccess() {
  const { user } = useUser();
  const { orgId } = useAuth();
  const clerk = useClerk();
  const setup = parseSavedSetup(user?.unsafeMetadata.ogadeskSetup);
  const organizationId = setup?.organizationId;
  const [state, setState] = useState<AccessState>({ status: "checking" });
  const checkRef = useRef<(() => Promise<void>) | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    let request = 0;
    async function check() {
      const attempt = ++request;
      setState({ status: "checking" });
      if (!user || !organizationId) return;
      try {
        const membership = await restoreWorkspace({
          organizationId,
          activeOrganizationId: orgId,
          getMemberships: (params) => user!.getOrganizationMemberships(params),
          setActive: (params) => clerk.setActive(params),
          isCurrent: () => active && attempt === request,
        });
        if (!active || attempt !== request) return;
        if (!membership) {
          setState({ status: "missing" });
          return;
        }
        if (active && attempt === request)
          setState({ status: "ready", name: membership.organization.name, role: membership.role });
      } catch {
        if (active && attempt === request) setState({ status: "error" });
      }
    }
    checkRef.current = check;
    void check();
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void check();
    });
    return () => {
      active = false;
      if (checkRef.current === check) checkRef.current = null;
      subscription.remove();
    };
  }, [user, organizationId, orgId, clerk]));

  return { state, retry: () => { void checkRef.current?.(); } };
}
