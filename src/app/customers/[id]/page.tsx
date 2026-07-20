import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { StatusBadge } from "@/components/widgets";
import { apiFetchSafe } from "@/lib/api";

type Order = { ref: string; status: string; total: string; channel: string; createdAt: string };
type Booking = { ref: string; status: string; description: string | null; quotedAmount: string | null; createdAt: string };
type CustomerDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  totalSpent: number;
  orders: Order[];
  bookings: Booking[];
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await apiFetchSafe<CustomerDetail>(`/admin/customers/${id}`);
  return { title: c ? c.name : "Customer" };
}

const naira = (v: string | number) => `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

function FootCard({ foot = "bg-brand", children }: { foot?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-6">{children}</div>
      <div className={`h-1.5 w-full ${foot}`} />
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await apiFetchSafe<CustomerDetail>(`/admin/customers/${id}`);
  if (!c) notFound();

  const paidOrders = c.orders.filter((o) =>
    ["CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"].includes(o.status),
  ).length;

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/customers" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">{c.name}</h1>
          <p className="mt-0.5 text-sm text-ink/50">Customer since {date(c.createdAt)}</p>
        </div>
      </div>

      {/* Dark hero */}
      <div className="mt-6 rounded-2xl bg-coal p-6 text-white sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-white/50">Email</p>
            <p className="mt-1 font-bold break-all">{c.email}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Phone</p>
            <p className="mt-1 font-bold">{c.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Account</p>
            <p className="mt-1 font-bold">{c.status === "GUEST" ? "Guest checkout" : c.status.charAt(0) + c.status.slice(1).toLowerCase()}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Lifetime spend</p>
            <p className="mt-1 font-bold text-brand">{naira(c.totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Stat foot cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <FootCard><p className="text-sm text-ink/50">Orders</p><p className="mt-1 text-2xl font-bold">{c.orders.length}</p></FootCard>
        <FootCard foot="bg-green-500"><p className="text-sm text-ink/50">Paid orders</p><p className="mt-1 text-2xl font-bold">{paidOrders}</p></FootCard>
        <FootCard foot="bg-blue-500"><p className="text-sm text-ink/50">Service bookings</p><p className="mt-1 text-2xl font-bold">{c.bookings.length}</p></FootCard>
      </div>

      {/* Orders */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <p className="px-6 py-4 font-bold">Orders</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-y border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
                <th className="px-6 py-3 font-bold">Reference</th>
                <th className="px-6 py-3 font-bold">Channel</th>
                <th className="px-6 py-3 font-bold">Total</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {c.orders.map((o) => (
                <tr key={o.ref} className="hover:bg-ink/[0.02]">
                  <td className="px-6 py-3.5">
                    <Link href={`/orders/${o.ref}`} className="font-mono text-xs font-bold text-brand hover:underline">{o.ref}</Link>
                  </td>
                  <td className="px-6 py-3.5 text-ink/70">{o.channel}</td>
                  <td className="px-6 py-3.5 font-bold">{naira(o.total)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-3.5 text-ink/60">{date(o.createdAt)}</td>
                </tr>
              ))}
              {c.orders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink/45">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings */}
      {c.bookings.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <p className="px-6 py-4 font-bold">Service bookings</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-6 py-3 font-bold">Reference</th>
                  <th className="px-6 py-3 font-bold">Request</th>
                  <th className="px-6 py-3 font-bold">Quote</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {c.bookings.map((b) => (
                  <tr key={b.ref} className="hover:bg-ink/[0.02]">
                    <td className="px-6 py-3.5">
                      <Link href={`/bookings/${b.ref}`} className="font-mono text-xs font-bold text-brand hover:underline">{b.ref}</Link>
                    </td>
                    <td className="max-w-[240px] truncate px-6 py-3.5 text-ink/70">{b.description ?? "—"}</td>
                    <td className="px-6 py-3.5 font-bold">{b.quotedAmount ? naira(b.quotedAmount) : "—"}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-3.5 text-ink/60">{date(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
