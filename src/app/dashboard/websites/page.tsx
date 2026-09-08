import { listWorkspaces } from "@/lib/workspaces";
import { WorkspaceForm } from "./workspace-form";

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
              <li
                key={w.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}