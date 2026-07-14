import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { affiliates } from "@/lib/dashboard";
import AffiliateDetail from "./AffiliateDetail";

export function generateStaticParams() {
  return affiliates.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = affiliates.find((x) => x.id === id);
  return { title: a ? a.name : "Affiliate" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const affiliate = affiliates.find((a) => a.id === id);
  if (!affiliate) notFound();
  return <AffiliateDetail affiliate={affiliate} />;
}
