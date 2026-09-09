type Decided = {
  id: string;
  title: string;
  status: string;
  dismissReason: string | null;
  decisionNote: string | null;
  decidedAt: Date | null;
};

export function DecidedList({ items }: { items: Decided[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((o) => (
        <div
          key={o.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
        >
          <div className="min-w-0">
            <p className="truncate text-sm">{o.title}</p>
            {o.dismissReason ? (
              <p className="mt-0.5 text-xs text-neutral-500">
                {o.dismissReason}
                {o.decisionNote ? " — " + o.decisionNote : ""}
              </p>
            ) : null}
          </div>
          <span
            className={
              o.status === "QUEUED"
                ? "shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800"
            }
          >
            {o.status === "QUEUED" ? "Queued" : "Dismissed"}
          </span>
        </div>
      ))}
    </div>
  );
}