"use client";

import { useState, useTransition } from "react";
import { saveGithubAction } from "./actions";

export function GithubPanel({
  workspaceId,
  owner,
  repo,
  path,
}: {
  workspaceId: string;
  owner: string | null;
  repo: string | null;
  path: string | null;
}) {
  const [o, setO] = useState(owner ?? "");
  const [r, setR] = useState(repo ?? "");
  const [p, setP] = useState(path ?? "content");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveGithubAction({
        workspaceId,
        owner: o,
        repo: r,
        path: p,
      });
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm font-medium">GitHub</p>
      <p className="text-xs text-neutral-500">
        Where approved drafts get published as pull requests.
      </p>

      <div className="flex gap-2">
        <input
          value={o}
          onChange={(e) => setO(e.target.value)}
          placeholder="owner"
          className="w-1/3 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          value={r}
          onChange={(e) => setR(e.target.value)}
          placeholder="repo"
          className="w-1/3 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          value={p}
          onChange={(e) => setP(e.target.value)}
          placeholder="content"
          className="w-1/3 rounded border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {saved ? <p className="text-xs text-emerald-600">Saved</p> : null}

      <button
        onClick={save}
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}