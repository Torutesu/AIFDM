import { generateStructured } from "@/lib/ai/client";
import {
  rubricScoreSchema,
  type RubricScore,
} from "@/lib/ai/schemas/content";

const SYSTEM = `You are a strict editor reviewing marketing content before it is published.

Score against these criteria:
- Grounding: is every factual claim supported by the provided facts? This matters most.
- Voice: does it match the company's described voice, or does it read as generic marketing copy?
- Audience fit: is it written for the stated audience, or for a general reader?
- Specificity: does it say something concrete, or is it filler?
- Completeness: is it ready to publish, or does it have gaps and placeholders?

Rules:
- Be harsh. A score above 0.8 means you would publish this as-is.
- Any unsupported claim caps the score at 0.5, no matter how well written.
- List every unsupported claim separately. If a claim is partially supported, list it.
- Give specific reasons, not vague praise. "Good tone" is useless. "Uses the same short declarative sentences as the source pages" is useful.
- Note strengths as well as weaknesses.`;

export async function scoreContent({
  draft,
  facts,
  organizationId,
  workspaceId,
}: {
  draft: {
    title: string;
    body: string;
    groundedClaims: string[];
  };
  facts: { category: string; key: string; value: string }[];
  organizationId?: string;
  workspaceId?: string;
}): Promise<RubricScore> {
  const factsText = facts
    .map((f) => "[" + f.category + "] " + f.key + ": " + f.value)
    .join("\n");

  const prompt =
    "THE FACTS THIS CONTENT MUST BE GROUNDED IN\n" +
    factsText +
    "\n\nCLAIMS THE WRITER SAYS THEY MADE\n" +
    draft.groundedClaims.join("\n") +
    "\n\nTHE DRAFT\n" +
    "Title: " +
    draft.title +
    "\n\n" +
    draft.body +
    "\n\nScore this draft. Check each claim against the facts above.";

  return generateStructured({
    schema: rubricScoreSchema,
    system: SYSTEM,
    tier: "strong",
    operation: "content.score",
    organizationId,
    workspaceId,
    prompt,
  });
}