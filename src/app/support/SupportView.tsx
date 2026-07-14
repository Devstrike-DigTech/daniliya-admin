"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

type Msg = { from: string; admin?: boolean; time: string; text: string; initials: string };
type Ticket = {
  id: string;
  subject: string;
  from: string;
  assigned: string;
  priority: "Urgent" | "High" | "Medium";
  messages: Msg[];
};

const TICKETS: Ticket[] = [
  {
    id: "TCK-2201", subject: "Payout didn't hit my bank", from: "Kelechi N.", assigned: "Ops · Ade", priority: "Urgent",
    messages: [
      { from: "Kelechi N.", time: "8:12 AM", initials: "KN", text: "My Monday payout of ₦42,000 didn't hit my Access bank account. Can you check the transfer log?" },
      { from: "Ade", admin: true, time: "12 May, 16:11", initials: "AD", text: "Checking now — I can see the transfer was queued but failed at Paystack. Retrying immediately." },
    ],
  },
  {
    id: "TCK-2202", subject: "Product rejected — why?", from: "Sparkle & Co.", assigned: "Ops · Ade", priority: "High",
    messages: [
      { from: "Sparkle & Co.", time: "9:40 AM", initials: "SC", text: "Our Wooden frame mirror was rejected. What needs fixing before we resubmit?" },
      { from: "Ade", admin: true, time: "12 May, 10:02", initials: "AD", text: "The product images didn't meet the white-background policy. Re-upload and we'll fast-track review." },
    ],
  },
  {
    id: "TCK-2203", subject: "Can't join campaign", from: "Emeka O.", assigned: "Support · Ify", priority: "Medium",
    messages: [
      { from: "Emeka O.", time: "Yesterday", initials: "EO", text: "The Handbook Push campaign won't let me join — it says I'm not eligible." },
      { from: "Ify", admin: true, time: "Yesterday", initials: "IF", text: "That campaign is Gold-tier and above. You're currently NIL tier — hit 25 conversions to qualify." },
    ],
  },
];

const priorityPill: Record<string, string> = {
  Urgent: "bg-orange-100 text-orange-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-ink/8 text-ink/60",
};

export default function SupportView() {
  const [active, setActive] = useState(0);
  const t = TICKETS[active];

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-[28px]">Support inbox</h1>
      <p className="mt-1 text-sm text-ink/55">Tickets from customers, affiliates, vendors and creators</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Ticket list */}
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="relative">
            <input placeholder="Search tickets" className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-12 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand" />
            <span className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand"><Icon name="search" size={15} /></span>
          </div>
          <div className="mt-3 space-y-2">
            {TICKETS.map((tk, i) => (
              <button
                key={tk.id}
                onClick={() => setActive(i)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${i === active ? "border-brand bg-brand/[0.05]" : "border-ink/10 hover:bg-ink/[0.02]"}`}
              >
                <p className="text-xs text-ink/45">{tk.id}</p>
                <p className="mt-0.5 font-bold">{tk.subject}</p>
                <p className="text-xs text-ink/50">{tk.from} · assigned to {tk.assigned}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${priorityPill[tk.priority]}`}>{tk.priority}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 pb-5">
            <div>
              <p className="text-xs text-ink/45">{t.id}</p>
              <p className="mt-0.5 text-lg font-bold">{t.subject}</p>
              <p className="text-sm text-ink/50">{t.from} · assigned to {t.assigned}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityPill[t.priority]}`}>{t.priority}</span>
          </div>

          <div className="space-y-6 py-6">
            {t.messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.admin ? "flex-row-reverse" : ""}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${m.admin ? "bg-[#6d3fa0] text-white" : "bg-brand/15 text-brand"}`}>{m.initials}</span>
                <div className={`max-w-[80%] ${m.admin ? "text-right" : ""}`}>
                  <p className="text-sm">
                    <span className="font-bold">{m.from}</span>{" "}
                    <span className="text-ink/45">{m.admin ? "Admin · " : ""}{m.time}</span>
                  </p>
                  <div className={`mt-1.5 rounded-xl px-4 py-3 text-sm ${m.admin ? "bg-brand/[0.06]" : "bg-ink/[0.04]"}`}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <textarea placeholder="Type a reply" className="min-h-[90px] w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand" />
          <button className="mt-4 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">Mark as resolved</button>
        </div>
      </div>
    </>
  );
}
