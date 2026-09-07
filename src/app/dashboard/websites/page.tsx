import { listWorkspaces } from "@/lib/workspaces";
import { WorkspaceForm } from "./workspace-form";

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
          {workspaces.map((w) => (
            <li
              key={w.id}
              className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <p className="font-medium">{w.name}</p>
              <p className="text-neutral-500">{w.primaryDomain}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}