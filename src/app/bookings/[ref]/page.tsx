import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { bookings, productGallery } from "@/lib/dashboard";

export function generateStaticParams() {
  return bookings.map((b) => ({ ref: b.ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

const statusPill: Record<string, string> = {
  Requested: "bg-amber-100 text-amber-700",
  "In progress": "bg-orange-100 text-orange-700",
  Completed: "bg-green-100 text-green-700",
  Confirmed: "bg-blue-100 text-blue-700",
};

// Booking fulfilment timeline stages.
const FLOW = ["New", "Confirmed", "In Progress", "Completed", "Delivered"];
const stageFor: Record<string, number> = {
  Confirmed: 1,
  "In progress": 2,
  Completed: 3,
};

export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const b = bookings.find((x) => x.ref === ref);
  if (!b) notFound();
  const isRequested = b.status === "Requested";
  const stage = stageFor[b.status] ?? 0;
  const attachments = productGallery(b.ref).slice(0, 3);

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/bookings" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">{b.customer}</h1>
          <div className="mt-2">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[b.status]}`}>{b.status}</span>
          </div>
          <p className="mt-2 font-mono text-sm text-ink/50">{b.ref}</p>
        </div>
      </div>

      {/* Service request details */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <p className="font-bold">Service request details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field icon="user" label="Name" value={b.customer} />
          <Field icon="mail" label="Email" value={b.email} />
          <Field icon="phone" label="Phone" value={b.phone} />
          <Field icon="calendar" label="Date Ordered" value={b.date} />
          <Field icon="pin" label="City" value={b.city} />
          <Field icon="alert" label="Description" value={b.description} />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {attachments.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink/[0.04]">
              <Image src={src} alt={`Attachment ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Requested → Accept / Reject */}
      {isRequested && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
            <Icon name="check" size={16} /> Accept
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
            <Icon name="close" size={16} /> Reject
          </button>
        </div>
      )}

      {/* Accepted → Booking Fulfilment timeline */}
      {!isRequested && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink/50">Booking Fulfilment</p>
                <p className="text-lg font-bold">Manage booking timeline</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"><Icon name="close" size={16} /> Cancel Booking</button>
                {b.status !== "Completed" && (
                  <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"><Icon name="check" size={16} /> Mark as completed</button>
                )}
              </div>
            </div>
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
