import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export class TenantError extends Error {}

/**
 * Roles, least to most privileged. A membership satisfies a requirement when it
 * ranks at or above it.
 *
 *   VIEWER  read everything in the organization, change nothing
 *   MEMBER  run the marketing loop: goals, decisions, drafts, publishing
 *   ADMIN   the above, plus settings that reach outside the app: the GitHub
 *           repository a workspace publishes to, and Google account connections
 *   OWNER   the above
 */
const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const ROLE_REQUIREMENT_MESSAGE: Record<Role, string> = {
  VIEWER: "You do not have access to this organization",
  MEMBER: "Your role is read-only, so you cannot change anything here",
  ADMIN: "Only an admin or owner can change this",
  OWNER: "Only the owner can change this",
};

export function hasRole(role: Role, minRole: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

/**
 * Returns the current user's org context, or throws.
 *
 * Every query touching customer data must scope to the returned organizationId.
 * Every mutation must additionally pass the `minRole` it requires — the default
 * is read-only access, so forgetting it fails closed for writes only in the
 * sense that the caller gets no privilege check, which is why the rule is:
 * if it writes, name a role.
 */
export async function requireOrg(options?: { minRole?: Role }) {
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

  const minRole = options?.minRole;
  if (minRole && !hasRole(membership.role, minRole)) {
    throw new TenantError(ROLE_REQUIREMENT_MESSAGE[minRole]);
  }

  return { userId: user.id, organizationId: orgId, role: membership.role };
}
