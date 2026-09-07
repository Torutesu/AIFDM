import { Sidebar } from "@/components/sidebar";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
          <OrganizationSwitcher />
          <UserButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}