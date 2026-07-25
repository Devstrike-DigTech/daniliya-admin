"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/Icon";
import DatePicker from "@/components/DatePicker";
import { createCampaign } from "./actions";
import { type CampaignProduct } from "./CampaignsView";

const label = "mb-1.5 block text-sm font-bold";
const field =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

type Props = {
  products: CampaignProduct[];
  onClose: () => void;
  onCreated: (id: string) => void;
};

/**
 * Create-only. The API exposes POST /admin/campaigns but no PATCH, so a campaign
 * cannot be edited after creation — see the note in CampaignDetail.
 */
export default function CampaignForm({ products, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [payoutModel, setPayoutModel] = useState<"FLAT" | "COMMISSION">("FLAT");
  const [flatAmount, setFlatAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const toggleProduct = (id: string) =>
    setProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = Number(flatAmount.replace(/[^\d.]/g, ""));
    const rate = Number(commissionRate.replace(/[^\d.]/g, ""));
    if (payoutModel === "FLAT" && !amount) return setError("Enter the CPA amount paid per conversion.");
    if (payoutModel === "COMMISSION" && !rate) return setError("Enter the commission rate.");
    if (!starts || !ends) return setError("Pick a start and end date for the campaign.");

    startTransition(async () => {
      const res = await createCampaign({
        title: title.trim(),
        brief: brief.trim() || undefined,
        productIds,
        payoutModel,
        ...(payoutModel === "FLAT" ? { flatAmount: amount } : { commissionRate: rate }),
        startDate: new Date(starts).toISOString(),
        endDate: new Date(ends).toISOString(),
      });
      if (res.ok) onCreated(res.data.id);
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 my-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xl font-bold">
            <Icon name="rocket" size={22} className="text-brand" />
            Launch a new campaign
          </p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={22} /></button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Campaign title</label>
              <input className={field} placeholder="Handbook Push v3" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className={label}>Payout model</label>
              <select className={field} value={payoutModel} onChange={(e) => setPayoutModel(e.target.value as "FLAT" | "COMMISSION")}>
                <option value="FLAT">Flat CPA — fixed amount per conversion</option>
                <option value="COMMISSION">Commission — % of order subtotal</option>
              </select>
            </div>
            {payoutModel === "FLAT" ? (
              <div>
                <label className={label}>CPA per conversion (₦)</label>
                <input className={field} inputMode="numeric" placeholder="3,000" value={flatAmount} onChange={(e) => setFlatAmount(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className={label}>Commission rate (%)</label>
                <input className={field} inputMode="decimal" placeholder="12.5" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
              </div>
            )}
            <div>
              <label className={label}>Starts</label>
              <DatePicker className={field} value={starts} onChange={setStarts} placeholder="Select start date" />
            </div>
            <div>
              <label className={label}>Ends</label>
              <DatePicker className={field} value={ends} onChange={setEnds} min={starts || undefined} placeholder="Select end date" />
            </div>
          </div>

          <div>
            <label className={label}>Brief</label>
            <textarea className={`${field} min-h-[120px]`} placeholder="What should creators say, show, and link" value={brief} onChange={(e) => setBrief(e.target.value)} />
          </div>

          {/* Products */}
          <div>
            <label className={label}>Products in this campaign</label>
            {products.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {products.map((p) => {
                  const on = productIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${on ? "border-brand bg-brand/10 text-brand" : "border-ink/15 text-ink/70 hover:bg-ink/5"}`}
                    >
                      <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-ink/30"}`}>
                        {on && <Icon name="check" size={11} />}
                      </span>
                      {p.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-ink/15 py-6 text-center text-sm text-ink/45">
                No products available to attach yet.
              </p>
            )}
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3.5 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
              {pending ? "Launching…" : "Launch campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
