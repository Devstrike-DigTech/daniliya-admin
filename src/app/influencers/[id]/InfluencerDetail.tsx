"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import {
  approveInfluencer,
  messageInfluencer,
  reinstateInfluencer,
  rejectInfluencer,
  suspendInfluencer,
} from "../actions";

/** Shape returned by GET /admin/influencers/{id}. */
export type InfluencerDetailData = {
  id: string;
  userId: string;
  influencerCode: string;
  socialHandles: Record<string, string> | null;
  niche: string | null;
  followerCount: number | null;
  contentLinks: string[];
  isApproved: boolean;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: string;
  };
};

const TABS = ["Overview", "Campaigns", "Payouts", "Content"] as const;
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
const card = "rounded-2xl border border-ink/10 bg-white p-6";
const EMPTY = "—";
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : EMPTY;

const statusChip: Record<string, string> = {
  Approved: "bg-green-500/20 text-green-300",
  Pending: "bg-amber-500/20 text-amber-300",
  Rejected: "bg-red-500/20 text-red-300",
};

export default function InfluencerDetail({ influencer: i }: { influencer: InfluencerDetailData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [messaging, setMessaging] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const name = `${i.user.firstName} ${i.user.lastName}`;
  const status = i.isApproved ? "Approved" : i.rejectedReason ? "Rejected" : "Pending";
  /**
   * Account standing is a separate axis from approval: a creator can be approved
   * yet suspended. Suspend/reinstate drive off User.status alone, and neither is
   * offered for PENDING_VERIFICATION — the API rejects both for that state.
   */
  const userStatus = i.user.status;
  const socials = Object.entries(i.socialHandles ?? {});
  const primaryHandle = socials[0]?.[1] ?? i.influencerCode;
  const followers = i.followerCount != null ? i.followerCount.toLocaleString("en-NG") : EMPTY;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/influencers" className="mt-1.5 text-ink/60 hover:text-ink">
            <Icon name="arrow-left" size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{i.id} · {primaryHandle}</p>
          </div>
        </div>
        {/* No influencer export endpoint exists on the API, so no Export CSV button here. */}
      </div>

      {/* Hero */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-40 w-64 opacity-40 [background-image:radial-gradient(rgba(212,160,23,0.6)_1.2px,transparent_1.2px)] [background-size:12px_12px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">{initials(name)}</span>
            <div>
              <p className="text-lg font-bold">{name}</p>
              {/* No city on the influencer payload. */}
              <p className="text-sm text-white/60">{i.niche ?? EMPTY} · Joined {fmtDate(i.createdAt)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusChip[status]}`}>{status}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{followers} followers</span>
                {/* No engagement metric on the API. */}
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{EMPTY} engagement</span>
              </div>
            </div>
          </div>
          {/* "Offer retainer" used to sit here; retainers are not a concept the API models, so it is gone. */}
          <div className="flex flex-wrap items-start gap-2">
            <button onClick={() => setMessaging(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15"><Icon name="message" size={16} /> Message</button>

            {!i.isApproved && (
              <ActionButton
                action={() => approveInfluencer(i.id)}
                icon="check"
                variant="success"
                confirm={`Approve ${name}? They can then join campaigns.`}
              >
                Approve
              </ActionButton>
            )}
            {!i.rejectedReason && (
              <button onClick={() => setRejecting(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15"><Icon name="close" size={16} /> Reject</button>
            )}

            {userStatus === "ACTIVE" && (
              <ActionButton
                action={() => suspendInfluencer(i.userId, i.id)}
                icon="ban"
                variant="danger"
                confirm={`Suspend ${name}? They lose access to the creator portal immediately.`}
              >
                Suspend user
              </ActionButton>
            )}
            {userStatus === "SUSPENDED" && (
              <ActionButton action={() => reinstateInfluencer(i.userId, i.id)} icon="check" variant="success">
                Reinstate
              </ActionButton>
            )}
            {userStatus === "PENDING_VERIFICATION" && (
              <span className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white/60">Account unverified</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats — earnings/conversions/payouts have no field on this endpoint */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lifetime earnings" value={EMPTY} />
        <MetricCard label="Conversions" value={EMPTY} />
        <MetricCard label="Followers across all platforms" value={followers} />
        <MetricCard label="Pending payout" value={EMPTY} gold />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="mt-6 space-y-6">
          <div className={card}>
            <p className="font-bold">Contact details</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CopyField icon="mail" label="Email" value={i.user.email} />
              <CopyField icon="phone" label="Phone" value={i.user.phone ?? EMPTY} />
              {/* No city or bank details on the influencer payload. */}
              <CopyField icon="pin" label="City" value={EMPTY} />
              <CopyField icon="calendar" label="Joined" value={fmtDate(i.createdAt)} />
              <CopyField icon="bank" label="Bank" value={EMPTY} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {i.user.phone && (
                <a href={`https://wa.me/${i.user.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-200">WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
              )}
              <a href={`mailto:${i.user.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] hover:bg-[#6d3fa0]/20">Send email <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <p className="font-bold">Social presence</p>
              {socials.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {socials.map(([platform, handle]) => (
                    <div key={platform} className="rounded-xl border border-ink/10 p-3">
                      <p className="text-xs text-ink/45">{platform} · {handle}</p>
                      {/* Follower count is a single aggregate, not per-platform. */}
                      <p className="mt-1 text-sm font-bold">{EMPTY}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/45">No social handles on file.</p>
              )}
            </div>
            <div className={card}>
              <p className="font-bold">Bank details</p>
              {/* No bank fields on GET /admin/influencers/{id}. */}
              <p className="mt-3 text-xl font-bold">{EMPTY}</p>
              <p className="mt-1 text-sm text-ink/50">No bank details on file.</p>
            </div>
          </div>
        </div>
      )}

      {tab === "Campaigns" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Campaign performance</p>
          {/* No per-influencer campaign data on this endpoint. */}
          <p className="mt-4 text-sm text-ink/45">No campaign data yet.</p>
        </div>
      )}

      {tab === "Payouts" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div className={card}>
            <p className="font-bold">Summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <SumRow label="Payouts to date" value={EMPTY} />
              <SumRow label="Total paid" value={EMPTY} />
              <SumRow label="Pending release" value={EMPTY} />
              <SumRow label="Last payout" value={EMPTY} />
            </div>
          </div>
          <div className={card}>
            <p className="font-bold">Payout history</p>
            <p className="mt-4 text-sm text-ink/45">No payout history yet.</p>
          </div>
        </div>
      )}

      {tab === "Content" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Recent content submissions</p>
          {i.contentLinks.length ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {i.contentLinks.map((link) => (
                <a key={link} href={link} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-ink/10">
                  <div className="flex aspect-[4/3] items-center justify-center bg-ink/[0.06] text-ink/25"><Icon name="play" size={40} /></div>
                  <div className="p-4">
                    <p className="truncate font-bold">{link}</p>
                    {/* No status or view counts on contentLinks. */}
                    <p className="mt-0.5 text-xs text-ink/50">{EMPTY}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/45">No content submissions yet.</p>
          )}
        </div>
      )}

      {messaging && (
        <MessageModal name={name} email={i.user.email} userId={i.userId} onClose={() => setMessaging(false)} />
      )}
      {rejecting && (
        <RejectModal name={name} influencerId={i.id} onClose={() => setRejecting(false)} />
      )}
    </>
  );
}

const label = "mb-1.5 block text-sm font-bold";
const input = "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

/** POST /admin/users/{userId}/message — emails the creator's account address. */
function MessageModal({ name, email, userId, onClose }: { name: string; email: string; userId: string; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await messageInfluencer(userId, subject.trim(), body.trim());
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Message {name}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-ink/50">Sent by email to {email}</p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div><label className={label}>Subject</label><input className={input} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="About your creator account" required /></div>
          <div>
            <label className={label}>Message</label>
            {/* The API caps the body at 2000 characters (MessageUserDto). */}
            <textarea className={`${input} min-h-32`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** POST /admin/influencers/{id}/reject — reason is optional but worth capturing. */
function RejectModal({ name, influencerId, onClose }: { name: string; influencerId: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`Reject ${name}? They can no longer be booked for campaigns.`)) return;
    setError("");
    startTransition(async () => {
      const res = await rejectInfluencer(influencerId, reason);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Reject {name}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className={label}>Reason <span className="font-normal text-ink/45">(optional)</span></label>
            <textarea className={`${input} min-h-28`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Shown on the creator's record" />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">{pending ? "Rejecting…" : "Reject creator"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/8 pb-3 last:border-0 last:pb-0">
      <span className="text-ink/55">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${gold ? "border-brand bg-brand text-white" : "border-ink/10 bg-white"}`}>
      <p className={`text-sm ${gold ? "text-white/80" : "text-ink/55"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CopyField({ icon, label, value }: { icon?: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/12 px-4 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-ink/45">{icon && <Icon name={icon} size={13} />} {label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
      <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="shrink-0 text-brand hover:text-ink" aria-label="Copy">
        <Icon name={copied ? "check" : "copy"} size={17} />
      </button>
    </div>
  );
}
