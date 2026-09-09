import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

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
  const { organizationId } = await requireOrg();

  const draft = await db.contentDraft.findFirst({
    where: { id: input.draftId, workspace: { organizationId } },
  });
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "PUBLISHED") throw new Error("Publish it first");

  if (!input.hypothesis.trim()) throw new Error("Write a hypothesis");

  return db.experiment.create({
    data: {
      draftId: input.draftId,
      workspaceId: draft.workspaceId,
      hypothesis: input.hypothesis.trim(),
      metricType: input.metricType,
      baselineValue: input.baselineValue,
      baselineNote: input.baselineNote?.trim() || null,
    },
  });
}

export async function recordResult(input: {
  experimentId: string;
  resultValue: number;
  resultNote?: string;
}) {
  const { organizationId } = await requireOrg();

  const experiment = await db.experiment.findFirst({
    where: { id: input.experimentId, workspace: { organizationId } },
  });
  if (!experiment) throw new Error("Experiment not found");
  if (experiment.status !== "RUNNING") throw new Error("Already measured");

  return db.experiment.update({
    where: { id: input.experimentId },
    data: {
      resultValue: input.resultValue,
      resultNote: input.resultNote?.trim() || null,
      status: "MEASURED",
      measuredAt: new Date(),
    },
  });
}