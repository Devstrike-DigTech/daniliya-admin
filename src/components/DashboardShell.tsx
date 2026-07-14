"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import { admin, navGroups } from "@/lib/dashboard";

function NavGroups({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {navGroups.map((grp) => (
        <div key={grp.group}>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/35">
            {grp.group}
          </p>
          <div className="space-y-0.5">
            {grp.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-brand/12 text-brand"
                      : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    className={active ? "text-brand" : "text-ink/45 group-hover:text-ink"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-coal p-4 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-ink">
          {admin.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{admin.name}</p>
          <p className="text-xs capitalize text-brand">{admin.role}</p>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        <NavGroups onNavigate={onNavigate} />
      </div>

      <a
        href="/login"
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
      >
        <Icon name="logout" size={18} /> Sign out
      </a>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auth pages bring their own chrome — render them without the admin frame.
  const bare = ["/login", "/verify", "/forgot-password", "/reset-password"];
  if (pathname && bare.some((r) => pathname.startsWith(r))) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Full-width black top bar */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 bg-coal px-4 text-white sm:px-6">
        <button
          aria-label="Menu"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white lg:hidden"
        >
          <Icon name="menu" size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/brand/emblem.png" alt="Daniliya" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-brand">Daniliya</span>
          <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 sm:inline">
            Admin
          </span>
        </Link>

        <div className="relative ml-auto hidden max-w-sm flex-1 md:block lg:ml-8 lg:mr-auto">
          <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Search users, orders, payouts…"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:bg-white/10"
          >
            <Icon name="bell" size={18} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand" />
          </button>
          <Link href="/settings" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-ink">
              {admin.initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight">{admin.name}</span>
              <span className="block text-xs capitalize text-white/55">{admin.role}</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[248px] shrink-0 border-r border-ink/10 bg-white lg:block">
          <SidebarBody />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
