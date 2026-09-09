type Costs = {
  totalCents: number;
  last7Cents: number;
  totalCalls: number;
  breakdown: { operation: string; calls: number; cents: number }[];
};

function money(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export function CostPanel({ costs }: { costs: Costs }) {
  if (costs.totalCalls === 0) return null;

  return (
    <details className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <summary className="cursor-pointer text-sm font-medium">
        AI spend
        <span className="ml-2 text-xs text-neutral-500">
          {money(costs.totalCents)} total
        </span>
      </summary>

      <div className="mt-3 space-y-3">
        <div className="flex gap-4 text-xs">
          <span>
            <span className="text-neutral-400">Last 7 days </span>
            {money(costs.last7Cents)}
          </span>
          <span>
            <span className="text-neutral-400">Calls </span>
            {costs.totalCalls}
          </span>
        </div>

        <div className="space-y-1">
          {costs.breakdown.map((b) => (
            <div
              key={b.operation}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-neutral-600 dark:text-neutral-400">
                {b.operation}
              </span>
              <span className="text-neutral-500">
                {b.calls} calls · {money(b.cents)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}