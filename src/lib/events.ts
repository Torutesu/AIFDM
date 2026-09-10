import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

export async function recordEvent(input: {
  workspaceId: string;
  action: string;
  targetType: string;
  targetId?: string;
  summary: string;
  actorId?: string;
}) {
  return db.event.create({
    data: {
      workspaceId: input.workspaceId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      summary: input.summary,
      actorId: input.actorId ?? null,
    },
  });
}

export async function listEvents(workspaceId: string, limit = 30) {
  const { organizationId } = await requireOrg();

  return db.event.findMany({
    where: { workspaceId, workspace: { organizationId } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDigest(workspaceId: string) {
  const { organizationId } = await requireOrg();

  const workspace = await db.workspace.findFirst({
    where: { id: workspaceId, organizationId },
  });
  if (!workspace) throw new Error("Workspace not found");

  const openOpportunities = await db.opportunity.count({
    where: { workspaceId, status: "OPEN" },
  });

  const draftsWaiting = await db.contentDraft.count({
    where: { workspaceId, status: "DRAFT" },
  });

  const readyToPublish = await db.contentDraft.count({
    where: { workspaceId, status: "APPROVED" },
  });

  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - 14);

  const experimentsToMeasure = await db.experiment.count({
    where: {
      workspaceId,
      status: "RUNNING",
      startedAt: { lt: staleCutoff },
    },
  });

  const queuedNoDraft = await db.opportunity.count({
    where: {
      workspaceId,
      status: "QUEUED",
      drafts: { none: {} },
    },
  });

  return {
    openOpportunities,
    draftsWaiting,
    readyToPublish,
    experimentsToMeasure,
    queuedNoDraft,
  };
}