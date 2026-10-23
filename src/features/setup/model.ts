import type { SetupDraft, SetupRole, SetupStep } from "./types";

export const businessTypes = [
  "Wholesale / Distribution",
  "Retail",
  "Warehousing",
  "Manufacturing",
  "Other",
];
export const locations = [
  "HQ Warehouse",
  "Main Store",
  "Branch",
  "Other location",
];

export function validateProfile(draft: SetupDraft) {
  const errors: Partial<Record<keyof SetupDraft, string>> = {};
  if (!draft.businessName.trim())
    errors.businessName = "Enter your business name.";
  if (!draft.businessType.trim())
    errors.businessType = "Choose your business type.";
  if (!draft.location.trim()) errors.location = "Enter a primary location.";
  if (!draft.fullName.trim()) errors.fullName = "Enter your full name.";
  return errors;
}

export function roleFromMembership(role: string): SetupRole {
  if (role === "org:admin" || role === "org:owner") return "Owner";
  if (role === "org:manager") return "Manager";
  return "Staff";
}

export function readableRole(role: string, name?: string): string {
  if (["org:admin", "org:owner", "org:manager", "org:member"].includes(role))
    return roleFromMembership(role);
  return name || role.replace(/^org:/, "").replaceAll("_", " ");
}

export function textMetadata(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function parseSavedSetup(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (
    data.version !== 1 ||
    data.complete !== true ||
    typeof data.organizationId !== "string" ||
    !data.organizationId.trim()
  )
    return null;
  return {
    organizationId: data.organizationId,
    name: textMetadata(data.name, "Your organisation"),
    businessType: textMetadata(data.businessType, ""),
    location: textMetadata(data.location, ""),
    fullName: textMetadata(data.fullName, ""),
  };
}

export function restoreSetupDraft(value: unknown, fullName = ""): SetupDraft {
  const saved = value && typeof value === "object"
    ? value as Record<string, unknown> : {};
  return {
    businessName: textMetadata(saved.businessName, ""),
    businessType: textMetadata(saved.businessType, "Wholesale / Distribution"),
    location: textMetadata(saved.location, "HQ Warehouse"),
    fullName: textMetadata(saved.fullName, fullName),
    role: saved.role === "Manager" || saved.role === "Staff" ? saved.role : "Owner",
    selectedId: textMetadata(saved.selectedId, "") || null,
  };
}

// Saved progress controls navigation only. Membership is checked independently.
export function resumeSetupStep(value: unknown): SetupStep {
  if (!value || typeof value !== "object") return "create-profile";
  const saved = value as Record<string, unknown>;
  const draft = restoreSetupDraft(value);
  if (Object.keys(validateProfile(draft)).length) return "create-profile";
  if (saved.step === "select-role") return "select-role";
  if (saved.step === "select-organisation") return "select-organisation";
  if ((saved.step === "join-organisation" || saved.step === "review-confirm") && draft.selectedId)
    return saved.step;
  return "select-organisation";
}

export function setupRouteRedirect(
  step: SetupStep,
  draft: SetupDraft,
  selectedKind: "create" | "membership" | "invitation" | undefined,
  loading: boolean,
): SetupStep | null {
  if (step === "create-profile" || step === "setup-success") return null;
  if (Object.keys(validateProfile(draft)).length) return "create-profile";
  if (step === "select-role" || step === "select-organisation" || loading) return null;
  if (!selectedKind) return "select-organisation";
  if (step === "join-organisation" && selectedKind !== "invitation") return "review-confirm";
  return null;
}
