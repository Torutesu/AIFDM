import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { extractBrainFacts } from "@/lib/brain/extract";
import type { FactCategory } from "@/generated/prisma/client";

export const buildBrain = inngest.createFunction(
  {
    id: "build-brain",
    triggers: [{ event: "brain/build.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { websiteId } = event.data as { websiteId: string };

    const context = await step.run("load-pages", async () => {
      const website = await db.website.findUnique({
        where: { id: websiteId },
        include: {
          pages: { orderBy: { crawledAt: "desc" }, take: 20 },
          workspace: { select: { id: true, organizationId: true } },
        },
      });
      if (!website) throw new Error(`Website ${websiteId} not found`);
      if (website.pages.length === 0) throw new Error("No pages crawled yet");
      return website;
    });

    const extraction = await step.run("extract-facts", async () => {
      return extractBrainFacts({
        pages: context.pages,
        organizationId: context.workspace.organizationId,
        workspaceId: context.workspace.id,
      });
    });

    const brainId = await step.run("save-brain", async () => {
      const workspaceId = context.workspace.id;

      const latest = await db.brain.findFirst({
        where: { workspaceId },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const version = (latest?.version ?? 0) + 1;

      const lockedFacts = await db.brainFact.findMany({
        where: { brain: { workspaceId, status: "ACTIVE" }, isUserLocked: true },
      });
      const lockedKeys = new Set(lockedFacts.map((f) => `${f.category}:${f.key}`));

      const groups: [FactCategory, typeof extraction.product][] = [
        ["PRODUCT", extraction.product],
        ["AUDIENCE", extraction.audience],
        ["POSITIONING", extraction.positioning],
        ["VOICE", extraction.voice],
        ["COMPETITOR", extraction.competitors],
      ];

      const newFacts = groups.flatMap(([category, facts]) =>
        facts
          .filter((f) => !lockedKeys.has(`${category}:${f.key}`))
          .map((f) => ({
            category,
            key: f.key,
            value: f.value,
            confidence: f.confidence,
            sourceType: "CRAWL" as const,
            sourceUrls: f.sourceUrls,
          }))
      );

      const carriedOver = lockedFacts.map((f) => ({
        category: f.category,
        key: f.key,
        value: f.value,
        confidence: f.confidence,
        sourceType: f.sourceType,
        sourceUrls: f.sourceUrls,
        isUserLocked: true,
      }));

      await db.brain.updateMany({
        where: { workspaceId, status: "ACTIVE" },
        data: { status: "SUPERSEDED" },
      });

      const brain = await db.brain.create({
        data: {
          workspaceId,
          version,
          status: "ACTIVE",
          facts: { create: [...newFacts, ...carriedOver] },
        },
      });

      return brain.id;
    });

    return { brainId };
  }
);