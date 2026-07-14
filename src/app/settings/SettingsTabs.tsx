"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import PasswordField from "@/components/PasswordField";
import { admin, team, notificationSettings } from "@/lib/dashboard";

const TABS = ["General", "Team & Roles", "Notification settings"] as const;
const label = "mb-1.5 block text-sm font-bold";
const input = "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const card = "rounded-2xl border border-ink/10 bg-white p-6";
const rolePill: Record<string, string> = {
  Superadmin: "bg-brand/12 text-brand",
  Finance: "bg-brand/12 text-brand",
  Support: "bg-brand/12 text-brand",
  "User manager": "bg-brand/12 text-brand",
};

export default function SettingsTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [invite, setInvite] = useState(false);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return team.filter((m) => !q || `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-[28px]">Platform settings</h1>
      <p className="mt-1 text-sm text-ink/55">Team, roles, feature flags, commission tables and notifications</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{t}</button>
        ))}
      </div>

      {tab === "General" && (
        <div className="mt-6 space-y-6">
          <div className={card}>
            <p className="text-lg font-bold">Basic details</p>
            <div className="mt-4 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <div><label className={label}>Full name</label><input className={input} defaultValue={admin.name} /></div>
              <div><label className={label}>Email</label><input className={input} defaultValue="samuel@daniliya.ng" /></div>
              <button className="h-[46px] shrink-0 text-sm font-bold text-brand hover:underline">Change Email</button>
            </div>
            <button className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90">Save details</button>
          </div>

          <div className={card}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/12 text-brand"><Icon name="lock" size={18} /></span>
              <p className="text-lg font-bold">Security</p>
            </div>
            <p className="mt-4 font-bold">Password</p>
            <p className="text-sm text-ink/50">Last changed 2 weeks ago</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label className={label}>Current Password</label><PasswordField placeholder="enter your current password" /></div>
              <div><label className={label}>New Password</label><PasswordField placeholder="Create a new strong password" /></div>
              <div><label className={label}>Confirm Password</label><PasswordField placeholder="Repeat the new password" /></div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90">Save Password</button>
          </div>
        </div>
      )}

      {tab === "Team & Roles" && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold">{team.length} team members</p>
              <p className="text-sm text-ink/50">Manage your team roles and permissions</p>
            </div>
            <button onClick={() => setInvite(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:opacity-90">
              <Icon name="plus" size={17} /> Invite teammate
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team" className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand" />
              <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand"><Icon name="search" size={17} /></span>
            </div>
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 px-5 text-sm font-bold text-ink/70 transition-colors hover:bg-ink/5"><Icon name="filter" size={17} /> Filter</button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-3.5 pr-4 font-bold">Name</th>
                  <th className="px-4 py-3.5 font-bold">Email</th>
                  <th className="px-4 py-3.5 font-bold">Role</th>
                  <th className="px-4 py-3.5 font-bold">Last active</th>
                  <th className="px-4 py-3.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {rows.map((m) => (
                  <tr key={m.email} className="hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4 font-bold">{m.name}</td>
                    <td className="px-4 py-4 text-ink/70">{m.email}</td>
                    <td className="px-4 py-4"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${rolePill[m.role] ?? "bg-ink/8 text-ink/60"}`}>{m.role}</span></td>
                    <td className="px-4 py-4 text-ink/60">{m.lastActive}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:opacity-90"><Icon name="eye" size={15} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Notification settings" && (
        <div className="mt-6 space-y-4">
          {notificationSettings.map((n, i) => (
            <label key={n} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white px-6 py-5">
              <span className="flex items-center gap-3 font-bold"><Icon name="bell" size={18} className="text-ink/50" /> {n}</span>
              <input type="checkbox" defaultChecked={i < 2} className="peer sr-only" />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
            </label>
          ))}
        </div>
      )}

      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Invite teammate</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="mt-4 space-y-4">
          <div><label className={label}>Email address</label><input className={input} type="email" placeholder="teammate@daniliya.ng" required /></div>
          <div>
            <label className={label}>Role</label>
            <select className={input} defaultValue="Support"><option>Superadmin</option><option>Finance</option><option>Support</option><option>User manager</option></select>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" className="rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90">Send invite</button>
          </div>
        </form>
      </div>
    </div>
  );
}
