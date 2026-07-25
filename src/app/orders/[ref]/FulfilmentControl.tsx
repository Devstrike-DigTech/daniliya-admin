"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import DatePicker from "@/components/DatePicker";
import { useConfirm } from "@/components/ConfirmDialog";
import { advanceOrder } from "../actions";

/** The single next step for each fulfilment stage, matching the API ladder. */
const NEXT: Record<string, { status: "PROCESSING" | "SHIPPED" | "DELIVERED"; label: string; icon: string }> = {
  CONFIRMED: { status: "PROCESSING", label: "Mark as packed", icon: "package" },
  PROCESSING: { status: "SHIPPED", label: "Mark as shipped", icon: "truck" },
  SHIPPED: { status: "DELIVERED", label: "Mark as delivered", icon: "check" },
};

const field =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

/**
 * Advance one order to its next fulfilment stage.
 *
 * Only the immediate next step is offered, so the flow can't skip stages. The
 * shipped step needs a courier (and optional tracking/ETA) because that is what
 * creates the shipment the buyer sees on the tracking page.
 */
export default function FulfilmentControl({
  orderRef,
  status,
}: {
  orderRef: string;
  status: string;
}) {
  const router = useRouter();
  const [shipOpen, setShipOpen] = useState(false);
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [eta, setEta] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  const next = NEXT[status];
  if (!next) return null; // DELIVERED / COMPLETED / reversed — nothing further here

  const run = async (
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>,
    ask?: string,
  ) => {
    if (ask && !(await confirm({ message: ask }))) return;
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      else {
        setShipOpen(false);
        router.refresh();
      }
    });
  };

  const ship = () => {
    if (!courier.trim()) return setError("Enter the courier before marking it shipped.");
    const estimatedDelivery = eta ? new Date(`${eta}T00:00:00.000Z`).toISOString() : undefined;
    run(() =>
      advanceOrder(orderRef, "SHIPPED", {
        courier: courier.trim(),
        trackingNumber: tracking.trim() || undefined,
        estimatedDelivery,
      }),
    );
  };

  return (
    <div className="mt-6">
      {next.status === "SHIPPED" && shipOpen ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <p className="font-bold">Despatch details</p>
          <p className="mt-1 text-sm text-ink/55">The buyer sees these on their tracking page.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-bold">Courier</label>
              <input className={field} value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. GIG Logistics" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">Tracking number</label>
              <input className={field} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">Estimated delivery</label>
              <DatePicker className={field} value={eta} onChange={setEta} disablePast placeholder="Select a date" />
            </div>
          </div>
          {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={ship} disabled={pending} className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
              {pending ? "Saving…" : "Confirm despatch"}
            </button>
            <button onClick={() => { setShipOpen(false); setError(""); }} className="rounded-xl border border-ink/15 px-6 py-3 text-sm font-bold hover:bg-ink/5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() =>
              next.status === "SHIPPED"
                ? setShipOpen(true)
                : run(
                    () => advanceOrder(orderRef, next.status),
                    next.status === "DELIVERED"
                      ? "Mark this order as delivered?"
                      : undefined,
                  )
            }
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Icon name={pending ? "clock" : next.icon} size={16} />
            {pending ? "Working…" : next.label}
          </button>
          {error && <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>}
        </>
      )}
    </div>
  );
}
