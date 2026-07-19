import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { apiFetchSafe } from "@/lib/api";
import BookingActions from "./BookingActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

type AdminBooking = {
  ref: string;
  status: string;
  service: string | null;
  name: string;
  email: string;
  phone: string;
  description: string | null;
  city: string | null;
  address: string | null;
  budget: string | null;
  quotedAmount: string | null;
  preferredDate: string | null;
  attachments: string[];
  adminNote: string | null;
  cancelReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
};

const statusPill: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
};
const statusLabel: Record<string, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Booking fulfilment timeline stages.
const FLOW = ["New", "Confirmed", "In Progress", "Completed", "Delivered"];
const stageFor: Record<string, number> = {
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

const dash = (v: string | null | undefined) => (v && v.length > 0 ? v : "—");
const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "—";

export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const b = await apiFetchSafe<AdminBooking>(`/admin/bookings/${ref}`);
  if (!b) notFound();

  const isRequested = b.status === "REQUESTED";
  const stage = stageFor[b.status] ?? 0;
  const attachments = b.attachments ?? [];

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/bookings" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">{b.name}</h1>
          <div className="mt-2">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[b.status] ?? "bg-ink/10 text-ink/60"}`}>
              {statusLabel[b.status] ?? b.status}
            </span>
          </div>
          <p className="mt-2 font-mono text-sm text-ink/50">{b.ref}</p>
        </div>
      </div>

      {/* Service request details */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <p className="font-bold">Service request details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field icon="user" label="Name" value={dash(b.name)} />
          <Field icon="mail" label="Email" value={dash(b.email)} />
          <Field icon="phone" label="Phone" value={dash(b.phone)} />
          <Field icon="calendar" label="Date Ordered" value={fmtDate(b.createdAt)} />
          <Field icon="pin" label="City" value={dash(b.city)} />
          <Field icon="alert" label="Description" value={dash(b.description)} />
          <Field icon="wallet" label="Customer budget" value={b.budget ? naira(b.budget) : "—"} />
          {/* Written by the accept step — the only place a booking gets priced. */}
          <Field icon="wallet" label="Quoted amount" value={b.quotedAmount ? naira(b.quotedAmount) : "—"} />
          {b.adminNote && <Field icon="alert" label="Admin note" value={b.adminNote} />}
          {b.cancelReason && <Field icon="close" label="Cancellation reason" value={b.cancelReason} />}
        </div>
        {attachments.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {attachments.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink/[0.04]">
                <Image src={src} alt={`Attachment ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/45">No attachments.</p>
        )}
      </div>

      {/* Lifecycle controls — which ones appear depends on the current status. */}
      {isRequested && <BookingActions bookingRef={b.ref} status={b.status} />}

      {/* Accepted → Booking Fulfilment timeline */}
      {!isRequested && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink/50">Booking Fulfilment</p>
                <p className="text-lg font-bold">Manage booking timeline</p>
              </div>
            </div>
            {/* Accept / start / complete / cancel, gated on the server's transition table. */}
            <BookingActions bookingRef={b.ref} status={b.status} />
            <div className="mt-6 flex items-start">
              {FLOW.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= stage ? "bg-brand text-white" : "bg-ink/10 text-ink/40"}`}>
                      {i < stage ? <Icon name="check" size={14} /> : i + 1}
                    </span>
                    <span className={`mt-2 text-[11px] font-bold ${i <= stage ? "text-ink" : "text-ink/40"}`}>{s}</span>
                  </div>
                  {i < FLOW.length - 1 && <div className={`mx-1 mb-5 h-0.5 flex-1 ${i < stage ? "bg-brand" : "bg-ink/10"}`} />}
                </div>
              ))}
            </div>
          </div>
          <div className="h-1.5 w-full bg-brand" />
        </div>
      )}
    </>
  );
}

function Field({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/12 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs text-ink/45"><Icon name={icon} size={13} /> {label}</p>
      <p className="mt-1 text-sm font-bold leading-snug">{value}</p>
    </div>
  );
}
