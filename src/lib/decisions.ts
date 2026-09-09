import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";

export async function decideOpportunity(input: {
  opportunityId: string;
  decision: "APPROVED" | "DISMISSED";
  note?: string;
}) {
  const { organizationId, userId } = await requireOrg();

  const opportunity = await db.opportunity.findFirst({
    where: {
      id: input.opportunityId,
      workspace: { organizationId },
    },
  });

  if (!opportunity) throw new Error("Opportunity not found");
  if (opportunity.status !== "OPEN") throw new Error("Already decided");

  return db.opportunity.update({
    where: { id: input.opportunityId },
    data: {
      status: input.decision,
      decidedAt: new Date(),
      decidedBy: userId,
      decisionNote: input.note ?? null,
    },
  });
}