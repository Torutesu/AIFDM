import { z } from "zod";

export const contentDraftSchema = z.object({
  format: z
    .enum(["landing_page", "blog_post", "comparison_page", "faq", "email"])
    .describe("The content format that best fits this action"),
  title: z
    .string()
    .describe("The headline or page title. Specific, not generic."),
  body: z
    .string()
    .describe(
      "The full content in markdown. Complete and ready to publish, not an outline."
    ),
  groundedClaims: z
    .array(z.string())
    .describe(
      "Every factual claim made about the company, listed separately so it can be checked"
    ),
});

export type ContentDraft = z.infer<typeof contentDraftSchema>;

export const rubricScoreSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall quality score from 0 to 1"),
  reasons: z
    .array(z.string())
    .describe(
      "Specific observations explaining the score. Both strengths and weaknesses."
    ),
  unsupportedClaims: z
    .array(z.string())
    .describe(
      "Any claim in the draft not supported by the provided facts. Empty if all grounded."
    ),
});

export type RubricScore = z.infer<typeof rubricScoreSchema>;
