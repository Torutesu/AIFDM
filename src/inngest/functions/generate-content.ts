import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { generateContent } from "@/lib/content/generate";
import { scoreContent } from "@/lib/content/score";

export const generateContentDraft = inngest.createFunction(
  {
    id: "generate-content",
    triggers: [{ event: "content/generate.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { opportunityId } = event.data as { opportunityId: string };

    const context = await step.run("load-context", async () => {
      const opportunity = await db.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          workspace: { select: { id: true, organizationId: true } },
        },
      });
      if (!opportunity) throw new Error("Opportunity not found");

      const brain = await db.brain.findFirst({
        where: { workspaceId: opportunity.workspaceId, status: "ACTIVE" },
        include: { facts: true },
      });
      if (!brain) throw new Error("No knowledge base yet");

      return { opportunity, facts: brain.facts };
    });

    const facts = context.facts.map((f) => ({
      category: f.category,
      key: f.key,
      value: f.value,
    }));

    const draft = await step.run("generate", async () => {
      return generateContent({
        opportunity: {
          type: context.opportunity.type,
          title: context.opportunity.title,
          reasoning: context.opportunity.reasoning,
          evidence: context.opportunity.evidence,
        },
        facts,
        organizationId: context.opportunity.workspace.organizationId,
        workspaceId: context.opportunity.workspaceId,
      });
    });

    const rubric = await step.run("score", async () => {
      return scoreContent({
        draft: {
          title: draft.title,
          body: draft.body,
          groundedClaims: draft.groundedClaims,
        },
        facts,
        organizationId: context.opportunity.workspace.organizationId,
        workspaceId: context.opportunity.workspaceId,
      });
    });

    await step.run("save", async () => {
      await db.contentDraft.create({
        data: {
          opportunityId,
          workspaceId: context.opportunity.workspaceId,
          format: draft.format,
          title: draft.title,
          body: draft.body,
          score: rubric.score,
          scoreReasons: rubric.reasons.concat(
            rubric.unsupportedClaims.map((c) => "UNSUPPORTED: " + c)
          ),
        },
      });
    });

    return { score: rubric.score, format: draft.format };
  }
);