import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";

import { SetupScreen } from "./screens";
import {
  setupSteps,
  type OrganisationChoice,
  type SetupDraft,
  type SetupStep,
} from "./types";
import { validateProfile } from "./model";

// Design fixtures are only rendered by the development-only preview route.
// They never enter Clerk or the live organisation selection flow.
const fixtureOrganisations: OrganisationChoice[] = [
  {
    id: "preview-kano",
    organizationId: "preview-kano",
    name: "Kano Agro Distributors",
    location: "HQ Warehouse",
    businessType: "Wholesale / Distribution",
    role: "Manager",
    kind: "invitation",
    inviterName: "Aisha Bello",
    inviterEmail: "aisha.bello@kanoagro.com",
    image: require("@/assets/images/setup-org-exterior.jpg"),
  },
  {
    id: "preview-habib",
    organizationId: "preview-habib",
    name: "Habib Holdings",
    location: "Main Store",
    role: "Staff",
    kind: "membership",
    image: require("@/assets/images/setup-org-stock.jpg"),
  },
  {
    id: "preview-umar",
    organizationId: "preview-umar",
    name: "Umar Ventures",
    location: "Abuja Branch",
    role: "Owner",
    kind: "membership",
    image: require("@/assets/images/setup-org-warehouse.jpg"),
  },
];

export function SetupPreview() {
  const { step: requestedStep, screen } = useLocalSearchParams<{ step?: string; screen?: string }>();
  const requested = requestedStep || screen;
  const step = setupSteps.includes(requested as SetupStep)
    ? (requested as SetupStep)
    : "create-profile";
  const [draft, setDraft] = useState<SetupDraft>({
    businessName: "Kano Agro Distributors",
    businessType: "Wholesale / Distribution",
    location: "HQ Warehouse",
    fullName: "Umar Faruq",
    role: "Owner",
    selectedId: "preview-kano",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SetupDraft, string>>
  >({});
  const editing = useRef(false);
  const previousDraft = useRef<SetupDraft | null>(null);
  // `screen` is reserved by the native navigator. Keep legacy links readable,
  // but use a separate query parameter for transitions between preview steps.
  const open = (next: SetupStep) => router.setParams({ step: next });
  return (
    <SetupScreen
      step={step}
      draft={draft}
      choices={fixtureOrganisations}
      fieldErrors={fieldErrors}
      onChange={(patch) => {
        setFieldErrors({});
        setDraft((current) => ({ ...current, ...patch }));
      }}
      onBack={() => {
        if (step === "create-profile" && previousDraft.current) {
          setDraft(previousDraft.current);
          previousDraft.current = null;
          open("select-organisation");
          return;
        }
        if (editing.current) {
          editing.current = false;
          open("review-confirm");
          return;
        }
        const index = setupSteps.indexOf(step);
        if (index > 0) open(setupSteps[index - 1]);
        else router.replace("/sign-in");
      }}
      onContinue={() => {
        if (step === "create-profile") {
          const errors = validateProfile(draft);
          setFieldErrors(errors);
          if (Object.keys(errors).length) return;
          previousDraft.current = null;
          if (editing.current) {
            editing.current = false;
            open("review-confirm");
          } else open("select-role");
        } else if (step === "select-role") {
          if (editing.current) {
            editing.current = false;
            open("review-confirm");
          } else {
            setDraft((current) => ({ ...current, selectedId: "preview-kano" }));
            open("select-organisation");
          }
        } else if (step === "select-organisation") {
          open(
            fixtureOrganisations.find(
              (choice) => choice.id === draft.selectedId,
            )?.kind === "invitation"
              ? "join-organisation"
              : "review-confirm",
          );
        } else if (step === "join-organisation") open("review-confirm");
        else if (step === "review-confirm") open("setup-success");
        else router.replace("/sign-in");
      }}
      onAddOrganisation={() => {
        previousDraft.current = draft;
        setDraft((current) => ({
          ...current,
          businessName: "",
          selectedId: null,
        }));
        open("create-profile");
      }}
      onEdit={(field) => {
        editing.current = true;
        open(
          field === "organisation"
            ? "select-organisation"
            : field === "role"
              ? "select-role"
              : "create-profile",
        );
      }}
    />
  );
}
