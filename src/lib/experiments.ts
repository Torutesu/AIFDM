import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { recordEvent } from "@/lib/events";

export async function listExperiments(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.experiment.findMany({
    where: { workspaceId, workspace: { organizationId } },
    orderBy: { startedAt: "desc" },
    include: { draft: { select: { title: true, prUrl: true } } },
    take: 20,
  });
}

export async function startExperiment(input: {
  draftId: string;
  hypothesis: string;
  metricType: string;
  baselineValue: number;
  baselineNote?: string;
}) {
  const { organizationId, userId } = await requireOrg();

  const draft = await db.contentDraft.findFirst({
    where: { id: input.draftId, workspace: { organizationId } },
  });
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "PUBLISHED") throw new Error("Publish it first");

  if (!input.hypothesis.trim()) throw new Error("Write a hypothesis");

  const experiment = await db.experiment.create({
    data: {
      draftId: input.draftId,
      workspaceId: draft.workspaceId,
      hypothesis: input.hypothesis.trim(),
      metricType: input.metricType,
      baselineValue: input.baselineValue,
      baselineNote: input.baselineNote?.trim() || null,
    },
  });

  await recordEvent({
    workspaceId: draft.workspaceId,
    action: "experiment.started",
    targetType: "experiment",
    targetId: experiment.id,
    summary: experiment.hypothesis,
    actorId: userId,
  });

  return experiment;
}

export async function recordResult(input: {
  experimentId: string;
  resultValue: number;
  resultNote?: string;
}) {
  const { organizationId, userId } = await requireOrg();

  const experiment = await db.experiment.findFirst({
    where: { id: input.experimentId, workspace: { organizationId } },
  });
  if (!experiment) throw new Error("Experiment not found");
  if (experiment.status !== "RUNNING") throw new Error("Already measured");

  const updated = await db.experiment.update({
    where: { id: input.experimentId },
    data: {
      resultValue: input.resultValue,
      resultNote: input.resultNote?.trim() || null,
      status: "MEASURED",
      measuredAt: new Date(),
    },
  });

  await recordEvent({
    workspaceId: experiment.workspaceId,
    action: "experiment.measured",
    targetType: "experiment",
    targetId: input.experimentId,
    summary: experiment.hypothesis,
    actorId: userId,
  });

  return updated;
}

export async function getLearnings(workspaceId: string) {
  const { organizationId } = await requireOrg();

  const measured = await db.experiment.findMany({
    where: {
      workspaceId,
      status: "MEASURED",
      workspace: { organizationId },
    },
    include: {
      draft: {
        select: { format: true, opportunity: { select: { type: true } } },
      },
    },
    orderBy: { measuredAt: "desc" },
    take: 20,
  });

  const dismissed = await db.opportunity.findMany({
    where: {
      workspaceId,
      status: "DISMISSED",
      dismissReason: { not: null },
      workspace: { organizationId },
    },
    select: { type: true, title: true, dismissReason: true },
    take: 20,
  });

  return { measured, dismissed };
}