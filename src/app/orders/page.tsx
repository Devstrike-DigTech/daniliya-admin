import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import OrdersView, { type AdminOrder } from "./OrdersView";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const orders = await apiFetchSafe<AdminOrder[]>("/admin/orders");
  return <OrdersView orders={orders ?? []} />;
}
