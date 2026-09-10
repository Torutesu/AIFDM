import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { inngest } from "@/inngest/client";

export async function listWorkspaces() {
  const { organizationId } = await requireOrg();

  return db.workspace.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { websites: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export async function createWorkspace(name: string, primaryDomain: string) {
  const { organizationId } = await requireOrg({ minRole: "MEMBER" });

  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Name is required");

  let domain: string;
  let fullUrl: string;
  try {
    const url = new URL(
      primaryDomain.startsWith("http") ? primaryDomain : `https://${primaryDomain}`
    );
    domain = url.hostname;
    fullUrl = url.origin;
  } catch {
    throw new Error("Invalid domain");
  }

  const workspace = await db.workspace.create({
    data: {
      name: trimmedName,
      primaryDomain: domain,
      organizationId,
      websites: { create: { url: fullUrl } },
    },
    include: { websites: true },
  });

  await inngest.send({
    name: "website/crawl.requested",
    data: { websiteId: workspace.websites[0].id },
  });

  return workspace;
}