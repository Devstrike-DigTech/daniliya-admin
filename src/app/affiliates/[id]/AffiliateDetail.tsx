"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import {
  changeAffiliateTier,
  messageAffiliate,
  reinstateAffiliate,
  suspendAffiliate,
  type AffiliateTier,
} from "../actions";

/** Shape returned by GET /admin/affiliates/{id}. */
export type AffiliateDetailData = {
  id: string;
  userId: string;
  referralCode: string;
  tier: string;
  kycStatus: string;
  assessmentPassed: boolean;
  tutorialCompleted: boolean;
  isActive: boolean;
  ninEncrypted: string | null;
  bvnEncrypted: string | null;
  bankDetailsJson: Record<string, unknown> | null;
  kycSubmittedAt: string | null;
  kycVerifiedAt: string | null;
  kycRejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: string;
  };
};

const TABS = ["Overview", "Products", "Payouts & Assessment"] as const;
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
const EMPTY = "—";
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : EMPTY;

/** bankDetailsJson is free-form on the API; render only what is actually present. */
function bankLabel(json: Record<string, unknown> | null): string {
  if (!json) return EMPTY;
  const bank = typeof json.bankName === "string" ? json.bankName : null;
  const acct = typeof json.accountNumber === "string" ? json.accountNumber : null;
  if (bank && acct) return `${bank} ****${acct.slice(-4)}`;
  return bank ?? acct ?? EMPTY;
}

export default function AffiliateDetail({ affiliate: a }: { affiliate: AffiliateDetailData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const name = `${a.user.firstName} ${a.user.lastName}`;
  const [messaging, setMessaging] = useState(false);
  const [changingTier, setChangingTier] = useState(false);
  const state = a.user.status === "ACTIVE" && a.isActive ? "Active" : title(a.user.status);
  const suspended = !(a.user.status === "ACTIVE" && a.isActive);
  /**
   * The chip above blends User.status with the profile's own isActive flag, but
   * only User.status is writable from here — suspend/reinstate hit
   * /admin/users/{userId}/…, and there is no endpoint for isActive. So the
   * buttons key off User.status alone, and neither is offered for
   * PENDING_VERIFICATION, which the API refuses.
   */
  const userStatus = a.user.status;

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/affiliates" className="mt-1.5 text-ink/60 hover:text-ink">
            <Icon name="arrow-left" size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{a.id} · {a.referralCode}</p>
          </div>
        </div>
        {/* No affiliate export endpoint exists on the API, so no Export CSV button here. */}
      </div>

      {/* Dark hero banner */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-40 w-64 opacity-40 [background-image:radial-gradient(rgba(212,160,23,0.6)_1.2px,transparent_1.2px)] [background-size:12px_12px]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">
              {initials(name)}
            </span>
            <div>
              <p className="text-lg font-bold">{name}</p>
              {/* No city on the affiliate payload. */}
              <p className="text-sm text-white/60">Affiliate since {fmtDate(a.createdAt)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {a.tier && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-2.5 py-1 text-xs font-bold text-brand">
                    <Icon name={a.tier === "PLATINUM" ? "trophy" : "medal"} size={12} /> {title(a.tier)} tier
                  </span>
                )}
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${suspended ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                  {state}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <button onClick={() => setMessaging(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15">
              <Icon name="message" size={16} /> Message
            </button>
            <button onClick={() => setChangingTier(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15">
              <Icon name="medal" size={16} /> Change tier
            </button>
            {userStatus === "ACTIVE" && (
              <ActionButton
                action={() => suspendAffiliate(a.userId, a.id)}
                icon="ban"
                variant="danger"
                confirm={`Suspend ${name}? They lose access to the affiliate portal immediately.`}
              >
                Suspend user
              </ActionButton>
            )}
            {userStatus === "SUSPENDED" && (
              <ActionButton action={() => reinstateAffiliate(a.userId, a.id)} icon="check" variant="success">
                Reinstate
              </ActionButton>
            )}
            {userStatus === "PENDING_VERIFICATION" && (
              <span className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white/60">Account unverified</span>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards — no earnings/clicks/conversion fields on the detail payload */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lifetime earnings" value={EMPTY} />
        <MetricCard label="Conversions" value={EMPTY} />
        <MetricCard label="Clicks" value={EMPTY} />
        <MetricCard label="Pending payout" value={EMPTY} gold />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab a={a} />}
      {tab === "Products" && <ProductsTab />}
      {tab === "Payouts & Assessment" && <PayoutsTab a={a} />}

      {messaging && (
        <MessageModal name={name} email={a.user.email} userId={a.userId} onClose={() => setMessaging(false)} />
      )}
      {changingTier && (
        <TierModal name={name} affiliateId={a.id} current={a.tier as AffiliateTier} onClose={() => setChangingTier(false)} />
      )}
    </>
  );
}

const fieldLabel = "mb-1.5 block text-sm font-bold";
const fieldInput = "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

const TIERS: AffiliateTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

/** POST /admin/affiliates/{id}/tier — tier drives commission rates, so it is audited server-side. */
function TierModal({ name, affiliateId, current, onClose }: { name: string; affiliateId: string; current: AffiliateTier; onClose: () => void }) {
  const [tier, setTier] = useState<AffiliateTier>(current);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await changeAffiliateTier(affiliateId, tier);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Change tier</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-ink/50">{name} · currently {title(current)}</p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className={fieldLabel}>Tier</label>
            <select className={fieldInput} value={tier} onChange={(e) => setTier(e.target.value as AffiliateTier)}>
              {TIERS.map((t) => <option key={t} value={t}>{title(t)}</option>)}
            </select>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending || tier === current} className="rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">{pending ? "Saving…" : "Save tier"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** POST /admin/users/{userId}/message — emails the affiliate's account address. */
function MessageModal({ name, email, userId, onClose }: { name: string; email: string; userId: string; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await messageAffiliate(userId, subject.trim(), body.trim());
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
          <div><label className={fieldLabel}>Subject</label><input className={fieldInput} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="About your affiliate account" required /></div>
          <div>
            <label className={fieldLabel}>Message</label>
            {/* The API caps the body at 2000 characters (MessageUserDto). */}
            <textarea className={`${fieldInput} min-h-32`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
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

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${gold ? "border-brand bg-brand text-white" : "border-ink/10 bg-white"}`}>
      <p className={`text-sm ${gold ? "text-white/80" : "text-ink/55"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

const card = "rounded-2xl border border-ink/10 bg-white p-6";

function OverviewTab({ a }: { a: AffiliateDetailData }) {
  const phone = a.user.phone;
  return (
    <div className="mt-6 space-y-6">
      <div className={card}>
        <p className="font-bold">Contact details</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CopyField icon="mail" label="Email" value={a.user.email} />
          <CopyField icon="phone" label="Phone" value={phone ?? EMPTY} />
          {/* No city field on the payload. */}
          <CopyField icon="pin" label="City" value={EMPTY} />
          <CopyField icon="calendar" label="Joined" value={fmtDate(a.createdAt)} />
          {/* NIN is stored encrypted — only its presence is reportable. */}
          <CopyField icon="shield-check" label="NIN" value={a.ninEncrypted ? "On file" : EMPTY} />
          <CopyField icon="bank" label="Bank" value={bankLabel(a.bankDetailsJson)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {phone && (
            <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-200">
              WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" />
            </a>
          )}
          <a href={`mailto:${a.user.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] transition-colors hover:bg-[#6d3fa0]/20">
            Send email <Icon name="arrow-right" size={14} className="-rotate-45" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <p className="font-bold">Performance snapshot</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Click / conversion / refund analytics are not on this endpoint. */}
            <Snap label="7-day clicks" value={EMPTY} />
            <Snap label="7-day conv." value={EMPTY} />
            <Snap label="Refund rate" value={EMPTY} />
            <Snap label="Assessment" value={a.assessmentPassed ? "Passed" : "Not passed"} />
          </div>
        </div>
        <div className={card}>
          <p className="font-bold">Referral code</p>
          <CopyField className="mt-4" label="" value={a.referralCode} mono />
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div className={`mt-6 ${card}`}>
      <p className="font-bold">Products this affiliate promotes</p>
      {/* No per-affiliate product/attribution data on GET /admin/affiliates/{id}. */}
      <p className="mt-4 text-sm text-ink/45">No product data yet.</p>
    </div>
  );
}

function PayoutsTab({ a }: { a: AffiliateDetailData }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className={card}>
        <p className="font-bold">Summary</p>
        {/* No payout aggregates on this endpoint. */}
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

      <div className={card}>
        <p className="font-bold">Assessment</p>
        <p className="mt-3 text-[34px] font-bold leading-none">
          {a.assessmentPassed ? "Passed" : "Not passed"}
        </p>
        <p className="mt-2 text-xs text-ink/50">
          Onboarding tutorial {a.tutorialCompleted ? "completed" : "not completed"}
        </p>
        {/* The API exposes a pass/fail flag only — no per-section score breakdown. */}
        <p className="mt-4 text-sm text-ink/45">No score breakdown available.</p>
      </div>

      <div className={card}>
        <p className="font-bold">Bank details</p>
        <p className="mt-3 text-xl font-bold">{bankLabel(a.bankDetailsJson)}</p>
        <p className="mt-1 text-sm text-ink/50">
          KYC {title(a.kycStatus)}
          {a.kycRejectedReason ? ` · ${a.kycRejectedReason}` : ""}
        </p>
      </div>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
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

function CopyField({
  icon,
  label,
  value,
  mono,
  className = "",
}: {
  icon?: string;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-ink/12 px-4 py-2.5 ${className}`}>
      <div className="min-w-0">
        {label && (
          <p className="flex items-center gap-1.5 text-xs text-ink/45">
            {icon && <Icon name={icon} size={13} />} {label}
          </p>
        )}
        <p className={`truncate text-sm font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="shrink-0 text-brand transition-colors hover:text-ink"
        aria-label="Copy"
      >
        <Icon name={copied ? "check" : "copy"} size={17} />
      </button>
    </div>
  );
}
