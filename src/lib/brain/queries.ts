import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

export async function getActiveBrain(workspaceId: string) {
  const { organizationId } = await requireOrg();

  const workspace = await db.workspace.findFirst({
    where: { id: workspaceId, organizationId },
    select: { id: true, name: true },
  });
  if (!workspace) throw new Error("Workspace not found");

  const brain = await db.brain.findFirst({
    where: { workspaceId, status: "ACTIVE" },
        include: {
      facts: {
        orderBy: [{ category: "asc" }, { confidence: "desc" }],
      },
    },
  });

  return { workspace, brain };
}

export async function updateFact(
  factId: string,
  data: { value?: string; isUserLocked?: boolean }
) {
  const { organizationId } = await requireOrg();

  const fact = await db.brainFact.findFirst({
    where: { id: factId, brain: { workspace: { organizationId } } },
  });
  if (!fact) throw new Error("Fact not found");

  return db.brainFact.update({
    where: { id: factId },
    data: {
      ...data,
      ...(data.value !== undefined
        ? { sourceType: "USER" as const, confidence: 1 }
        : {}),
    },
  });
}

export async function getIntegration(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.integration.findFirst({
    where: {
      workspaceId,
      provider: "google_search_console",
      workspace: { organizationId },
    },
  });
}