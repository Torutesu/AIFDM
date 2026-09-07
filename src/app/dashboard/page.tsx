import { syncUser } from "@/lib/sync-user";
import { listWorkspaces } from "@/lib/workspaces";
import { redirect } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { WorkspaceForm } from "./workspace-form";

export default async function DashboardPage() {
  const result = await syncUser();
  if (!result) redirect("/sign-in");

  const { organization } = result;
  const workspaces = organization ? await listWorkspaces() : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>

      <WorkspaceForm />

      <div className="space-y-2">
        <h2 className="font-medium">Websites</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm opacity-60">None yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {workspaces.map((w) => (
              <li key={w.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{w.name}</p>
                <p className="opacity-60">{w.primaryDomain}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}