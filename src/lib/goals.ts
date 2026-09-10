import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { inngest } from "@/inngest/client";

export async function getActiveGoal(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.goal.findFirst({
    where: { workspaceId, status: "ACTIVE", workspace: { organizationId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listOpportunities(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.opportunity.findMany({
    where: { workspaceId, status: "OPEN", workspace: { organizationId } },
    orderBy: { priorityScore: "desc" },
  });
}

export async function createGoal(input: {
  workspaceId: string;
  description: string;
  metricType: string;
  targetValue: number;
  days: number;
}) {
  const { organizationId } = await requireOrg({ minRole: "MEMBER" });

  const workspace = await db.workspace.findFirst({
    where: { id: input.workspaceId, organizationId },
  });
  if (!workspace) throw new Error("Workspace not found");

  if (!input.description.trim()) throw new Error("Describe your goal");
  if (input.targetValue < 1) throw new Error("Target must be at least 1");

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + input.days);

  await db.goal.updateMany({
    where: { workspaceId: input.workspaceId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  const goal = await db.goal.create({
    data: {
      workspaceId: input.workspaceId,
      description: input.description.trim(),
      metricType: input.metricType,
      targetValue: input.targetValue,
      targetDate,
    },
  });

  await inngest.send({
    name: "opportunities/find.requested",
    data: { goalId: goal.id },
  });

  return goal;
}

export async function listDecided(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.opportunity.findMany({
    where: {
      workspaceId,
      status: { in: ["QUEUED", "DISMISSED"] },
      workspace: { organizationId },
    },
    orderBy: { decidedAt: "desc" },
    take: 20,
  });
}

export async function listDrafts(workspaceId: string) {
  const { organizationId } = await requireOrg();

  return db.contentDraft.findMany({
    where: { workspaceId, workspace: { organizationId } },
    orderBy: { createdAt: "desc" },
    include: { opportunity: { select: { title: true } } },
    take: 20,
  });
}