import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { crawlSite } from "@/lib/crawl/firecrawl";
import { createHash } from "crypto";

export const crawlWebsite = inngest.createFunction(
  {
    id: "crawl-website",
    triggers: [{ event: "website/crawl.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { websiteId } = event.data as { websiteId: string };

    const website = await step.run("load-website", async () => {
      const w = await db.website.findUnique({ where: { id: websiteId } });
      if (!w) throw new Error(`Website ${websiteId} not found`);
      await db.website.update({
        where: { id: websiteId },
        data: { crawlStatus: "RUNNING", error: null },
      });
      return w;
    });

    try {
      const docs = await step.run("crawl", async () => {
        return crawlSite(website.url, 20);
      });

      await step.run("save-pages", async () => {
        for (const doc of docs) {
          const contentHash = createHash("sha256")
            .update(doc.markdown)
            .digest("hex");

          await db.crawledPage.upsert({
            where: { websiteId_url: { websiteId, url: doc.url } },
            create: {
              websiteId,
              url: doc.url,
              title: doc.title,
              markdown: doc.markdown,
              contentHash,
            },
            update: {
              title: doc.title,
              markdown: doc.markdown,
              contentHash,
              crawledAt: new Date(),
            },
          });
        }
      });

      await step.run("mark-complete", async () => {
        await db.website.update({
          where: { id: websiteId },
          data: {
            crawlStatus: "COMPLETED",
            pageCount: docs.length,
            lastCrawledAt: new Date(),
          },
        });
      });

      return { pageCount: docs.length };
    } catch (err) {
      await step.run("mark-failed", async () => {
        await db.website.update({
          where: { id: websiteId },
          data: {
            crawlStatus: "FAILED",
            error: err instanceof Error ? err.message : "Crawl failed",
          },
        });
      });
      throw err;
    }
  }
);