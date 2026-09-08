import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { fetchSearchAnalytics } from "@/lib/integrations/google/gsc";

export const syncGsc = inngest.createFunction(
  {
    id: "sync-gsc",
    triggers: [{ event: "gsc/sync.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { integrationId } = event.data as { integrationId: string };

    const integration = await step.run("load-integration", async () => {
      const i = await db.integration.findUnique({
        where: { id: integrationId },
      });
      if (!i) throw new Error("Integration not found");
      if (!i.siteUrl) throw new Error("No site selected");
      return i;
    });

    const rows = await step.run("fetch-analytics", async () => {
      return fetchSearchAnalytics({
        integrationId,
        siteUrl: integration.siteUrl!,
        days: 90,
      });
    });

    await step.run("save-metrics", async () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      await db.metric.deleteMany({
        where: { workspaceId: integration.workspaceId, source: "gsc" },
      });

      if (rows.length > 0) {
        await db.metric.createMany({
                    data: rows.map((r: {
            query: string;
            page: string;
            clicks: number;
            impressions: number;
            ctr: number;
            position: number;
          }) => ({
            workspaceId: integration.workspaceId,
            source: "gsc",
            metricType: "search_performance",
            query: r.query,
            page: r.page,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position,
            date,
          })),
        });
      }

      await db.integration.update({
        where: { id: integrationId },
        data: { lastSyncAt: new Date() },
      });
    });

    return { rowCount: rows.length };
  }
);