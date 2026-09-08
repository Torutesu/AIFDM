import { getActiveBrain } from "@/lib/brain/queries";
import { FactCard } from "./fact-card";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "Product",
  AUDIENCE: "Audience",
  POSITIONING: "Positioning",
  VOICE: "Brand voice",
  COMPETITOR: "Competitors",
  CONSTRAINT: "Constraints",
};

const ORDER = ["PRODUCT", "AUDIENCE", "POSITIONING", "VOICE", "COMPETITOR", "CONSTRAINT"];

export default async function BrainPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const { workspace, brain } = await getActiveBrain(workspaceId);

  if (!brain) {
    return (
      <div className="max-w-2xl space-y-4">
        <Link href="/dashboard/websites" className="text-sm text-neutral-500">
          ← Websites
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{workspace.name}</h1>
        <p className="text-sm text-neutral-500">
          No knowledge base yet. It builds automatically after the crawl finishes.
        </p>
      </div>
    );
  }

  const grouped = ORDER.map((category) => ({
    category,
    facts: brain.facts.filter((f) => f.category === category),
  })).filter((g) => g.facts.length > 0);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-2">
        <Link href="/dashboard/websites" className="text-sm text-neutral-500">
          ← Websites
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            {workspace.name}
          </h1>
          <span className="text-xs text-neutral-500">
            v{brain.version} · {brain.facts.length} facts
          </span>
        </div>
        <p className="text-sm text-neutral-500">
          Click any fact to correct it. Corrections are locked and survive future
          rebuilds.
        </p>
      </div>

      {grouped.map((group) => (
        <section key={group.category} className="space-y-2">
          <h2 className="text-sm font-medium">
            {CATEGORY_LABELS[group.category]}
          </h2>
          <div className="space-y-2">
            {group.facts.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}