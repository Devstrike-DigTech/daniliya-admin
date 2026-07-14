"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { type Campaign, type CampaignInput } from "./CampaignsContext";

const AUDIENCE = ["Facebook", "Instagram", "Tiktok", "X (Twitter)", "Finance niche"];
const VENDORS = ["Platform", "Sparkle & Co.", "Amber & Oak", "Naija Eats", "Sofia Chairs"];
const PRODUCTS = ["Daniliya Books", "Meal-Prep Box", "Home Sparkle Kit", "Amber Candle Set", "Sofia Accent Chair"];

const label = "mb-1.5 block text-sm font-bold";
const field =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

type Props = {
  mode: "create" | "edit";
  initial?: Campaign;
  onClose: () => void;
  onCreate?: (input: CampaignInput, status: "Live" | "Draft") => void;
  onSave?: (patch: Partial<Campaign>) => void;
};

export default function CampaignForm({ mode, initial, onClose, onCreate, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(initial?.target ?? (initial?.scope === "Platform" ? "Platform" : ""));
  const [product, setProduct] = useState(initial?.product ?? "");
  const [budget, setBudget] = useState(initial ? String(initial.budget) : "");
  const [starts, setStarts] = useState(initial?.windowStart && initial.windowStart !== "—" ? initial.windowStart : "");
  const [ends, setEnds] = useState(initial?.windowEnd && initial.windowEnd !== "—" ? initial.windowEnd : "");
  const [deliverables, setDeliverables] = useState<string[]>(initial?.deliverables ?? []);
  const [checklist, setChecklist] = useState<string[]>(initial?.checklist ?? []);
  const [delDraft, setDelDraft] = useState("");
  const [chkDraft, setChkDraft] = useState("");
  const [brief, setBrief] = useState(initial?.briefSub ?? "");
  const [doText, setDoText] = useState(initial?.doText ?? "");
  const [dontText, setDontText] = useState(initial?.dontText ?? "");
  const [audience, setAudience] = useState<string[]>(initial?.audience ?? []);
  const [assets, setAssets] = useState<string[]>(initial?.assets ?? []);

  const addDeliverable = () => {
    const v = delDraft.trim();
    if (!v) return;
    setDeliverables((d) => [...d, v]);
    setDelDraft("");
  };
  const addChecklist = () => {
    const v = chkDraft.trim();
    if (!v) return;
    setChecklist((c) => [...c, v]);
    setChkDraft("");
  };
  const toggleAudience = (a: string) =>
    setAudience((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setAssets((prev) => [...prev, ...Array.from(files).map((f) => f.name)]);
  };

  const collect = (): CampaignInput => ({
    name,
    target,
    product,
    budget: Number(budget.replace(/[^\d]/g, "")) || 0,
    windowStart: starts,
    windowEnd: ends,
    deliverables,
    checklist,
    brief,
    doText,
    dontText,
    audience,
    assets,
  });

  const submit = (e: React.FormEvent, status: "Live" | "Draft") => {
    e.preventDefault();
    if (mode === "create") {
      onCreate?.(collect(), status);
    } else if (initial) {
      const i = collect();
      onSave?.({
        name: i.name,
        product: i.product || i.target,
        target: i.target,
        budget: i.budget,
        windowStart: i.windowStart || "—",
        windowEnd: i.windowEnd || "—",
        deliverables: i.deliverables,
        checklist: i.checklist,
        briefSub: i.brief,
        briefHeadline: initial.briefHeadline,
        doText: i.doText,
        dontText: i.dontText,
        audience: i.audience,
        assets: i.assets,
        scope: i.target === "Platform" ? "Platform" : "Vendor",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 my-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xl font-bold">
            <Icon name="rocket" size={22} className="text-brand" />
            {mode === "create" ? "Launch a new campaign" : "Edit campaign"}
          </p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={22} /></button>
        </div>

        <form onSubmit={(e) => submit(e, "Live")} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Campaign name</label>
              <input className={field} placeholder="Handbook Push v3" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={label}>Target vendor / platform</label>
              <select className={field} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="" disabled>Select vendor for campaign</option>
                {VENDORS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Product for campaign</label>
              <select className={field} value={product} onChange={(e) => setProduct(e.target.value)}>
                <option value="" disabled>Select the product for campaign</option>
                {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Budget (₦)</label>
              <input className={field} inputMode="numeric" placeholder="2,000,000" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <label className={label}>Starts</label>
              <input className={field} type="date" value={starts} onChange={(e) => setStarts(e.target.value)} />
            </div>
            <div>
              <label className={label}>Ends</label>
              <input className={field} type="date" value={ends} onChange={(e) => setEnds(e.target.value)} />
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className={label}>Deliverables</label>
            <div className="flex gap-3">
              <input
                className={field}
                placeholder="1 instagram reel 40 secs"
                value={delDraft}
                onChange={(e) => setDelDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDeliverable(); } }}
              />
              <button type="button" onClick={addDeliverable} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand px-4 text-sm font-bold text-brand hover:bg-brand/10">
                <Icon name="plus" size={15} /> Add deliverable
              </button>
            </div>
            {deliverables.length > 0 && (
              <div className="mt-3 space-y-2">
                {deliverables.map((d, i) => (
                  <Chip key={`${d}-${i}`} text={d} onRemove={() => setDeliverables((arr) => arr.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}
          </div>

          {/* Posting checklist */}
          <div>
            <label className={label}>Posting Checklist</label>
            <div className="flex gap-3">
              <input
                className={field}
                placeholder="Download assets"
                value={chkDraft}
                onChange={(e) => setChkDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklist(); } }}
              />
              <button type="button" onClick={addChecklist} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand px-4 text-sm font-bold text-brand hover:bg-brand/10">
                <Icon name="plus" size={15} /> Add checklist
              </button>
            </div>
            {checklist.length > 0 && (
              <div className="mt-3 space-y-2">
                {checklist.map((d, i) => (
                  <Chip key={`${d}-${i}`} text={d} onRemove={() => setChecklist((arr) => arr.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={label}>Brief</label>
            <textarea className={`${field} min-h-[120px]`} placeholder="What should creators say, show, and link" value={brief} onChange={(e) => setBrief(e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Do</label>
              <textarea className={`${field} min-h-[100px]`} placeholder="What is allowed" value={doText} onChange={(e) => setDoText(e.target.value)} />
            </div>
            <div>
              <label className={label}>Don&apos;t</label>
              <textarea className={`${field} min-h-[100px]`} placeholder="What is restricted" value={dontText} onChange={(e) => setDontText(e.target.value)} />
            </div>
          </div>

          {/* Upload */}
          <div>
            <label className={label}>Upload creative assets</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-ink/20 bg-ink/[0.02] py-8 text-center transition-colors hover:bg-ink/[0.04]">
              <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              <Icon name="upload" size={22} className="text-ink/40" />
              <p className="mt-2 font-bold">Upload brand assets</p>
              <p className="text-xs text-ink/50">Upload png, jpg, pdf, svg and pptx up to 30 mb</p>
            </label>
            {assets.length > 0 && (
              <div className="mt-3 space-y-2">
                {assets.map((a, i) => (
                  <Chip key={`${a}-${i}`} text={a} onRemove={() => setAssets((arr) => arr.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}
          </div>

          {/* Audience */}
          <div>
            <label className={label}>Target Audience</label>
            <div className="flex flex-wrap gap-3">
              {AUDIENCE.map((a) => {
                const on = audience.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAudience(a)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${on ? "border-brand bg-brand/10 text-brand" : "border-ink/15 text-ink/70 hover:bg-ink/5"}`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-ink/30"}`}>
                      {on && <Icon name="check" size={11} />}
                    </span>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "create" ? (
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button type="button" onClick={(e) => submit(e, "Draft")} className="rounded-xl border border-ink/15 py-3.5 text-sm font-bold hover:bg-ink/5">Save as draft</button>
              <button type="submit" className="rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90">Launch campaign</button>
            </div>
          ) : (
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3.5 text-sm font-bold hover:bg-ink/5">Cancel</button>
              <button type="button" onClick={(e) => submit(e, "Live")} className="rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90">Save changes</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Chip({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-brand/[0.06] px-4 py-2.5 text-sm font-bold">
      <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> {text}</span>
      <button type="button" onClick={onRemove} className="text-ink/40 hover:text-red-600"><Icon name="close" size={15} /></button>
    </div>
  );
}
