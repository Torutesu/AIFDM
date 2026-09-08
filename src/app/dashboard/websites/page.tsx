import { listWorkspaces } from "@/lib/workspaces";
import { WorkspaceForm } from "./workspace-form";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  PENDING: "Queued",
  RUNNING: "Crawling…",
  COMPLETED: "Ready",
  FAILED: "Failed",
};

export default async function WebsitesPage() {
  const workspaces = await listWorkspaces();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Websites</h1>

      <WorkspaceForm />

      {workspaces.length === 0 ? (
        <p className="text-sm text-neutral-500">None yet.</p>
      ) : (
        <ul className="space-y-2">
          {workspaces.map((w) => {
            const site = w.websites[0];
            return (
              <li key={w.id}>
                <Link
                  href={`/dashboard/websites/${w.id}`}
                  className="block rounded-lg border border-neutral-200 p-3 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{w.name}</p>
                    {site && (
                      <span className="text-xs text-neutral-500">
                        {statusLabel[site.crawlStatus]}
                        {site.crawlStatus === "COMPLETED" &&
                          ` · ${site.pageCount} pages`}
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500">{w.primaryDomain}</p>
                  {site?.error && (
                    <p className="mt-1 text-xs text-red-500">{site.error}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}