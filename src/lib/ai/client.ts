import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "@/lib/db";

const MODELS = {
  fast: "gpt-4o-mini",
  strong: "gpt-4o",
} as const;

const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.015, output: 0.06 },
  "gpt-4o": { input: 0.25, output: 1.0 },
};

type Tier = keyof typeof MODELS;

export async function generateStructured<T>({
  schema,
  prompt,
  system,
  tier = "fast",
  operation,
  organizationId,
  workspaceId,
}: {
  schema: z.ZodType<T>;
  prompt: string;
  system?: string;
  tier?: Tier;
  operation: string;
  organizationId?: string;
  workspaceId?: string;
}): Promise<T> {
  const model = MODELS[tier];

  const result = await generateObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: openai(model) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: schema as any,
    prompt,
    system,
    maxRetries: 2,
    abortSignal: AbortSignal.timeout(120_000),
  });

  const inputTokens = result.usage?.inputTokens ?? 0;
  const outputTokens = result.usage?.outputTokens ?? 0;
  const rates = PRICING[model];
  const costCents =
    (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;

  await db.usageRecord.create({
    data: {
      provider: "openai",
      model,
      operation,
      inputTokens,
      outputTokens,
      costCents,
      organizationId,
      workspaceId,
    },
  });

  return result.object as T;
}