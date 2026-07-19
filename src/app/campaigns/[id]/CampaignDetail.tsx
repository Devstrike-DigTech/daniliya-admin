"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { approveSubmission, endCampaign, pauseCampaign, rejectSubmission, resumeCampaign } from "../actions";
import { payoutLine, type AdminCampaign } from "../CampaignsView";

/** GET /admin/campaigns/{id} — the list shape plus its assignments. */
export type CampaignAssignment = {
  id: string;
  influencerId: string;
  utmLink: string | null;
  promoCode: string | null;
  accepted: boolean;
  clicks: number;
  conversions: number;
  assignedAt: string;
  influencer: {
    id: string;
    influencerCode: string;
    followerCount: number | null;
    user: { firstName: string; lastName: string };
  };
  submissions: { id: string; status: string }[];
};

export type AdminCampaignDetail = Omit<AdminCampaign, "_count"> & {
  assignments: CampaignAssignment[];
};

/** GET /admin/campaigns/{id}/submissions */
export type CampaignSubmission = {
  id: string;
  postUrl: string;
  hasAdDisclosure: boolean;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  reviewerNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  assignment: {
    id: string;
    influencer: {
      influencerCode: string;
      followerCount: number | null;
      user: { firstName: string };
    };
  };
};

const TABS = ["Campaign details", "Post submissions from influencers"] as const;
const card = "rounded-2xl border border-ink/10 bg-white p-6";

const submissionPill: Record<string, string> = {
  SUBMITTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const detailPill: Record<string, string> = {
  PAUSED: "bg-amber-100 text-amber-700",
  ENDED: "bg-ink/10 text-ink/55",
};

const label = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

function StatFoot({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-sm text-ink/50"><Icon name={icon} size={14} /> {label}</p>
        <p className="mt-1.5 text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-ink/45">{sub}</p>
      </div>
      <div className="h-1.5 w-full bg-brand" />
    </div>
  );
}

export default function CampaignDetail({
  campaign: c,
  submissions,
}: {
  campaign: AdminCampaignDetail;
  submissions: CampaignSubmission[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Campaign details");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const copy = (key: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };

  const paused = c.status === "PAUSED";
  const ended = c.status === "ENDED";

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) =>
    startTransition(async () => {
      setError("");
      const res = await fn();
      if (!res.ok) setError(res.error);
    });

  const toggleStatus = () => run(() => (paused ? resumeCampaign(c.id) : pauseCampaign(c.id)));
  const endEarly = () => {
    if (window.confirm("End this campaign early? Creators will no longer be able to submit posts.")) {
      run(() => endCampaign(c.id));
    }
  };

  const clicks = c.assignments.reduce((n, a) => n + a.clicks, 0);
  const conversions = c.assignments.reduce((n, a) => n + a.conversions, 0);
  const productId = c.productIds[0];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/campaigns" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{c.title}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{payoutLine(c)} · {c.id.slice(0, 8).toUpperCase()}</p>
            {(paused || ended) && (
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${detailPill[c.status]}`}>{label(c.status)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => copy("brief", window.location.href)} className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand/10">
            <Icon name={copied === "brief" ? "check" : "share"} size={16} /> {copied === "brief" ? "Link copied" : "Share Brief"}
          </button>
          {!ended && (
            <button
              onClick={toggleStatus}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand/10 disabled:opacity-60"
            >
              <Icon name={paused ? "play" : "clock"} size={16} /> {paused ? "Resume" : "Pause"}
            </button>
          )}
          {productId && (
            <Link href={`/products/${productId}`} className="inline-flex items-center gap-2 rounded-xl bg-coal px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
              <Icon name="link" size={16} /> View product
            </Link>
          )}
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

      {/* Brief hero */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-24 w-40 opacity-50 [background-image:repeating-linear-gradient(45deg,var(--color-brand)_0_4px,transparent_4px_10px)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-bold text-brand"><Icon name="rocket" size={16} /> Campaign brief</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-[28px]">{c.title}</h2>
            <p className="mt-3 text-white/70">{c.brief ?? "No brief was written for this campaign."}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="flex items-center gap-1.5 text-xs text-white/60"><Icon name="calendar" size={13} /> Campaign window</p>
            <p className="mt-1 text-sm font-bold">{shortDate(c.startDate)} → {shortDate(c.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot icon="receipt" label="Conversions" value={`${conversions}`} sub="across all creators" />
        <StatFoot icon="trending-up" label="Link clicks" value={`${clicks}`} sub="on creator UTM links" />
        <StatFoot icon="users" label="Creators" value={`${c.assignments.length}`} sub="Assigned" />
        <StatFoot icon="megaphone" label="Posts submitted" value={`${submissions.length}`} sub="Across all creators" />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex rounded-2xl bg-ink/5 p-1.5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${tab === t ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}>{t}</button>
        ))}
      </div>

      {tab === "Campaign details" && (
        <div className="mt-6 space-y-6">
          <div className={card}>
            <p className="font-bold">Campaign links &amp; promo codes</p>
            <p className="text-sm text-ink/50">The API issues a unique link and code per assigned creator.</p>
            {c.assignments.length > 0 ? (
              <div className="mt-4 space-y-6">
                {c.assignments.map((a) => (
                  <div key={a.id}>
                    <p className="text-sm font-bold">
                      {a.influencer.user.firstName} {a.influencer.user.lastName}
                      <span className="ml-2 font-normal text-ink/45">{a.accepted ? "Accepted" : "Not accepted yet"}</span>
                    </p>
                    <div className="mt-3 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-ink/55">UTM link</p>
                          {a.utmLink && (
                            <button onClick={() => copy(`utm-${a.id}`, a.utmLink ?? "")} className="inline-flex items-center gap-1 text-sm font-bold text-brand">
                              <Icon name={copied === `utm-${a.id}` ? "check" : "copy"} size={14} /> {copied === `utm-${a.id}` ? "Copied" : "Copy"}
                            </button>
                          )}
                        </div>
                        <div className="mt-2 break-all rounded-xl bg-brand/[0.06] px-4 py-3 text-xs text-ink/70">{a.utmLink ?? "—"}</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-ink/55">Promo code</p>
                          {a.promoCode && (
                            <button onClick={() => copy(`promo-${a.id}`, a.promoCode ?? "")} className="inline-flex items-center gap-1 text-sm font-bold text-brand">
                              <Icon name={copied === `promo-${a.id}` ? "check" : "copy"} size={14} /> {copied === `promo-${a.id}` ? "Copied" : "Copy"}
                            </button>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-center rounded-xl bg-brand py-4 text-lg font-bold tracking-wide text-white">{a.promoCode ?? "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-ink/15 py-8 text-center text-sm text-ink/45">
                No creators assigned yet — links and promo codes are issued on assignment.
              </p>
            )}
          </div>

          {ended ? (
            <div className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] py-3.5 text-center text-sm font-bold text-ink/50">
              This campaign has ended.
            </div>
          ) : (
            <button onClick={endEarly} disabled={pending} className="w-full rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
              End Campaign early
            </button>
          )}
        </div>
      )}

      {tab === "Post submissions from influencers" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Review submissions from Influencers</p>
          {submissions.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/55">
                    <th className="py-3 pr-4 font-bold">Influencer</th>
                    <th className="px-4 py-3 font-bold">Followers</th>
                    <th className="px-4 py-3 font-bold">Disclosure</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 text-right font-bold">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-4 pr-4 font-bold">{s.assignment.influencer.user.firstName}</td>
                      <td className="px-4 py-4 text-ink/70">
                        {s.assignment.influencer.followerCount?.toLocaleString("en-NG") ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        {s.hasAdDisclosure ? (
                          <span className="text-xs font-bold text-green-700">#ad declared</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600">No disclosure</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${submissionPill[s.status] ?? "bg-ink/10 text-ink/55"}`}>
                          {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a href={s.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border border-ink/15 px-4 py-2 text-xs font-bold hover:bg-ink/5">
                            View post
                          </a>
                          {s.status === "SUBMITTED" && (
                            <SubmissionReview submissionId={s.id} campaignId={c.id} />
                          )}
                        </div>
                        {s.reviewerNote && (
                          <p className="mt-1.5 text-right text-xs text-ink/50">{s.reviewerNote}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/45">No submissions yet.</p>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Approve or reject one post submission.
 *
 * Approval is what releases the creator's money: their commission stays PENDING
 * until the post is APPROVED, so this is a payment decision, not just
 * moderation — hence the confirmation on both paths.
 */
function SubmissionReview({
  submissionId,
  campaignId,
}: {
  submissionId: string;
  campaignId: string;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ask: string) => {
    if (!window.confirm(ask)) return;
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
    });
  };

  return (
    <>
      <button
        disabled={pending}
        onClick={() =>
          run(
            () => approveSubmission(submissionId, campaignId),
            "Approve this post? This releases the creator's commission for payout.",
          )
        }
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : "Approve"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          const note = window.prompt("Why is this post being rejected? (optional)") ?? undefined;
          run(
            () => rejectSubmission(submissionId, campaignId, note || undefined),
            "Reject this post? The creator will not be paid for it.",
          );
        }}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
      >
        Reject
      </button>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </>
  );
}
