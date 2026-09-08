import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/hello";
import { crawlWebsite } from "@/inngest/functions/crawl-website";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, crawlWebsite],
});