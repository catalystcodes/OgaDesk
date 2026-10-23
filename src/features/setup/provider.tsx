import { useClerk, useOrganizationList, useUser } from "@clerk/expo";
import { router, usePathname } from "expo-router";
import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  readableRole,
  parseSavedSetup,
  restoreSetupDraft,
  roleFromMembership,
  textMetadata,
  validateProfile,
} from "./model";
import type {
  OrganisationChoice,
  SetupDraft,
  SetupScreenProps,
  SetupStep,
} from "./types";
import { verifyMembership } from "./verify-membership";

type SetupContextValue = Omit<
  SetupScreenProps,
  "step" | "onBack" | "onContinue" | "onEdit"
> & {
  continueFrom: (step: SetupStep) => void;
  backFrom: (step: SetupStep) => void;
  edit: SetupScreenProps["onEdit"];
  confirmed: boolean;
};
const SetupContext = createContext<SetupContextValue | null>(null);

export function BusinessSetupProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const clerk = useClerk();
  const pathname = usePathname();
  const completed = parseSavedSetup(user?.unsafeMetadata.ogadeskSetup);
  const saved = user?.unsafeMetadata.ogadeskSetupDraft;
  const [createRequested, setCreateRequested] = useState(
    !completed && saved && typeof saved === "object" && "creating" in saved
      ? saved.creating === true : pathname === "/create-profile",
  );
  const { isLoaded, createOrganization, userMemberships, userInvitations } =
    useOrganizationList({
      userMemberships: { infinite: true, pageSize: 20 },
      userInvitations: { infinite: true, pageSize: 20, status: "pending" },
    });
  const [draft, setDraft] = useState<SetupDraft>(() => restoreSetupDraft(
    saved || (completed ? {
      ...completed, businessName: completed.name, selectedId: completed.organizationId,
    } : undefined), user?.fullName || "",
  ));
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    SetupScreenProps["fieldErrors"]
  >({});
  const inFlight = useRef(false);
  const createdId = useRef<string | null>(null);
  const acceptedId = useRef<string | null>(null);
  const [acceptedChoice, setAcceptedChoice] =
    useState<OrganisationChoice | null>(null);
  const editingReview = useRef(false);
  const previousDraft = useRef<{ draft: SetupDraft; creating: boolean } | null>(
    null,
  );

  const memberships: OrganisationChoice[] = (userMemberships.data || []).map(
    (member) => ({
      id: member.organization.id,
      organizationId: member.organization.id,
      name: member.organization.name,
      location: textMetadata(
        member.organization.publicMetadata.primaryLocation,
        "Main location",
      ),
      businessType: textMetadata(
        member.organization.publicMetadata.businessType,
        "",
      ),
      image: member.organization.hasImage
        ? { uri: member.organization.imageUrl }
        : undefined,
      role: roleFromMembership(member.role),
      roleLabel: readableRole(member.role, member.roleName),
      kind: "membership",
    }),
  );
  const invitations: OrganisationChoice[] = (userInvitations.data || []).map(
    (invitation) => ({
      id: invitation.id,
      organizationId: invitation.publicOrganizationData.id,
      name: invitation.publicOrganizationData.name,
      location: textMetadata(
        invitation.publicMetadata.primaryLocation,
        "Main location",
      ),
      businessType: textMetadata(invitation.publicMetadata.businessType, ""),
      image: invitation.publicOrganizationData.hasImage
        ? { uri: invitation.publicOrganizationData.imageUrl }
        : undefined,
      role: roleFromMembership(invitation.role),
      roleLabel: readableRole(invitation.role),
      inviterName:
        typeof invitation.publicMetadata.inviterName === "string"
          ? invitation.publicMetadata.inviterName
          : undefined,
      inviterEmail:
        typeof invitation.publicMetadata.inviterEmail === "string"
          ? invitation.publicMetadata.inviterEmail
          : undefined,
      kind: "invitation",
    }),
  );
  const choices: OrganisationChoice[] = [
    ...(createRequested && draft.role === "Owner" && draft.businessName.trim()
      ? [
          {
            id: "new",
            organizationId: "",
            name: draft.businessName.trim(),
            location: draft.location,
            businessType: draft.businessType,
            role: "Owner" as const,
            kind: "create" as const,
          },
        ]
      : []),
    ...memberships,
    ...invitations.filter(
      (invitation) =>
        !memberships.some(
          (member) => member.organizationId === invitation.organizationId,
        ),
    ),
  ];
  if (
    acceptedChoice &&
    !choices.some((choice) => choice.id === acceptedChoice.id)
  )
    choices.push(acceptedChoice);
  const selected = choices.find((choice) => choice.id === draft.selectedId);

  function change(patch: Partial<SetupDraft>) {
    if (inFlight.current) return;
    setError(null);
    setFieldErrors({});
    const target = patch.selectedId
      ? choices.find((choice) => choice.id === patch.selectedId)
      : undefined;
    if (target && target.kind !== "create") setCreateRequested(false);
    setDraft((current) => ({
      ...current,
      ...(target
        ? {
            businessName: target.name,
            businessType: target.businessType || current.businessType,
            location: target.location,
          }
        : {}),
      ...patch,
    }));
    if (
      patch.businessName !== undefined &&
      patch.businessName !== draft.businessName
    )
      createdId.current = null;
  }

  async function saveDraft(step: SetupStep, nextDraft = draft, creating = createRequested) {
    if (!user) throw new Error("No active user");
    await user.updateMetadata({
      unsafeMetadata: {
        ogadeskSetupDraft: {
          version: 1,
          step,
          creating,
          ...nextDraft,
          businessName: nextDraft.businessName.trim(),
          location: nextDraft.location.trim(),
          fullName: nextDraft.fullName.trim(),
        },
      },
    });
  }

  async function confirm() {
    if (!user || !selected || !createOrganization)
      throw new Error("Setup unavailable");
    const errors = validateProfile(draft);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      editingReview.current = true;
      router.push("/create-profile");
      return;
    }
    if (selected.kind === "create" && draft.role !== "Owner") {
      setError(
        "Choose Owner to create an organisation, or select an organisation you belong to.",
      );
      return;
    }
    await saveDraft("review-confirm");
    let organizationId = selected.organizationId;
    if (selected.kind === "create") {
      // Keep the ID across retries if a later profile/session request fails.
      // Persist it before activation so a remount can select the existing membership.
      if (!createdId.current) {
        const existingDraftId =
          user.unsafeMetadata.ogadeskPendingOrganizationId;
        const existing =
          typeof existingDraftId === "string"
            ? memberships.find(
                (member) =>
                  member.organizationId === existingDraftId &&
                  member.name === selected.name,
              )
            : undefined;
        createdId.current =
          existing?.organizationId ||
          (await createOrganization({ name: selected.name })).id;
      }
      organizationId = createdId.current;
      await user.updateMetadata({
        unsafeMetadata: { ogadeskPendingOrganizationId: organizationId },
      });
    } else if (
      selected.kind === "invitation" &&
      acceptedId.current !== selected.id
    ) {
      const invitation = userInvitations.data?.find(
        (item) => item.id === selected.id,
      );
      if (!invitation || invitation.status !== "pending")
        throw new Error("Invitation unavailable");
      await invitation.accept();
      acceptedId.current = selected.id;
      setAcceptedChoice({ ...selected, kind: "membership" });
    }

    // Check the actual server membership. A role selected in onboarding is a
    // preference and is never used to change or grant organisation permissions.
    const membership = await verifyMembership(
      (params) => user.getOrganizationMemberships(params),
      organizationId,
    );
    if (!membership) throw new Error("Membership not confirmed");
    await clerk.setActive({ organization: organizationId });
    await user.updateMetadata({
      unsafeMetadata: {
        ogadeskSetup: {
          version: 1,
          complete: true,
          organizationId,
          name: membership.organization.name,
          fullName: draft.fullName.trim(),
          businessType: draft.businessType,
          location: draft.location,
          requestedRole: draft.role,
        },
        ogadeskPendingOrganizationId: null,
        ogadeskSetupDraft: null,
      },
    });
    setConfirmed(true);
    router.replace("/setup-success");
  }

  async function continueFrom(step: SetupStep) {
    if (inFlight.current) return;
    setError(null);
    if (step === "create-profile") {
      const errors = validateProfile(draft);
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
    }
    if (
      (step === "select-organisation" ||
        step === "join-organisation" ||
        step === "review-confirm") &&
      !selected
    ) {
      setError("Select an organisation to continue.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      if (step === "create-profile") {
        await saveDraft(editingReview.current ? "review-confirm" : "select-role", draft, true);
        previousDraft.current = null;
        if (editingReview.current) {
          editingReview.current = false;
          router.push("/review-confirm");
        } else {
          setCreateRequested(true);
          router.push("/select-role");
        }
      } else if (step === "select-role") {
        const nextDraft = { ...draft, selectedId:
          createRequested && draft.role === "Owner" && draft.businessName.trim()
            ? "new" : draft.selectedId === "new" ? null : draft.selectedId };
        const returnToReview = editingReview.current && !!selected &&
          (selected.kind !== "create" || draft.role === "Owner");
        const next = returnToReview ? "review-confirm" : "select-organisation";
        await saveDraft(next, nextDraft);
        setDraft(nextDraft);
        editingReview.current = false;
        router.push(`/${next}`);
      } else if (step === "select-organisation") {
        const next = selected?.kind === "invitation" ? "join-organisation" : "review-confirm";
        await saveDraft(next);
        editingReview.current = false;
        router.push(`/${next}`);
      } else if (step === "join-organisation") {
        await saveDraft("review-confirm");
        router.push("/review-confirm");
      } else if (step === "review-confirm") {
        await confirm();
      } else {
        router.replace("/account");
      }
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === "Invitation unavailable"
          ? "This invitation is no longer available. Go back and refresh your organisations."
          : cause instanceof Error &&
              cause.message === "Membership not confirmed"
            ? "Your membership hasn’t been confirmed yet. Please try again."
            : getAuthErrorMessage(cause).replace(
                "sign you in",
                "save your setup",
              ),
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function backFrom(step: SetupStep) {
    if (inFlight.current) return;
    setError(null);
    if (step === "create-profile") {
      if (previousDraft.current) {
        setDraft(previousDraft.current.draft);
        setCreateRequested(previousDraft.current.creating);
        previousDraft.current = null;
        if (router.canGoBack()) router.back();
        else router.replace("/select-organisation");
        return;
      }
      if (router.canGoBack()) {
        editingReview.current = false;
        router.back();
        return;
      }
      inFlight.current = true;
      setBusy(true);
      try {
        await clerk.signOut();
        router.replace("/sign-in");
      } catch {
        setError("We couldn’t sign you out. Please try again.");
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/create-profile");
  }

  function edit(field: "organisation" | "role" | "businessType" | "location") {
    editingReview.current = true;
    router.push(
      field === "organisation"
        ? "/select-organisation"
        : field === "role"
          ? "/select-role"
          : "/create-profile",
    );
  }

  async function refresh() {
    if (inFlight.current) return;
    setError(null);
    try {
      await Promise.all([
        userMemberships.revalidate?.(),
        userInvitations.revalidate?.(),
      ]);
    } catch {
      setError("We couldn’t refresh your organisations. Please try again.");
    }
  }

  return (
    <SetupContext
      value={{
        draft,
        confirmed,
        choices,
        onChange: change,
        busy,
        loading:
          !isLoaded || userMemberships.isLoading || userInvitations.isLoading,
        error:
          error ||
          (userMemberships.error || userInvitations.error
            ? "We couldn’t load your organisations. Check your connection and try again."
            : null),
        fieldErrors,
        continueFrom,
        backFrom,
        edit,
        onRefresh: refresh,
        onLoadMore:
          userMemberships.hasNextPage || userInvitations.hasNextPage
            ? () => {
                if (userMemberships.hasNextPage)
                  void userMemberships.fetchNext?.();
                if (userInvitations.hasNextPage)
                  void userInvitations.fetchNext?.();
              }
            : undefined,
        onAddOrganisation: () => {
          if (inFlight.current) return;
          previousDraft.current = { draft, creating: createRequested };
          setCreateRequested(true);
          change({ role: "Owner", businessName: "", selectedId: null });
          editingReview.current = false;
          router.push("/create-profile");
        },
      }}
    >
      {children}
    </SetupContext>
  );
}

export function useBusinessSetup() {
  const context = useContext(SetupContext);
  if (!context) throw new Error("Business setup must be inside its provider.");
  return context;
}
