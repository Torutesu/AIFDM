import { z } from "zod";

export const opportunitySchema = z.object({
  type: z
    .enum(["content_gap", "positioning_fix", "technical_seo", "page_improvement", "distribution"])
    .describe("The kind of work this is"),
  title: z
    .string()
    .describe("One specific action, under 12 words. Not a topic — an action."),
  reasoning: z
    .string()
    .describe("Why this matters for the stated goal, in 2-3 sentences. Reference specific facts."),
  evidence: z
    .array(z.string())
    .describe("Concrete observations from the site or knowledge base that justify this"),
  expectedImpact: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  effort: z.enum(["low", "medium", "high"]),
  risks: z.string().nullable().describe("What could go wrong, or null if nothing notable"),
});

export const opportunitiesSchema = z.object({
  opportunities: z
    .array(opportunitySchema)
    .describe("Between 5 and 8 opportunities, ranked most valuable first"),
});

export type Opportunities = z.infer<typeof opportunitiesSchema>;