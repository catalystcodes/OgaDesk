import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSavedSetup,
  readableRole,
  roleFromMembership,
  textMetadata,
  validateProfile,
  restoreSetupDraft,
  resumeSetupStep,
  setupRouteRedirect,
} from "../src/features/setup/model.ts";
import { verifyMembership, restoreWorkspace } from "../src/features/setup/verify-membership.ts";

const profile = {
  businessName: "Kano Agro Distributors",
  businessType: "Wholesale / Distribution",
  location: "HQ Warehouse",
  fullName: "Umar Faruq",
  role: "Owner",
  selectedId: null,
};

test("profile validation requires all four fields and rejects whitespace", () => {
  assert.deepEqual(validateProfile(profile), {});
  const errors = validateProfile({
    ...profile,
    businessName: "  ",
    businessType: "",
    location: "\n",
    fullName: "",
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    "businessName",
    "businessType",
    "fullName",
    "location",
  ]);
});

test("profile names support real Unicode and punctuation", () => {
  assert.deepEqual(
    validateProfile({
      ...profile,
      businessName: "Ọlá & Sons (Nig.)",
      fullName: "Aïsha O’Connor",
    }),
    {},
  );
});

test("role labels come from server roles and unknown roles never become Owner", () => {
  assert.equal(roleFromMembership("org:admin"), "Owner");
  assert.equal(roleFromMembership("org:manager"), "Manager");
  for (const role of ["org:member", "Owner", "admin", "org:supervisor", ""])
    assert.equal(roleFromMembership(role), "Staff");
  assert.equal(readableRole("org:supervisor", "Supervisor"), "Supervisor");
});

test("malformed optional metadata falls back to safe text", () => {
  for (const value of [null, {}, [], 42, false])
    assert.equal(textMetadata(value, "Main location"), "Main location");
  assert.equal(textMetadata("  HQ Warehouse ", ""), "HQ Warehouse");
});

test("unfinished, old or malformed setup data does not unlock completion", () => {
  for (const value of [
    null,
    {},
    "done",
    { version: 1, complete: "true", organizationId: "org_a" },
    { version: 0, complete: true, organizationId: "org_a" },
    { version: 1, complete: true, organizationId: "" },
  ])
    assert.equal(parseSavedSetup(value), null);
  assert.equal(
    parseSavedSetup({
      version: 1,
      complete: true,
      organizationId: "org_a",
      name: "Kano",
    }).organizationId,
    "org_a",
  );
});

test("membership verification follows pagination and returns the actual role", async () => {
  const calls = [];
  const actual = { organization: { id: "org_selected" }, role: "org:member" };
  const found = await verifyMembership(async ({ initialPage, pageSize }) => {
    calls.push({ initialPage, pageSize });
    return initialPage === 1
      ? {
          data: [{ organization: { id: "org_other" }, role: "org:admin" }],
          total_count: 101,
        }
      : { data: [actual], total_count: 101 };
  }, "org_selected");
  assert.equal(found, actual);
  assert.equal(found.role, "org:member");
  assert.deepEqual(calls, [
    { initialPage: 1, pageSize: 100 },
    { initialPage: 2, pageSize: 100 },
  ]);
});

test("an absent or revoked membership is never treated as confirmed", async () => {
  assert.equal(
    await verifyMembership(
      async () => ({ data: [], total_count: 0 }),
      "org_removed",
    ),
    null,
  );
});

test("membership request failures propagate instead of completing setup", async () => {
  await assert.rejects(
    verifyMembership(async () => {
      throw new Error("offline");
    }, "org_selected"),
    /offline/,
  );
});

test("relaunch restores the selected role and organisation instead of resetting to Owner", () => {
  const saved = { ...profile, role: "Staff", selectedId: "inv_pending", step: "review-confirm" };
  const draft = restoreSetupDraft(saved);
  assert.equal(draft.role, "Staff");
  assert.equal(draft.selectedId, "inv_pending");
  assert.equal(resumeSetupStep(saved), "review-confirm");
  assert.equal(restoreSetupDraft({ ...saved, role: "Manager" }).role, "Manager");
});

test("invalid saved progress falls back to an achievable setup step", () => {
  for (const saved of [null, false, "review-confirm", {}, { ...profile, fullName: " " }])
    assert.equal(resumeSetupStep(saved), "create-profile");
  assert.equal(resumeSetupStep({ ...profile, step: "select-role" }), "select-role");
  assert.equal(resumeSetupStep({ ...profile, step: "review-confirm" }), "select-organisation");
  assert.equal(resumeSetupStep({ ...profile, step: "setup-success" }), "select-organisation");
  assert.equal(restoreSetupDraft({ role: "org:admin", selectedId: 7 }).selectedId, null);
});

test("deep links cannot skip required profile fields", () => {
  for (const step of ["select-role", "select-organisation", "join-organisation", "review-confirm"])
    assert.equal(setupRouteRedirect(step, { ...profile, fullName: "" }, "invitation", false), "create-profile");
});

test("missing or revoked selections return to the organisation picker after loading", () => {
  for (const step of ["join-organisation", "review-confirm"]) {
    assert.equal(setupRouteRedirect(step, profile, undefined, true), null);
    assert.equal(setupRouteRedirect(step, profile, undefined, false), "select-organisation");
  }
});

test("an accepted invitation resumes at review while pending invitations keep their own screen", () => {
  assert.equal(setupRouteRedirect("join-organisation", profile, "membership", false), "review-confirm");
  assert.equal(setupRouteRedirect("join-organisation", profile, "invitation", false), null);
  assert.equal(setupRouteRedirect("review-confirm", profile, "create", false), null);
});

const membership = { organization: { id: "org_saved", name: "Live business name" }, role: "org:member" };
const membershipPage = async () => ({ data: [membership], total_count: 1 });

test("returning users restore the verified organisation and use its current name and role", async () => {
  const activations = [];
  const result = await restoreWorkspace({
    organizationId: "org_saved",
    activeOrganizationId: "org_other",
    getMemberships: membershipPage,
    setActive: async (params) => { activations.push(params); },
  });
  assert.equal(result, membership);
  assert.equal(result.role, "org:member");
  assert.deepEqual(activations, [{ organization: "org_saved" }]);
});

test("revoked memberships clear the stale active organisation without granting access", async () => {
  const activations = [];
  const result = await restoreWorkspace({
    organizationId: "org_saved",
    activeOrganizationId: "org_saved",
    getMemberships: async () => ({ data: [], total_count: 0 }),
    setActive: async (params) => { activations.push(params); },
  });
  assert.equal(result, null);
  assert.deepEqual(activations, [{ organization: null }]);
});

test("an already active verified workspace does not repeatedly reactivate", async () => {
  assert.equal(await restoreWorkspace({
    organizationId: "org_saved",
    activeOrganizationId: "org_saved",
    getMemberships: membershipPage,
    setActive: async () => assert.fail("Unnecessary activation"),
  }), membership);
});

test("network and activation failures block workspace entry and remain retryable", async () => {
  const options = { organizationId: "org_saved", activeOrganizationId: null };
  await assert.rejects(restoreWorkspace({
    ...options,
    getMemberships: async () => { throw new Error("offline"); },
    setActive: async () => assert.fail("Unverified membership activated"),
  }), /offline/);
  await assert.rejects(restoreWorkspace({
    ...options,
    getMemberships: membershipPage,
    setActive: async () => { throw new Error("activation failed"); },
  }), /activation failed/);
});

test("an obsolete session check cannot switch organisation after leaving the screen", async () => {
  assert.equal(await restoreWorkspace({
    organizationId: "org_saved",
    activeOrganizationId: "org_other",
    getMemberships: membershipPage,
    setActive: async () => assert.fail("Stale check activated an organisation"),
    isCurrent: () => false,
  }), null);
});
