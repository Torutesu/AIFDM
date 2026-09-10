"use client";

import { useState, useTransition } from "react";
import { selectSite, syncNow, loadSites } from "./actions";

type Props = {
  workspaceId: string;
  integration: { id: string; siteUrl: string | null; lastSyncAt: Date | null } | null;
  canAct: boolean;
  canConfigure: boolean;
};

export function GscPanel({
  workspaceId,
  integration,
  canAct,
  canConfigure,
}: Props) {
  const [sites, setSites] = useState<{ siteUrl: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!integration) {
    const connectUrl =
      "/api/integrations/google/connect?workspaceId=" + workspaceId;

    return (
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="mb-1 text-sm font-medium">Google Search Console</p>
        <p className="mb-3 text-sm text-neutral-500">
          Connect to see what you already rank for.
        </p>
        {canConfigure ? (
          <button
            onClick={() => { window.location.href = connectUrl; }}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-neutral-900"
          >
            Connect
          </button>
        ) : (
          <p className="text-xs text-neutral-500">
            Only an admin can connect a Google account.
          </p>
        )}
      </div>
    );
  }

  function pickSites() {
    setError(null);
    startTransition(async () => {
      const result = await loadSites(integration!.id);
      if (result.error) setError(result.error);
      else setSites(result.sites);
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="mb-1 text-sm font-medium">Google Search Console</p>

      {integration.siteUrl ? (
        <>
          <p className="mb-3 text-sm text-neutral-500">
            {integration.siteUrl}
            {integration.lastSyncAt
              ? " · synced " +
                new Date(integration.lastSyncAt).toLocaleDateString()
              : ""}
          </p>
          {canAct ? (
            <button
              onClick={() =>
                startTransition(async () => {
                  await syncNow(integration.id);
                })
              }
              disabled={pending}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
            >
              {pending ? "Syncing…" : "Sync now"}
            </button>
          ) : null}
        </>
      ) : !canConfigure ? (
        <p className="text-sm text-neutral-500">
          No property chosen yet. Only an admin can choose one.
        </p>
      ) : sites ? (
        <div className="space-y-1">
          {sites.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No properties found on this Google account.
            </p>
          ) : null}
          {sites.map((s) => (
            <button
              key={s.siteUrl}
              onClick={() =>
                startTransition(async () => {
                  await selectSite(integration.id, s.siteUrl);
                })
              }
              disabled={pending}
              className="block w-full rounded border border-neutral-200 px-3 py-1.5 text-left text-xs dark:border-neutral-800"
            >
              {s.siteUrl}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={pickSites}
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-neutral-900"
        >
          {pending ? "Loading…" : "Choose a property"}
        </button>
      )}

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}