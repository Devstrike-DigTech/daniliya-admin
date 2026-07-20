"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";
import { assignTicket, closeTicket, replyToTicket } from "./actions";

export type TicketSummary = {
  ref: string;
  assignedTo?: string | null;
  subject: string;
  priority: string;
  status: string;
  updatedAt: string;
  from: string;
};

export type ThreadMessage = { fromAdmin: boolean; body: string; at: string };

export type TicketThread = {
  assignedTo?: string | null;
  ref: string;
  subject: string;
  priority: string;
  status: string;
  updatedAt: string;
  messages: ThreadMessage[];
};

const priorityPill: Record<string, string> = {
  URGENT: "bg-orange-100 text-orange-700",
  HIGH: "bg-amber-100 text-amber-700",
  NORMAL: "bg-ink/8 text-ink/60",
  LOW: "bg-ink/8 text-ink/60",
};

const titled = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const stamp = (v: string) =>
  new Date(v).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SupportView({
  tickets,
  thread,
}: {
  tickets: TicketSummary[];
  thread: TicketThread | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => !q || `${t.ref} ${t.subject} ${t.from}`.toLowerCase().includes(q));
  }, [tickets, query]);

  const active = thread ? tickets.find((t) => t.ref === thread.ref) : undefined;
  const senderName = active?.from ?? "Customer";

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-[28px]">Support inbox</h1>
      <p className="mt-1 text-sm text-ink/55">Tickets from customers, affiliates, vendors and creators</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Ticket list */}
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="relative">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets" className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-12 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand" />
            <span className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand"><Icon name="search" size={15} /></span>
          </div>
          <div className="mt-3 space-y-2">
            {visible.map((tk) => (
              <button
                key={tk.ref}
                onClick={() => router.push(`/support?ref=${encodeURIComponent(tk.ref)}`)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${tk.ref === thread?.ref ? "border-brand bg-brand/[0.05]" : "border-ink/10 hover:bg-ink/[0.02]"}`}
              >
                <p className="text-xs text-ink/45">{tk.ref}</p>
                <p className="mt-0.5 font-bold">{tk.subject}</p>
                {/* The list endpoint returns no assignee. */}
                <p className="text-xs text-ink/50">{tk.from} · {titled(tk.status)}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${priorityPill[tk.priority] ?? "bg-ink/8 text-ink/60"}`}>{titled(tk.priority)}</span>
              </button>
            ))}
            {visible.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-ink/45">No tickets match.</p>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          {thread ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 pb-5">
                <div>
                  <p className="text-xs text-ink/45">{thread.ref}</p>
                  <p className="mt-0.5 text-lg font-bold">{thread.subject}</p>
                  <p className="text-sm text-ink/50">
                    {senderName} · {titled(thread.status)} ·{" "}
                    {thread.assignedTo ? `Assigned to ${thread.assignedTo}` : "Unassigned"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityPill[thread.priority] ?? "bg-ink/8 text-ink/60"}`}>{titled(thread.priority)}</span>
              </div>

              <div className="space-y-6 py-6">
                {thread.messages.map((m, i) => {
                  const who = m.fromAdmin ? "Admin" : senderName;
                  return (
                    <div key={i} className={`flex gap-3 ${m.fromAdmin ? "flex-row-reverse" : ""}`}>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${m.fromAdmin ? "bg-[#6d3fa0] text-white" : "bg-brand/15 text-brand"}`}>{initialsOf(who)}</span>
                      <div className={`max-w-[80%] ${m.fromAdmin ? "text-right" : ""}`}>
                        <p className="text-sm">
                          <span className="font-bold">{who}</span>{" "}
                          <span className="text-ink/45">{m.fromAdmin ? "Admin · " : ""}{stamp(m.at)}</span>
                        </p>
                        <div className={`mt-1.5 rounded-xl px-4 py-3 text-sm ${m.fromAdmin ? "bg-brand/[0.06]" : "bg-ink/[0.04]"}`}>{m.body}</div>
                      </div>
                    </div>
                  );
                })}
                {thread.messages.length === 0 && (
                  <p className="py-6 text-center text-sm text-ink/45">No messages on this ticket.</p>
                )}
              </div>

              <TicketActions ticketRef={thread.ref} status={thread.status} />
            </>
          ) : (
            <p className="py-20 text-center text-sm text-ink/45">Select a ticket to view the conversation.</p>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Reply, take ownership, and close.
 *
 * The reply box and the resolve button were both inert: an admin could type a
 * whole answer to a customer and nothing was ever sent. A closed ticket offers
 * no further action rather than pretending it can be replied to.
 */
function TicketActions({ ticketRef, status }: { ticketRef: string; status: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  const closed = status === "CLOSED" || status === "RESOLVED";

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, after?: () => void) => {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      else {
        after?.();
        router.refresh();
      }
    });
  };

  if (closed) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-3 text-sm font-bold text-ink/55">
        <Icon name="check" size={16} /> This ticket is closed.
      </div>
    );
  }

  return (
    <>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type a reply"
        className="min-h-[90px] w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
      />
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          disabled={pending}
          onClick={() => run(() => replyToTicket(ticketRef, body), () => setBody(""))}
          className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Working…" : "Send reply"}
        </button>
        <button
          disabled={pending}
          onClick={() => run(() => assignTicket(ticketRef))}
          className="rounded-xl border border-ink/15 px-6 py-3 text-sm font-bold transition-colors hover:bg-ink/5 disabled:opacity-60"
        >
          Assign to me
        </button>
        <button
          disabled={pending}
          onClick={async () => {
            if (
              !(await confirm({
                title: "Close ticket",
                message: "Close this ticket? The customer will not be able to reply on it.",
                confirmLabel: "Close ticket",
              }))
            )
              return;
            run(() => closeTicket(ticketRef));
          }}
          className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Mark as resolved
        </button>
      </div>
    </>
  );
}
