import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { inngest } from "@/inngest/client";
import { recordEvent } from "@/lib/events";

export async function decideDraft(input: {
  draftId: string;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
}) {
  const { organizationId, userId } = await requireOrg({ minRole: "MEMBER" });

  const draft = await db.contentDraft.findFirst({
    where: {
      id: input.draftId,
      workspace: { organizationId },
    },
  });

  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "DRAFT") throw new Error("Already decided");

  const updated = await db.contentDraft.update({
    where: { id: input.draftId },
    data: {
      status: input.decision,
      rejectReason:
        input.decision === "REJECTED" ? input.reason ?? null : null,
    },
  });

  await recordEvent({
    workspaceId: draft.workspaceId,
    action:
      input.decision === "APPROVED" ? "draft.approved" : "draft.rejected",
    targetType: "draft",
    targetId: input.draftId,
    summary: draft.title,
    actorId: userId,
  });

  return updated;
}

export async function regenerateDraft(draftId: string) {
  const { organizationId, userId } = await requireOrg({ minRole: "MEMBER" });

  const draft = await db.contentDraft.findFirst({
    where: {
      id: draftId,
      workspace: { organizationId },
    },
  });

  if (!draft) throw new Error("Draft not found");

  await inngest.send({
    name: "content/generate.requested",
    data: {
      opportunityId: draft.opportunityId,
      feedback: draft.rejectReason ?? undefined,
    },
  });

  await recordEvent({
    workspaceId: draft.workspaceId,
    action: "draft.regenerated",
    targetType: "draft",
    targetId: draftId,
    summary: draft.title,
    actorId: userId,
  });

  return draft;
}

export async function publishDraftById(draftId: string) {
  const { organizationId, userId } = await requireOrg({ minRole: "MEMBER" });

  const draft = await db.contentDraft.findFirst({
    where: { id: draftId, workspace: { organizationId } },
  });

  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "APPROVED") throw new Error("Approve it first");

  await inngest.send({
    name: "draft/publish.requested",
    data: { draftId },
  });

  await recordEvent({
    workspaceId: draft.workspaceId,
    action: "draft.publish_requested",
    targetType: "draft",
    targetId: draftId,
    summary: draft.title,
    actorId: userId,
  });

  return draft;
}

export async function saveGithubSettings(input: {
  workspaceId: string;
  owner: string;
  repo: string;
  path: string;
}) {
  const { organizationId } = await requireOrg({ minRole: "ADMIN" });

  const workspace = await db.workspace.findFirst({
    where: { id: input.workspaceId, organizationId },
  });
  if (!workspace) throw new Error("Workspace not found");

  return db.workspace.update({
    where: { id: input.workspaceId },
    data: {
      githubOwner: input.owner.trim(),
      githubRepo: input.repo.trim(),
      githubPath: input.path.trim() || "content",
    },
  });
}