// A verified identity may still need to choose an organisation. That task is
// completed by our setup flow; other verification tasks stay with Clerk.
export function sessionAccess(isSignedIn: boolean | undefined, taskKey?: string) {
  const choosingOrganization = !!isSignedIn && taskKey === "choose-organization";
  return {
    canSetUp: !!isSignedIn && (!taskKey || choosingOrganization),
    canOpenWorkspace: !!isSignedIn && !taskKey,
    needsVerification: !!taskKey && !choosingOrganization,
    choosingOrganization,
  };
}
