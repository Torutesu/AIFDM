import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { inngest } from "@/inngest/client";
import { recordEvent } from "@/lib/events";

export async function decideOpportunity(input: {
  opportunityId: string;
  decision: "QUEUED" | "DISMISSED";
  reason?: string;
  note?: string;
}) {
  const { organizationId, userId } = await requireOrg({ minRole: "MEMBER" });

  const opportunity = await db.opportunity.findFirst({
    where: {
      id: input.opportunityId,
      workspace: { organizationId },
    },
  });

  if (!opportunity) throw new Error("Opportunity not found");
  if (opportunity.status !== "OPEN") throw new Error("Already decided");

  const updated = await db.opportunity.update({
    where: { id: input.opportunityId },
    data: {
      status: input.decision,
      decidedAt: new Date(),
      decidedBy: userId,
      dismissReason:
        input.decision === "DISMISSED" ? input.reason ?? null : null,
      decisionNote: input.note ?? null,
    },
  });

  await recordEvent({
    workspaceId: opportunity.workspaceId,
    action:
      input.decision === "QUEUED"
        ? "opportunity.approved"
        : "opportunity.dismissed",
    targetType: "opportunity",
    targetId: input.opportunityId,
    summary: opportunity.title,
    actorId: userId,
  });

  if (input.decision === "QUEUED") {
    await inngest.send({
      name: "content/generate.requested",
      data: { opportunityId: input.opportunityId },
    });
  }

  return updated;
}