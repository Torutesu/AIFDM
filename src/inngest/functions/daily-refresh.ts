import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";

export const dailyRefresh = inngest.createFunction(
  {
    id: "daily-refresh",
    retries: 1,
    triggers: [{ cron: "0 6 * * *" }],
  },
  async ({ step }) => {
    const goals = await step.run("load-active-goals", async () => {
      return db.goal.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, workspaceId: true },
      });
    });

    for (const goal of goals) {
      await step.sendEvent("find-" + goal.id, {
        name: "opportunities/find.requested",
        data: { goalId: goal.id },
      });
    }

    return { goals: goals.length };
  }
);