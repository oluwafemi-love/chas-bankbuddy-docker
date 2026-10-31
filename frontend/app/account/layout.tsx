"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Overview",
    href: "/account",
  },
  {
    label: "Account Balance",
    href: "/account/balance",
  },
  {
    label: "Account History",
    href: "/account/history",
  },
  {
    label: "Notifications",
    href: "/account/notifications",
  },
  {
    label: "Savings",
    href: "/account/savings",
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col bg-slate-100 text-slate-900 md:flex-row">
      {/* Dashboard sidebar */}
      <aside className="w-full border-b border-slate-200 bg-white md:min-h-full md:w-64 md:border-b-0 md:border-r">
        <div className="p-5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your finances
          </p>
        </div>

        <nav
          aria-label="Dashboard navigation"
          className="flex gap-2 overflow-x-auto px-3 pb-3 md:flex-col md:px-3"
        >
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/account" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main dashboard content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
