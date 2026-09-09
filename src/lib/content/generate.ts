import { generateStructured } from "@/lib/ai/client";
import {
  contentDraftSchema,
  type ContentDraft,
} from "@/lib/ai/schemas/content";

const SYSTEM = `You are a marketing writer producing publish-ready content for a specific company.

Rules you must follow:
- Only make claims supported by the facts provided. Never invent features, customers, numbers, or capabilities.
- If you need a detail you do not have, write around it rather than guessing.
- Match the company's voice as described in the VOICE facts. Do not default to generic marketing language.
- Write for the audience described in the AUDIENCE facts, not a general reader.
- Produce complete content, not an outline or a template with placeholders.
- List every factual claim about the company separately in groundedClaims so it can be verified.
- No filler. No "in today's fast-paced world". No empty superlatives.`;

export async function generateContent({
  opportunity,
  facts,
  feedback,
  organizationId,
  workspaceId,
}: {
  opportunity: {
    type: string;
    title: string;
    reasoning: string;
    evidence: string[];
  };
  facts: { category: string; key: string; value: string }[];
  feedback?: string;
  organizationId?: string;
  workspaceId?: string;
}): Promise<ContentDraft> {
  const factsText = facts
    .map((f) => "[" + f.category + "] " + f.key + ": " + f.value)
    .join("\n");

  const prompt =
    "THE ACTION TO EXECUTE\n" +
    "Type: " +
    opportunity.type +
    "\n" +
    "Title: " +
    opportunity.title +
    "\n" +
    "Why it matters: " +
    opportunity.reasoning +
    "\n" +
    "Supporting evidence:\n" +
    opportunity.evidence.join("\n") +
    "\n\nWHAT WE KNOW ABOUT THIS COMPANY\n" +
    factsText +
    (feedback
      ? "\n\nA PREVIOUS ATTEMPT WAS REJECTED FOR THIS REASON\n" + feedback + "\nFix this."
      : "") +
    "\n\nWrite the content this action calls for. Ground every claim in the facts above.";

  return generateStructured({
    schema: contentDraftSchema,
    system: SYSTEM,
    tier: "strong",
    operation: "content.generate",
    organizationId,
    workspaceId,
    prompt,
  });
}