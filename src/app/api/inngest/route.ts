import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/hello";
import { crawlWebsite } from "@/inngest/functions/crawl-website";
import { buildBrain } from "@/inngest/functions/build-brain";
import { syncGsc } from "@/inngest/functions/sync-gsc";
import { findOpportunities } from "@/inngest/functions/find-opportunities";
import { generateContentDraft } from "@/inngest/functions/generate-content";
import { publishDraft } from "@/inngest/functions/publish-draft";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    crawlWebsite,
    buildBrain,
    syncGsc,
    findOpportunities,
    generateContentDraft,
    publishDraft,
  ],
});
