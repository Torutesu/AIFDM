import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { generateOpportunities } from "@/lib/opportunities/generate";

const IMPACT_WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 };
const EFFORT_WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 };

export const findOpportunities = inngest.createFunction(
  {
    id: "find-opportunities",
    triggers: [{ event: "opportunities/find.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { goalId } = event.data as { goalId: string };

    const context = await step.run("load-context", async () => {
      const goal = await db.goal.findUnique({
        where: { id: goalId },
        include: {
          workspace: {
            select: {
              id: true,
              organizationId: true,
              websites: { select: { id: true } },
            },
          },
        },
      });
      if (!goal) throw new Error("Goal not found");

      const brain = await db.brain.findFirst({
        where: { workspaceId: goal.workspaceId, status: "ACTIVE" },
        include: { facts: true },
      });
      if (!brain) throw new Error("No knowledge base yet");

      const websiteIds = goal.workspace.websites.map((w) => w.id);
      const pages = await db.crawledPage.findMany({
        where: { websiteId: { in: websiteIds } },
        select: { url: true },
        take: 50,
      });

      const measured = await db.experiment.findMany({
        where: { workspaceId: goal.workspaceId, status: "MEASURED" },
        include: {
          draft: {
            select: {
              format: true,
              opportunity: { select: { type: true } },
            },
          },
        },
        orderBy: { measuredAt: "desc" },
        take: 20,
      });

      const dismissed = await db.opportunity.findMany({
        where: {
          workspaceId: goal.workspaceId,
          status: "DISMISSED",
          dismissReason: { not: null },
        },
        select: { type: true, title: true, dismissReason: true },
        take: 20,
      });

      return {
        goal,
        facts: brain.facts,
        pageUrls: pages.map((p) => p.url),
        measured,
        dismissed,
      };
    });

    const learningLines: string[] = [];

    for (const m of context.measured) {
      const pct =
        m.baselineValue === 0 || m.resultValue === null
          ? null
          : Math.round(
              ((m.resultValue - m.baselineValue) / m.baselineValue) * 100
            );
      learningLines.push(
        "WORKED (" +
          (pct === null ? "unknown" : pct + "%") +
          "): " +
          m.draft.opportunity.type +
          " as " +
          m.draft.format +
          " - " +
          m.hypothesis
      );
    }

    for (const d of context.dismissed) {
      learningLines.push(
        "REJECTED: " + d.type + " - " + d.title + " (" + d.dismissReason + ")"
      );
    }

    const learnings =
      learningLines.length > 0 ? learningLines.join("\n") : undefined;

    const result = await step.run("generate", async () => {
      return generateOpportunities({
        goal: {
          description: context.goal.description,
          metricType: context.goal.metricType,
          targetValue: context.goal.targetValue,
          targetDate: new Date(context.goal.targetDate),
        },
        facts: context.facts.map((f) => ({
          category: f.category,
          key: f.key,
          value: f.value,
          confidence: f.confidence,
        })),
        pageUrls: context.pageUrls,
        learnings,
        organizationId: context.goal.workspace.organizationId,
        workspaceId: context.goal.workspaceId,
      });
    });

    await step.run("save", async () => {
      const workspaceId = context.goal.workspaceId;

      await db.opportunity.updateMany({
        where: { workspaceId, status: "OPEN" },
        data: { status: "EXPIRED" },
      });

      await db.opportunity.createMany({
        data: result.opportunities.map((o) => ({
          workspaceId,
          type: o.type,
          title: o.title,
          reasoning: o.reasoning,
          evidence: o.evidence,
          expectedImpact: o.expectedImpact,
          confidence: o.confidence,
          effort: o.effort,
          risks: o.risks,
          priorityScore:
            (IMPACT_WEIGHT[o.expectedImpact] / EFFORT_WEIGHT[o.effort]) *
            o.confidence,
        })),
      });
    });

    return { count: result.opportunities.length };
  }
);