import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export class TenantError extends Error {}

/**
 * Returns the current user's org context, or throws.
 * Every query touching customer data must scope to the returned organizationId.
 */
export async function requireOrg() {
  const { userId, orgId } = await auth();

  if (!userId) throw new TenantError("Not signed in");
  if (!orgId) throw new TenantError("No organization selected");

  const user = await db.user.findUnique({
    where: { authProviderId: userId },
    select: { id: true },
  });

  if (!user) throw new TenantError("User not synced");

  const membership = await db.membership.findUnique({
    where: {
      userId_organizationId: { userId: user.id, organizationId: orgId },
    },
    select: { role: true },
  });

  if (!membership) throw new TenantError("Not a member of this organization");

  return { userId: user.id, organizationId: orgId, role: membership.role };
}