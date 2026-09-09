type Opportunity = {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  evidence: string[];
  expectedImpact: string;
  confidence: number;
  effort: string;
  risks: string | null;
};

const IMPACT_COLOR: Record<string, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-neutral-500",
};

export function OpportunityList({ items }: { items: Opportunity[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No opportunities yet. Set a goal above and we&apos;ll find them.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((o) => (
        <div
          key={o.id}
          className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">{o.title}</p>
            <span className="shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {o.type.replace(/_/g, " ")}
            </span>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Why
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {o.reasoning}
            </p>
          </div>

          {o.evidence.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Evidence
              </p>
              <ul className="space-y-1">
                {o.evidence.map((e, i) => (
                  <li
                    key={i}
                    className="text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    · {e}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {o.risks ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Risk
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {o.risks}
              </p>
            </div>
          ) : null}

          <div className="flex gap-4 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
            <span>
              <span className="text-neutral-400">Impact </span>
              <span className={IMPACT_COLOR[o.expectedImpact]}>
                {o.expectedImpact}
              </span>
            </span>
            <span>
              <span className="text-neutral-400">Effort </span>
              {o.effort}
            </span>
            <span>
              <span className="text-neutral-400">Confidence </span>
              {Math.round(o.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}