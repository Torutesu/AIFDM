type Event = {
  id: string;
  action: string;
  summary: string;
  createdAt: Date;
};

const LABELS: Record<string, string> = {
  "opportunity.approved": "Approved",
  "opportunity.dismissed": "Dismissed",
  "draft.approved": "Draft approved",
  "draft.rejected": "Draft rejected",
  "draft.regenerated": "Regenerated",
  "draft.publish_requested": "Published",
  "experiment.started": "Experiment started",
  "experiment.measured": "Result recorded",
};

function ago(date: Date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

export function ActivityFeed({ items }: { items: Event[] }) {
  if (items.length === 0) return null;

  return (
    <details className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <summary className="cursor-pointer text-sm font-medium">
        Activity
        <span className="ml-2 text-xs text-neutral-500">
          {items.length} recent
        </span>
      </summary>

      <div className="mt-3 space-y-2">
        {items.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs text-neutral-400">
                {LABELS[e.action] ?? e.action}
              </span>
              <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                {e.summary}
              </p>
            </div>
            <span className="shrink-0 text-xs text-neutral-400">
              {ago(e.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}