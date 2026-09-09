"use client";

import { useTransition, useState } from "react";
import { decide } from "./actions";

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

const REASONS = [
  "Not relevant to us",
  "Already doing this",
  "Too expensive",
  "Wrong timing",
];

export function OpportunityList({
  items,
  workspaceId,
}: {
  items: Opportunity[];
  workspaceId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function approve(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await decide(id, "QUEUED", workspaceId);
      if (result.error) setError(result.error);
    });
  }

  function confirmDismiss(id: string) {
    if (!reason) {
      setError("Pick a reason first");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await decide(id, "DISMISSED", workspaceId, reason, note);
      if (result.error) setError(result.error);
      else {
        setDismissingId(null);
        setReason(null);
        setNote("");
      }
    });
  }

  function cancelDismiss() {
    setDismissingId(null);
    setReason(null);
    setNote("");
    setError(null);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No opportunities yet. Set a goal above and we&apos;ll find them.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

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

          {dismissingId === o.id ? (
            <div className="space-y-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-xs font-medium">Why are you dismissing this?</p>

              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={
                      reason === r
                        ? "rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-neutral-900"
                        : "rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything else? (optional)"
                className="w-full rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => confirmDismiss(o.id)}
                  disabled={pending}
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                >
                  {pending ? "Saving…" : "Confirm dismiss"}
                </button>
                <button
                  onClick={cancelDismiss}
                  disabled={pending}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => approve(o.id)}
                disabled={pending}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setDismissingId(o.id);
                }}
                disabled={pending}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}