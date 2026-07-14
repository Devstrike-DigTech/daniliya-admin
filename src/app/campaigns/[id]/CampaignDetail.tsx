"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { campaignSubmissions, productGallery } from "@/lib/dashboard";
import { useCampaigns } from "../CampaignsContext";
import CampaignForm from "../CampaignForm";

const TABS = ["Campaign details", "Post submissions from influencers"] as const;
const card = "rounded-2xl border border-ink/10 bg-white p-6";

const detailPill: Record<string, string> = {
  Paused: "bg-amber-100 text-amber-700",
  Ended: "bg-ink/10 text-ink/55",
};

// Derive a file descriptor from the asset label so the meta line reads naturally.
function assetMeta(name: string) {
  const n = name.toLowerCase();
  if (n.includes("carousel")) return "5 slides";
  if (n.includes("caption")) return "PDF · 12 captions";
  if (n.includes("pdf") || n.endsWith(".pdf")) return "PDF document";
  return "1 image";
}

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

export default function CampaignDetail({ id }: { id: string }) {
  const router = useRouter();
  const { getCampaign, updateCampaign, setStatus } = useCampaigns();
  const c = getCampaign(id);

  const [tab, setTab] = useState<(typeof TABS)[number]>("Campaign details");
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState(false);

  if (!c) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-lg font-bold">Campaign not found</p>
        <p className="mt-1 text-sm text-ink/55">It may have been removed or created in another session.</p>
        <Link href="/campaigns" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:opacity-90">
          <Icon name="arrow-left" size={16} /> Back to campaigns
        </Link>
      </div>
    );
  }

  const copy = (key: string, val: string) => { navigator.clipboard?.writeText(val); setCopied(key); setTimeout(() => setCopied(""), 1200); };

  const done = c.checked ?? (c.checklist[0] ? [c.checklist[0]] : []);
  const toggleCheck = (item: string) => {
    const next = done.includes(item) ? done.filter((x) => x !== item) : [...done, item];
    updateCampaign(c.id, { checked: next });
  };
  const donePct = c.checklist.length ? Math.round((done.length / c.checklist.length) * 100) : 0;

  const gallery = productGallery(c.name);
  const removeAsset = (idx: number) => updateCampaign(c.id, { assets: c.assets.filter((_, i) => i !== idx) });

  const paused = c.status === "Paused";
  const ended = c.status === "Ended";

  const endEarly = () => {
    if (window.confirm("End this campaign early? Creators will no longer be able to submit posts.")) {
      setStatus(c.id, "Ended");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/campaigns" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{c.name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{c.product} · {c.type} · {c.id}</p>
            {(paused || ended) && (
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${detailPill[c.status]}`}>{c.status}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand/10"><Icon name="share" size={16} /> Share Brief</button>
          {!ended && (
            <button
              onClick={() => setStatus(c.id, paused ? "Live" : "Paused")}
              className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand/10"
            >
              <Icon name={paused ? "play" : "clock"} size={16} /> {paused ? "Resume" : "Pause"}
            </button>
          )}
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Icon name="settings" size={16} /> Edit</button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-coal px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Icon name="link" size={16} /> View product</button>
        </div>
      </div>

      {/* Brief hero */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-24 w-40 opacity-50 [background-image:repeating-linear-gradient(45deg,var(--color-brand)_0_4px,transparent_4px_10px)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-bold text-brand"><Icon name="rocket" size={16} /> Campaign brief</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-[28px]">{c.briefHeadline}</h2>
            <p className="mt-3 text-white/70">{c.briefSub}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="flex items-center gap-1.5 text-xs text-white/60"><Icon name="calendar" size={13} /> Campaign window</p>
            <p className="mt-1 text-sm font-bold">{c.windowStart} → {c.windowEnd}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot icon="receipt" label="Total sales made" value={`${c.totalSales}`} sub="across all creators" />
        <StatFoot icon="trending-up" label="Total Revenue earned" value={c.revenue} sub="profits made from sales" />
        <StatFoot icon="users" label="Creators" value={`${c.creators}`} sub="Accepted" />
        <StatFoot icon="megaphone" label="Posts live" value={`${c.postsLive}`} sub="Across all creators" />
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
            <p className="font-bold">Campaign link &amp; promo code</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink/55">UTM link</p>
                  <button onClick={() => copy("utm", c.utm)} className="inline-flex items-center gap-1 text-sm font-bold text-brand"><Icon name={copied === "utm" ? "check" : "copy"} size={14} /> {copied === "utm" ? "Copied" : "Copy"}</button>
                </div>
                <div className="mt-2 break-all rounded-xl bg-brand/[0.06] px-4 py-3 text-xs text-ink/70">{c.utm}</div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink/55">Promo code</p>
                  <button onClick={() => copy("promo", c.promo)} className="inline-flex items-center gap-1 text-sm font-bold text-brand"><Icon name={copied === "promo" ? "check" : "copy"} size={14} /> {copied === "promo" ? "Copied" : "Copy"}</button>
                </div>
                <div className="mt-2 flex items-center justify-center rounded-xl bg-brand py-4 text-lg font-bold tracking-wide text-white">{c.promo}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-coal py-2.5 text-sm font-bold text-white"><Icon name="share" size={15} /> WhatsApp</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 py-2.5 text-sm font-bold hover:bg-ink/5"><Icon name="share" size={15} /> Instagram</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 py-2.5 text-sm font-bold hover:bg-ink/5"><Icon name="share" size={15} /> X/Twitter</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 py-2.5 text-sm font-bold hover:bg-ink/5"><Icon name="copy" size={15} /> Copy Hashtags</button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold"><Icon name="check" size={16} className="text-brand" /> Posting checklist</p>
                <span className="text-sm font-bold text-ink/45">{done.length}/{c.checklist.length} done</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${donePct}%` }} /></div>
              <div className="mt-4 space-y-1">
                {c.checklist.map((item) => {
                  const on = done.includes(item);
                  return (
                    <button key={item} onClick={() => toggleCheck(item)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-ink/[0.03]">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-ink/30"}`}>
                        {on && <Icon name="check" size={11} />}
                      </span>
                      <span className={on ? "text-ink/40 line-through" : "text-ink/75"}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold"><Icon name="check" size={16} className="text-brand" /> Deliverables</p>
                <button onClick={() => setEditing(true)} className="text-sm font-bold text-brand hover:underline">Edit</button>
              </div>
              <div className="mt-4 space-y-2.5">
                {c.deliverables.map((d) => (
                  <div key={d} className="flex items-center gap-2 rounded-xl bg-brand/[0.06] px-4 py-3 text-sm font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={card}>
            <p className="font-bold">Creative assets</p>
            <p className="text-sm text-ink/50">Branded files ready to drop into your post.</p>
            {c.assets.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {c.assets.map((a, i) => (
                  <div key={`${a}-${i}`} className="overflow-hidden rounded-xl border border-ink/10">
                    <div className="relative aspect-[4/3] bg-ink/[0.05]">
                      <Image src={gallery[i % gallery.length]} alt={a} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold">{a}</p>
                      <p className="text-xs text-ink/45">{assetMeta(a)}</p>
                      <button onClick={() => removeAsset(i)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:opacity-90"><Icon name="close" size={13} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-ink/15 py-8 text-center text-sm text-ink/45">No creative assets yet — add some from Edit.</p>
            )}
          </div>

          {ended ? (
            <div className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] py-3.5 text-center text-sm font-bold text-ink/50">
              This campaign has ended.
            </div>
          ) : (
            <button onClick={endEarly} className="w-full rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
              End Campaign early
            </button>
          )}
        </div>
      )}

      {tab === "Post submissions from influencers" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Review submissions from Influencers</p>
          {c.postsLive > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/55">
                    <th className="py-3 pr-4 font-bold">Influencer</th>
                    <th className="px-4 py-3 font-bold">Followers</th>
                    <th className="px-4 py-3 text-right font-bold">Submission links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {campaignSubmissions.map((s) => (
                    <tr key={s.influencer}>
                      <td className="py-4 pr-4 font-bold">{s.influencer}</td>
                      <td className="px-4 py-4 text-ink/70">{s.followers}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-2 text-sm font-bold text-white hover:opacity-90">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/45">No submissions yet — this campaign hasn&apos;t gone live.</p>
          )}
        </div>
      )}

      {editing && (
        <CampaignForm
          mode="edit"
          initial={c}
          onClose={() => setEditing(false)}
          onSave={(patch) => { updateCampaign(c.id, patch); setEditing(false); }}
        />
      )}
    </>
  );
}
