import type { ImageSource } from "expo-image";

export const setupSteps = [
  "create-profile",
  "select-role",
  "select-organisation",
  "join-organisation",
  "review-confirm",
  "setup-success",
] as const;
export type SetupStep = (typeof setupSteps)[number];
export type SetupRole = "Owner" | "Manager" | "Staff";
export type SetupDraft = {
  businessName: string;
  businessType: string;
  location: string;
  fullName: string;
  role: SetupRole;
  selectedId: string | null;
};

export type OrganisationChoice = {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  businessType?: string;
  kind: "create" | "membership" | "invitation";
  role: SetupRole;
  roleLabel?: string;
  image?: ImageSource;
  inviterName?: string;
  inviterEmail?: string;
};

export type SetupScreenProps = {
  step: SetupStep;
  draft: SetupDraft;
  choices: OrganisationChoice[];
  onChange: (patch: Partial<SetupDraft>) => void;
  onBack: () => void;
  onContinue: () => void;
  onAddOrganisation: () => void;
  onEdit: (
    field: "organisation" | "role" | "businessType" | "location",
  ) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  busy?: boolean;
  loading?: boolean;
  error?: string | null;
  fieldErrors?: Partial<Record<keyof SetupDraft, string>>;
};
