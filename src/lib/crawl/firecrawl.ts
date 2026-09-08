import Firecrawl from "@mendable/firecrawl-js";

export type CrawledDoc = {
  url: string;
  title: string | null;
  markdown: string;
};

const client = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });

export async function crawlSite(
  url: string,
  limit = 20
): Promise<CrawledDoc[]> {
  const result = await client.crawl(url, {
    limit,
    scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
  });

  const docs = result.data ?? [];

  return docs
    .map((d) => ({
      url: d.metadata?.sourceURL ?? d.metadata?.url ?? "",
      title: d.metadata?.title ?? null,
      markdown: d.markdown ?? "",
    }))
    .filter((d) => d.url && d.markdown.length > 100);
}