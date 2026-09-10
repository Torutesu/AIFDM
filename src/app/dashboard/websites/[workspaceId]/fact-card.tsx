"use client";

import { useState, useTransition } from "react";
import { saveFact } from "./actions";

type Fact = {
  id: string;
  key: string;
  value: string;
  confidence: number;
  sourceUrls: string[];
  isUserLocked: boolean;
};

export function FactCard({ fact, canEdit }: { fact: Fact; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fact.value);
  const [locked, setLocked] = useState(fact.isUserLocked);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await saveFact(fact.id, { value, isUserLocked: true });
      setLocked(true);
      setEditing(false);
    });
  }

  function toggleLock() {
    const next = !locked;
    setLocked(next);
    startTransition(async () => {
      await saveFact(fact.id, { isUserLocked: next });
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="mb-1 flex items-start justify-between gap-3">
        <p className="font-mono text-xs text-neutral-500">{fact.key}</p>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <span className="text-neutral-500">
            {Math.round(fact.confidence * 100)}%
          </span>
          {canEdit ? (
            <button
              onClick={toggleLock}
              disabled={pending}
              className={locked ? "text-amber-500" : "text-neutral-400"}
              title={locked ? "Locked — AI won't overwrite" : "Lock this fact"}
            >
              {locked ? "🔒" : "🔓"}
            </button>
          ) : locked ? (
            <span className="text-amber-500" title="Locked — AI won't overwrite">
              🔒
            </span>
          ) : null}
        </div>
      </div>

      {editing && canEdit ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full rounded border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="rounded bg-neutral-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
            >
              {pending ? "Saving…" : "Save & lock"}
            </button>
            <button
              onClick={() => {
                setValue(fact.value);
                setEditing(false);
              }}
              className="rounded border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          onClick={canEdit ? () => setEditing(true) : undefined}
          className={
            canEdit ? "cursor-text text-sm hover:opacity-70" : "text-sm"
          }
        >
          {value}
        </p>
      )}

      {fact.sourceUrls.length > 0 && (
        <p className="mt-2 truncate text-xs text-neutral-400">
          {fact.sourceUrls[0]}
        </p>
      )}
    </div>
  );
}