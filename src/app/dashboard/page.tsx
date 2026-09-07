import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

export default async function DashboardPage() {
  const result = await syncUser();

  if (!result) redirect("/sign-in");

  const { user, organization } = result;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <p><span className="opacity-60">User ID:</span> {user.id}</p>
        <p><span className="opacity-60">Email:</span> {user.email}</p>
        <p><span className="opacity-60">Name:</span> {user.name ?? "—"}</p>
        <p><span className="opacity-60">Organization:</span> {organization?.name ?? "None"}</p>
      </div>
    </div>
  );
}