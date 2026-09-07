import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

export async function listWorkspaces() {
  const { organizationId } = await requireOrg();

  return db.workspace.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createWorkspace(name: string, primaryDomain: string) {
  const { organizationId } = await requireOrg();

  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Name is required");

  let domain: string;
  try {
    const url = new URL(
      primaryDomain.startsWith("http") ? primaryDomain : `https://${primaryDomain}`
    );
    domain = url.hostname;
  } catch {
    throw new Error("Invalid domain");
  }

  return db.workspace.create({
    data: { name: trimmedName, primaryDomain: domain, organizationId },
  });
}