type Draft = {
  id: string;
  format: string;
  title: string;
  body: string;
  score: number | null;
  scoreReasons: string[];
  opportunity: { title: string };
};

function scoreColor(score: number | null) {
  if (score === null) return "text-neutral-500";
  if (score >= 0.8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.6) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function DraftList({ items }: { items: Draft[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <details
          key={d.id}
          className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <summary className="cursor-pointer">
            <span className="font-medium">{d.title}</span>
            <span className="ml-2 text-xs text-neutral-500">
              {d.format.replace(/_/g, " ")}
            </span>
            <span className={"ml-2 text-xs " + scoreColor(d.score)}>
              {d.score === null ? "unscored" : Math.round(d.score * 100) + "%"}
            </span>
          </summary>

          <div className="mt-3 space-y-3">
            <p className="text-xs text-neutral-500">
              From: {d.opportunity.title}
            </p>

            {d.scoreReasons.length > 0 ? (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Review
                </p>
                <ul className="space-y-1">
                  {d.scoreReasons.map((r, i) => (
                    <li
                      key={i}
                      className={
                        r.indexOf("UNSUPPORTED:") === 0
                          ? "text-xs text-red-500"
                          : "text-xs text-neutral-500"
                      }
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Draft
              </p>
              <pre className="whitespace-pre-wrap rounded bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                {d.body}
              </pre>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
