"use client";

import { useMemo, useState, useTransition } from "react";
import Icon from "@/components/Icon";
import PasswordField from "@/components/PasswordField";
import { notificationSettings } from "@/lib/dashboard";
import {
  changePassword,
  changeTeammateRole,
  inviteTeammate,
  removeTeammate,
  updatePlatformConfig,
  type AdminRole,
} from "./actions";

/** GET /auth/me */
export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
};

/** GET /admin/team */
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: string;
  lastActive: string | null;
};

/** GET /admin/settings/config */
export type PlatformConfigEntry = { key: string; value: string };

const TABS = ["General", "Team & Roles", "Notification settings"] as const;
const label = "mb-1.5 block text-sm font-bold";
const input = "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const card = "rounded-2xl border border-ink/10 bg-white p-6";

// AdminRole enum (API): SUPERADMIN · FINANCE · SUPPORT · USER_MANAGER
const ROLES: AdminRole[] = ["SUPERADMIN", "FINANCE", "SUPPORT", "USER_MANAGER"];
const roleLabel = (r: string) => r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, " ");
const keyLabel = (k: string) => k.charAt(0) + k.slice(1).toLowerCase().replace(/_/g, " ");
const lastActive = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function SettingsTabs({
  me,
  team,
  config,
}: {
  me: CurrentUser | null;
  team: TeamMember[];
  config: PlatformConfigEntry[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [invite, setInvite] = useState(false);
  const [managing, setManaging] = useState<TeamMember | null>(null);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return team.filter((m) => !q || `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q));
  }, [team, query]);

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
            {/* The API exposes no profile-update endpoint, so these read from /auth/me only. */}
            <div className="mt-4 grid items-end gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Full name</label>
                <input className={input} readOnly value={me ? `${me.firstName} ${me.lastName}` : "—"} />
              </div>
              <div>
                <label className={label}>Email</label>
                <input className={input} readOnly value={me?.email ?? "—"} />
              </div>
            </div>
          </div>

          <PlatformConfigCard config={config} />

          <SecurityCard />
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
                  <tr key={m.id} className="hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4 font-bold">{m.name}</td>
                    <td className="px-4 py-4 text-ink/70">{m.email}</td>
                    <td className="px-4 py-4"><span className="inline-block rounded-full bg-brand/12 px-3 py-1 text-xs font-bold text-brand">{roleLabel(m.role)}</span></td>
                    <td className="px-4 py-4 text-ink/60">{lastActive(m.lastActive)}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setManaging(m)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:opacity-90"><Icon name="settings" size={15} /> Manage</button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-sm text-ink/45">No team members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Notification settings" && (
        <div className="mt-6 space-y-4">
          {/* No notification-preference endpoint exists yet — these toggles are display only. */}
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
      {managing && <ManageModal member={managing} onClose={() => setManaging(null)} />}
    </>
  );
}

/** GET/PATCH /admin/settings/config — fees, take-rate, min payout. */
function PlatformConfigCard({ config }: { config: PlatformConfigEntry[] }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.map((c) => [c.key, c.value])),
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updatePlatformConfig(values);
      setMsg(res.ok ? { ok: true, text: "Platform config saved." } : { ok: false, text: res.error });
    });
  };

  return (
    <div className={card}>
      <p className="text-lg font-bold">Platform config</p>
      <p className="text-sm text-ink/50">Fees, take-rate and minimum payout thresholds.</p>
      {config.length > 0 ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {config.map((c) => (
              <div key={c.key}>
                <label className={label}>{keyLabel(c.key)}</label>
                <input
                  className={input}
                  inputMode="decimal"
                  value={values[c.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {msg && <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
          <button onClick={save} disabled={pending} className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {pending ? "Saving…" : "Save platform config"}
          </button>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-ink/15 py-8 text-center text-sm text-ink/45">
          No platform config keys are set.
        </p>
      )}
    </div>
  );
}

/** POST /auth/change-password */
function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) return setMsg({ ok: false, text: "The new passwords do not match." });
    startTransition(async () => {
      const res = await changePassword({ currentPassword: current, newPassword: next });
      if (res.ok) {
        setMsg({ ok: true, text: "Password updated." });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  };

  return (
    <form onSubmit={save} className={card}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/12 text-brand"><Icon name="lock" size={18} /></span>
        <p className="text-lg font-bold">Security</p>
      </div>
      <p className="mt-4 font-bold">Password</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className={label}>Current Password</label><PasswordField placeholder="enter your current password" value={current} onChange={setCurrent} required /></div>
        <div><label className={label}>New Password</label><PasswordField placeholder="Create a new strong password" value={next} onChange={setNext} required /></div>
        <div><label className={label}>Confirm Password</label><PasswordField placeholder="Repeat the new password" value={confirm} onChange={setConfirm} required /></div>
      </div>
      {msg && <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
      <button type="submit" disabled={pending} className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
        {pending ? "Saving…" : "Save Password"}
      </button>
    </form>
  );
}

/** POST /admin/team/invite — SUPERADMIN only; a 403 message is shown inline. */
function InviteModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("SUPPORT");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await inviteTeammate({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), role });
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Invite teammate</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>First name</label><input className={input} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ada" required /></div>
            <div><label className={label}>Last name</label><input className={input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Obi" required /></div>
          </div>
          <div><label className={label}>Email address</label><input className={input} type="email" placeholder="teammate@daniliya.ng" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div>
            <label className={label}>Role</label>
            <select className={input} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
              {pending ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** PATCH /admin/team/{id}/role and DELETE /admin/team/{id} — both SUPERADMIN only. */
function ManageModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const [role, setRole] = useState<AdminRole>(member.role);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  const remove = () => {
    if (window.confirm(`Remove ${member.name} from the admin team?`)) {
      run(() => removeTeammate(member.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{member.name}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-ink/50">{member.email}</p>

        <div className="mt-4">
          <label className={label}>Role</label>
          <select className={input} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-3 pt-5">
          <button type="button" onClick={remove} disabled={pending} className="rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">Remove</button>
          <button
            type="button"
            onClick={() => run(() => changeTeammateRole(member.id, role))}
            disabled={pending || role === member.role}
            className="rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save role"}
          </button>
        </div>
      </div>
    </div>
  );
}
