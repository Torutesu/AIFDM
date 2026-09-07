import { syncUser } from "@/lib/sync-user";
import { listWorkspaces } from "@/lib/workspaces";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const result = await syncUser();
  if (!result) redirect("/sign-in");

  const workspaces = result.organization ? await listWorkspaces() : [];

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Overview</h1>

      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
          <p className="mb-1 font-medium">Add your first website</p>
          <p className="mb-4 text-sm text-neutral-500">
            We&apos;ll research it and build your marketing knowledge base.
          </p>
          <Link
            href="/dashboard/websites"
            className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Add a website
          </Link>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          {workspaces.length} website{workspaces.length === 1 ? "" : "s"} connected.
        </p>
      )}
    </div>
  );
}