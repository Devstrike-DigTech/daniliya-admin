import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import CustomersView, { type AdminCustomer } from "./CustomersView";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await apiFetchSafe<AdminCustomer[]>("/admin/customers");
  return <CustomersView customers={customers ?? []} />;
}
