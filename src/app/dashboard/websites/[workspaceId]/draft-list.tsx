"use client";

import { useTransition, useState } from "react";
import { decideDraftAction, regenerateDraftAction } from "./actions";

type Draft = {
  id: string;
  format: string;
  title: string;
  body: string;
  status: string;
  score: number | null;
  scoreReasons: string[];
  rejectReason: string | null;
  opportunity: { title: string };
};

function scoreColor(score: number | null) {
  if (score === null) return "text-neutral-500";
  if (score >= 0.8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.6) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function DraftList({
  items,
  workspaceId,
}: {
  items: Draft[];
  workspaceId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  if (items.length === 0) return null;

  function approve(id: string) {
    setError(null);
    startTransition(async () => {
      const r = await decideDraftAction(id, "APPROVED", workspaceId);
      if (r.error) setError(r.error);
    });
  }

  function confirmReject(id: string) {
    if (!reason.trim()) {
      setError("Say what is wrong with it");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await decideDraftAction(id, "REJECTED", workspaceId, reason);
      if (r.error) setError(r.error);
      else {
        setRejectingId(null);
        setReason("");
      }
    });
  }

  function regenerate(id: string) {
    setError(null);
    startTransition(async () => {
      const r = await regenerateDraftAction(id, workspaceId);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

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
            {d.status !== "DRAFT" ? (
              <span className="ml-2 text-xs text-neutral-400">
                {d.status.toLowerCase()}
              </span>
            ) : null}
          </summary>

          <div className="mt-3 space-y-3">
            <p className="text-xs text-neutral-500">
              From: {d.opportunity.title}
            </p>

            {d.rejectReason ? (
              <p className="text-xs text-red-500">
                Rejected: {d.rejectReason}
              </p>
            ) : null}

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

            {d.status === "DRAFT" ? (
              rejectingId === d.id ? (
                <div className="space-y-2">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="What is wrong with it?"
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmReject(d.id)}
                      disabled={pending}
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                    >
                      {pending ? "Saving…" : "Confirm reject"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setReason("");
                      }}
                      disabled={pending}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(d.id)}
                    disabled={pending}
                    className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(d.id)}
                    disabled={pending}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
                  >
                    Reject
                  </button>
                </div>
              )
            ) : d.status === "REJECTED" ? (
              <button
                onClick={() => regenerate(d.id)}
                disabled={pending}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700"
              >
                {pending ? "Regenerating…" : "Regenerate"}
              </button>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}