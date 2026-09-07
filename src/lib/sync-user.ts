import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function syncUser() {
  const { userId, orgId, orgRole, orgSlug } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const user = await db.user.upsert({
    where: { authProviderId: userId },
    create: { authProviderId: userId, email, name },
    update: { email, name },
  });

  if (!orgId) return { user, organization: null, membership: null };

  const organization = await db.organization.upsert({
    where: { id: orgId },
    create: {
      id: orgId,
      name: orgSlug ?? "Organization",
      slug: orgSlug ?? orgId,
    },
    update: {},
  });

  const membership = await db.membership.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId: organization.id },
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: orgRole === "org:admin" ? "OWNER" : "MEMBER",
    },
    update: {},
  });

  return { user, organization, membership };
}