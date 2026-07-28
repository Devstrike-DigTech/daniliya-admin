import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { apiFetchSafe } from "@/lib/api";
import { productImage } from "@/lib/dashboard";
import ActionButton from "@/components/ActionButton";
import FulfilmentControl from "./FulfilmentControl";
import { refundOrder, cancelOrder } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

type OrderItem = {
  id: string;
  productId: string;
  titleSnapshot: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  giftWrap: boolean;
  vendor: string | null;
};

type AdminOrderDetail = {
  ref: string;
  status: string;
  channel: string;
  fulfilmentMode: string;
  customer: { name: string; email: string | null; phone: string | null };
  subtotal: string;
  giftAddon: string;
  deliveryFee: string;
  tax: string;
  total: string;
  deliveryAddress: Record<string, unknown> | null;
  contact: Record<string, unknown> | null;
  notes: string | null;
  affiliateCode: string | null;
  influencerCode: string | null;
  promoCode: string | null;
  payment: {
    method: string;
    status: string;
    providerRef: string | null;
    paidAt: string | null;
  } | null;
  items: OrderItem[];
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

// Fulfilment stepper — labels are the design's; each maps to the API OrderStatus enum.
const FLOW = [
  { label: "New", status: "PENDING" },
  { label: "Confirmed", status: "CONFIRMED" },
  { label: "Packed", status: "PROCESSING" },
  { label: "Shipped", status: "SHIPPED" },
  { label: "Delivered", status: "DELIVERED" },
];
// Terminal states that sit past the last step.
const COMPLETED_STAGE: Record<string, number> = {
  COMPLETED: FLOW.length - 1,
  CANCELLED: -1,
  REFUNDED: -1,
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/** deliveryAddress / contact are free-form JSON — render only string leaves. */
function jsonLines(value: Record<string, unknown> | null): string[] {
  if (!value) return [];
  return Object.values(value).filter((v): v is string => typeof v === "string" && v.length > 0);
}

const contactVal = (c: Record<string, unknown> | null, key: string): string | null =>
  c && typeof c[key] === "string" && (c[key] as string).length > 0 ? (c[key] as string) : null;

function FootCard({ foot = "bg-brand", children }: { foot?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-6">{children}</div>
      <div className={`h-1.5 w-full ${foot}`} />
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await apiFetchSafe<AdminOrderDetail>(`/admin/orders/${ref}`);
  if (!order) notFound();

  const stage =
    COMPLETED_STAGE[order.status] ?? FLOW.findIndex((f) => f.status === order.status);

  // AdminOrdersService.reverse refuses an order that is already reversed.
  const reversible = order.status !== "REFUNDED" && order.status !== "CANCELLED";

  const addressLines = jsonLines(order.deliveryAddress);
  const vendors = [...new Set(order.items.map((it) => it.vendor).filter(Boolean))] as string[];

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/orders" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">{order.customer.name}</h1>
          <p className="mt-0.5 font-mono text-sm text-ink/50">{order.ref}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <FootCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink/50">Order fulfilment</p>
                <p className="text-lg font-bold">{order.fulfilmentMode}</p>
              </div>
              {/*
                The design had a "Confirm Order" button here. There is no
                confirm-order endpoint: an order reaches CONFIRMED through
                payment or POD placement, not through an admin click. Showing
                the current status is honest; a button that did nothing was not.
              */}
              <span className="inline-flex items-center gap-2 rounded-xl bg-ink/5 px-4 py-2.5 text-sm font-bold text-ink/70">
                <Icon name="truck" size={16} /> {order.status}
              </span>
            </div>
            <div className="mt-6 flex items-start">
              {FLOW.map((s, i) => (
                <div key={s.label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= stage ? "bg-brand text-white" : "bg-ink/10 text-ink/40"}`}>
                      {i < stage ? <Icon name="check" size={14} /> : i + 1}
                    </span>
                    <span className={`mt-2 text-[11px] font-bold ${i <= stage ? "text-ink" : "text-ink/40"}`}>{s.label}</span>
                  </div>
                  {i < FLOW.length - 1 && <div className={`mx-1 mb-5 h-0.5 flex-1 ${i < stage ? "bg-brand" : "bg-ink/10"}`} />}
                </div>
              ))}
            </div>

            {/* Advance to the next stage. Vendors ship their own products; the
                admin drives Daniliya-owned orders (and can push any along). */}
            <FulfilmentControl orderRef={order.ref} status={order.status} />
          </FootCard>

          <FootCard>
            <p className="font-bold">Items</p>
            {order.items.map((it) => (
              <div key={it.id} className="mt-4 flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={productImage(it.titleSnapshot)}
                    alt={it.titleSnapshot}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold">
                      {it.titleSnapshot}
                      {it.variantName ? (
                        <span className="ml-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">{it.variantName}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink/50">Qty {it.quantity} · {naira(it.unitPrice)} each</p>
                  </div>
                </div>
                <p className="font-bold">{naira(it.totalPrice)}</p>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-ink/55">Subtotal</span><span>{naira(order.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-ink/55">Gift add-on</span><span>{naira(order.giftAddon)}</span></div>
              <div className="flex items-center justify-between"><span className="text-ink/55">Delivery fee</span><span>{naira(order.deliveryFee)}</span></div>
              <div className="flex items-center justify-between"><span className="text-ink/55">Tax</span><span>{naira(order.tax)}</span></div>
              <div className="flex items-center justify-between border-t border-ink/8 pt-2 font-bold"><span>Total</span><span>{naira(order.total)}</span></div>
            </div>
          </FootCard>

          <div className="grid gap-6 sm:grid-cols-2">
            <FootCard>
              <p className="flex items-center gap-1.5 text-sm text-ink/50"><Icon name="user" size={14} /> Customer</p>
              <p className="mt-2 text-lg font-bold">{order.customer.name}</p>
              <p className="text-sm text-ink/55">{order.customer.email ?? "—"}</p>
            </FootCard>
            <FootCard>
              <p className="flex items-center gap-1.5 text-sm text-ink/50"><Icon name="store" size={14} /> Vendor</p>
              <p className="mt-2 text-lg font-bold">{vendors.length ? vendors.join(", ") : "—"}</p>
              <p className="text-sm text-ink/55">—</p>
            </FootCard>
          </div>

          {/*
            Refund and cancel both run AdminOrdersService.reverse: they restore
            stock, mark the payment REFUNDED and void commissions — clawing back
            money already credited to affiliate/influencer wallets. Real money,
            hence a confirm on each. Once the order is REFUNDED or CANCELLED the
            API refuses a repeat, so neither is offered.
          */}
          {reversible ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ActionButton
                action={refundOrder.bind(null, order.ref)}
                icon="share"
                variant="primary"
                confirm={`Refund ${order.ref} for ${naira(order.total)}? This restores stock and reverses any commission already credited to affiliate and influencer wallets.`}
              >
                Issue refund
              </ActionButton>
              <ActionButton
                action={cancelOrder.bind(null, order.ref)}
                icon="close"
                variant="danger"
                confirm={`Cancel ${order.ref}? This restores stock and reverses any commission already credited to affiliate and influencer wallets.`}
              >
                Cancel Order
              </ActionButton>
            </div>
          ) : (
            <p className="rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink/55">
              This order is {order.status.toLowerCase()}. Stock has been restored and any
              commission on it reversed — there is no further action to take.
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <FootCard>
            <p className="flex items-center gap-1.5 text-sm text-ink/50">
              <Icon name="pin" size={14} /> {order.fulfilmentMode === "PICKUP" ? "Pickup" : "Delivery"}
            </p>
            {order.fulfilmentMode === "PICKUP" ? (
              <p className="mt-3 font-bold leading-relaxed">Store pickup — no delivery address</p>
            ) : (
              <p className="mt-3 font-bold leading-relaxed">
                {addressLines.length ? addressLines.join(", ") : "No address on file"}
              </p>
            )}
            {/* Recipient comes from the order's contact, not the account — a
                guest or account holder can ship to someone else. */}
            <p className="mt-3 text-sm font-bold text-ink/80">
              {contactVal(order.contact, "fullName") ?? order.customer.name}
            </p>
            <p className="text-sm text-ink/70">
              {contactVal(order.contact, "phone") ?? order.customer.phone ?? "No phone provided"}
            </p>
            {order.deliveredAt && (
              <p className="mt-2 text-xs text-ink/55">
                Delivered {new Date(order.deliveredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
            )}
          </FootCard>

          <FootCard foot="bg-green-500">
            <p className="flex items-center gap-1.5 text-sm text-ink/50"><Icon name="wallet" size={14} /> Payment</p>
            <p className="mt-3 font-bold">{order.payment?.method ?? "—"}</p>
            <p className="text-xs text-ink/50">{order.payment?.providerRef ?? "—"}</p>
            <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{order.payment?.status ?? "—"}</span>
          </FootCard>

          <FootCard>
            <p className="flex items-center gap-1.5 text-sm text-ink/50"><Icon name="megaphone" size={14} /> Channel</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink/55">{order.channel}</p>
                {(order.affiliateCode ?? order.influencerCode) && (
                  <p className="font-bold">{order.affiliateCode ?? order.influencerCode}</p>
                )}
              </div>
            </div>
          </FootCard>
        </div>
      </div>
    </>
  );
}
