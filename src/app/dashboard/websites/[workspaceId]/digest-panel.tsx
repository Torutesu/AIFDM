

type Digest = {
  openOpportunities: number;
  draftsWaiting: number;
  readyToPublish: number;
  experimentsToMeasure: number;
  queuedNoDraft: number;
};

export function DigestPanel({ digest }: { digest: Digest }) {
  const items: string[] = [];

  if (digest.openOpportunities > 0) {
    items.push(
      digest.openOpportunities +
        " opportunit" +
        (digest.openOpportunities === 1 ? "y" : "ies") +
        " waiting on a decision"
    );
  }
  if (digest.draftsWaiting > 0) {
    items.push(
      digest.draftsWaiting +
        " draft" +
        (digest.draftsWaiting === 1 ? "" : "s") +
        " to review"
    );
  }
  if (digest.readyToPublish > 0) {
    items.push(
      digest.readyToPublish +
        " draft" +
        (digest.readyToPublish === 1 ? "" : "s") +
        " approved but not published"
    );
  }
  if (digest.experimentsToMeasure > 0) {
    items.push(
      digest.experimentsToMeasure +
        " experiment" +
        (digest.experimentsToMeasure === 1 ? "" : "s") +
        " running over two weeks with no result"
    );
  }
  if (digest.queuedNoDraft > 0) {
    items.push(
      digest.queuedNoDraft +
        " approved opportunit" +
        (digest.queuedNoDraft === 1 ? "y" : "ies") +
        " with no draft generated"
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="text-sm text-neutral-500">Nothing needs your attention.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="mb-2 text-sm font-medium">Needs your attention</p>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}