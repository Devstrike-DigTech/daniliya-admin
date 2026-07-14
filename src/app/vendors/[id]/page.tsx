import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vendors } from "@/lib/dashboard";
import VendorDetail from "./VendorDetail";

export function generateStaticParams() {
  return vendors.map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = vendors.find((x) => x.id === id);
  return { title: v ? v.name : "Vendor" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = vendors.find((x) => x.id === id);
  if (!vendor) notFound();
  return <VendorDetail vendor={vendor} />;
}
