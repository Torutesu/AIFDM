"use client";

import { useState, useTransition } from "react";
import { startExperimentAction } from "./actions";

export function ExperimentForm({
  draftId,
  workspaceId,
}: {
  draftId: string;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [hypothesis, setHypothesis] = useState("");
  const [metricType, setMetricType] = useState("signups");
  const [baseline, setBaseline] = useState("0");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await startExperimentAction({
        draftId,
        workspaceId,
        hypothesis,
        metricType,
        baselineValue: Number(baseline),
        baselineNote: note,
      });
      if (r.error) setError(r.error);
      else {
        setOpen(false);
        setHypothesis("");
        setNote("");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
      >
        Start experiment
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <p className="text-xs font-medium">What do you expect to happen?</p>

      <input
        value={hypothesis}
        onChange={(e) => setHypothesis(e.target.value)}
        placeholder="This page will bring in more trial signups"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="flex gap-2">
        <input
          value={baseline}
          onChange={(e) => setBaseline(e.target.value)}
          type="number"
          className="w-24 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
        <select
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="signups">signups</option>
          <option value="visitors">visitors</option>
          <option value="clicks">clicks</option>
          <option value="leads">leads</option>
        </select>
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Where did the baseline come from? (optional)"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      />

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {pending ? "Starting" : "Start"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}