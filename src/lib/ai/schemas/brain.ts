import { z } from "zod";

export const factSchema = z.object({
  key: z
    .string()
    .describe("Short snake_case identifier, e.g. 'primary_value_proposition'"),
  value: z.string().describe("The fact itself, stated plainly in one or two sentences"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("How certain you are, based only on evidence in the pages"),
  sourceUrls: z
    .array(z.string())
    .describe("URLs of the pages this fact came from"),
});

export const brainExtractionSchema = z.object({
  product: z
    .array(factSchema)
    .describe("What the company sells, its features, pricing, how it works"),
  audience: z
    .array(factSchema)
    .describe("Who it is for, their role, their problem, their context"),
  positioning: z
    .array(factSchema)
    .describe("How it differentiates, its core claim, its category"),
  voice: z
    .array(factSchema)
    .describe("Tone, vocabulary, formality, recurring phrasing patterns"),
  competitors: z
    .array(factSchema)
    .describe("Named competitors mentioned or clearly implied. Empty if none."),
});

export type BrainExtraction = z.infer<typeof brainExtractionSchema>;