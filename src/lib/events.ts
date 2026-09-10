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