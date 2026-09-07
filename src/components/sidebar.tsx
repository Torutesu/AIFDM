"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/websites", label: "Websites" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-52 shrink-0 border-r border-neutral-200 p-4 dark:border-neutral-800">
      <Link href="/" className="mb-6 block text-sm font-semibold tracking-tight">
        AIFDM
      </Link>
      <ul className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-md px-3 py-1.5 text-sm ${
                  active
                    ? "bg-neutral-100 font-medium dark:bg-neutral-800"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}