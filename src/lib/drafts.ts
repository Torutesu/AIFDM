import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { inngest } from "@/inngest/client";

export async function decideDraft(input: {
  draftId: string;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
}) {
  const { organizationId } = await requireOrg();

  const draft = await db.contentDraft.findFirst({
    where: {
      id: input.draftId,
      workspace: { organizationId },
    },
  });

  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "DRAFT") throw new Error("Already decided");

  return db.contentDraft.update({
    where: { id: input.draftId },
    data: {
      status: input.decision,
      rejectReason:
        input.decision === "REJECTED" ? input.reason ?? null : null,
    },
  });
}

export async function regenerateDraft(draftId: string) {
  const { organizationId } = await requireOrg();

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

  return draft;
}