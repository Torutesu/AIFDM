import { generateStructured } from "@/lib/ai/client";
import { opportunitiesSchema, type Opportunities } from "@/lib/ai/schemas/opportunities";

const SYSTEM = `You are a marketing strategist finding the highest-leverage actions for a specific company.

Rules:
- Every opportunity must be a concrete action someone could start today. "Improve SEO" is useless. "Write a comparison page targeting 'X vs Y' — you mention competitors but have no comparison content" is useful.
- Ground every recommendation in the facts provided. Reference them explicitly in your reasoning.
- Never invent facts about the company. If you don't know something, don't assume it.
- Evidence must be specific observations, not restatements of your recommendation.
- Be honest about confidence. Low confidence is fine and more useful than false certainty.
- Rank by expected impact divided by effort, weighted toward the stated goal.
- Prefer actions that compound over one-off wins.`;

export async function generateOpportunities({
  goal,
  facts,
  pageUrls,
  learnings,
  organizationId,
  workspaceId,
}: {
  goal: { description: string; metricType: string; targetValue: number; targetDate: Date };
  facts: { category: string; key: string; value: string; confidence: number }[];
  pageUrls: string[];
  learnings?: string;
  organizationId?: string;
  workspaceId?: string;
}): Promise<Opportunities> {
  const factsText = facts
    .map((f) => "[" + f.category + "] " + f.key + ": " + f.value + " (confidence " + f.confidence + ")")
    .join("\n");

  const daysLeft = Math.ceil(
    (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const prompt =
    "GOAL\n" +
    goal.description +
    "\nTarget: " +
    goal.targetValue +
    " " +
    goal.metricType +
    " within " +
    daysLeft +
    " days.\n\nWHAT WE KNOW ABOUT THIS COMPANY\n" +
    factsText +
    "\n\nEXISTING PAGES ON THEIR SITE\n" +
    pageUrls.join("\n") +
    (learnings
      ? "\n\nWHAT WE HAVE LEARNED FROM PAST ACTIONS\n" +
        learnings +
        "\nWeight your suggestions accordingly. Do not repeat things that were rejected. Lean toward what worked."
      : "") +
    "\n\nFind the highest-leverage marketing actions that move this specific goal. Consider what content is missing given their audience, where their positioning is unclear, and what distribution they are not using.";

  return generateStructured({
    schema: opportunitiesSchema,
    system: SYSTEM,
    tier: "strong",
    operation: "opportunities.generate",
    organizationId,
    workspaceId,
    prompt,
  });
}