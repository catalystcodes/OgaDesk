type Membership = { organization: { id: string } };
type Page<T> = { data: T[]; total_count: number };

// Memberships are read from Clerk, independently of client-side preferences.
// Follow pagination so users with many organisations can select any of them.
export async function verifyMembership<T extends Membership>(
  getMemberships: (params: {
    pageSize: number;
    initialPage: number;
  }) => Promise<Page<T>>,
  organizationId: string,
): Promise<T | null> {
  const first = await getMemberships({ pageSize: 100, initialPage: 1 });
  let membership = first.data.find(
    (member) => member.organization.id === organizationId,
  );
  for (
    let page = 2;
    !membership && (page - 1) * 100 < first.total_count;
    page++
  ) {
    const next = await getMemberships({ pageSize: 100, initialPage: page });
    membership = next.data.find(
      (member) => member.organization.id === organizationId,
    );
  }
  return membership || null;
}

type WorkspaceMembership = { organization: { id: string; name: string }; role: string };

// A saved organisation ID is only a preference; it never proves access.
export async function restoreWorkspace<T extends WorkspaceMembership>({
  organizationId,
  activeOrganizationId,
  getMemberships,
  setActive,
  isCurrent = () => true,
}: {
  organizationId: string;
  activeOrganizationId: string | null | undefined;
  getMemberships: (params: { pageSize: number; initialPage: number }) => Promise<{ data: T[]; total_count: number }>;
  setActive: (params: { organization: string | null }) => Promise<unknown>;
  isCurrent?: () => boolean;
}): Promise<T | null> {
  const membership = await verifyMembership(getMemberships, organizationId);
  if (!isCurrent()) return null;
  if (!membership) {
    if (activeOrganizationId === organizationId) await setActive({ organization: null });
    return null;
  }
  if (activeOrganizationId !== organizationId) await setActive({ organization: organizationId });
  return membership;
}
