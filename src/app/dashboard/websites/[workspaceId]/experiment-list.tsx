"use client";

import { useState, useTransition } from "react";
import { recordResultAction } from "./actions";

type Experiment = {
  id: string;
  hypothesis: string;
  metricType: string;
  baselineValue: number;
  baselineNote: string | null;
  resultValue: number | null;
  resultNote: string | null;
  status: string;
  draft: { title: string; prUrl: string | null };
};

function change(baseline: number, result: number) {
  if (baseline === 0) return null;
  return Math.round(((result - baseline) / baseline) * 100);
}

export function ExperimentList({
  items,
  workspaceId,
  canAct,
}: {
  items: Experiment[];
  workspaceId: string;
  canAct: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  if (items.length === 0) return null;

  function submit(id: string) {
    if (!value.trim()) {
      setError("Enter the result");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await recordResultAction({
        experimentId: id,
        workspaceId,
        resultValue: Number(value),
        resultNote: note,
      });
      if (r.error) setError(r.error);
      else {
        setOpenId(null);
        setValue("");
        setNote("");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {items.map((e) => {
        const pct =
          e.resultValue === null ? null : change(e.baselineValue, e.resultValue);

        return (
          <div
            key={e.id}
            className="space-y-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium">{e.hypothesis}</p>
              <span
                className={
                  e.status === "MEASURED"
                    ? "shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    : "shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                }
              >
                {e.status === "MEASURED" ? "measured" : "running"}
              </span>
            </div>

            <p className="text-xs text-neutral-500">{e.draft.title}</p>

            <div className="flex gap-4 text-xs">
              <span>
                <span className="text-neutral-400">Baseline </span>
                {e.baselineValue} {e.metricType}
              </span>
              {e.resultValue !== null ? (
                <span>
                  <span className="text-neutral-400">Result </span>
                  {e.resultValue} {e.metricType}
                </span>
              ) : null}
              {pct !== null ? (
                <span
                  className={
                    pct > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : pct < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-neutral-500"
                  }
                >
                  {pct > 0 ? "+" : ""}
                  {pct}%
                </span>
              ) : null}
            </div>

            {e.resultNote ? (
              <p className="text-xs text-neutral-500">{e.resultNote}</p>
            ) : null}

            {e.status === "RUNNING" && canAct ? (
              openId === e.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={value}
                      onChange={(ev) => setValue(ev.target.value)}
                      type="number"
                      placeholder="result"
                      className="w-24 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <input
                      value={note}
                      onChange={(ev) => setNote(ev.target.value)}
                      placeholder="What happened? (optional)"
                      className="flex-1 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submit(e.id)}
                      disabled={pending}
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                    >
                      {pending ? "Saving" : "Save result"}
                    </button>
                    <button
                      onClick={() => setOpenId(null)}
                      disabled={pending}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOpenId(e.id)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
                >
                  Record result
                </button>
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}