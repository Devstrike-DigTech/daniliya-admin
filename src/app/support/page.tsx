import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import SupportView, { type TicketSummary, type TicketThread } from "./SupportView";

export const metadata: Metadata = { title: "Support" };

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const tickets = (await apiFetchSafe<TicketSummary[]>("/admin/support/tickets")) ?? [];

  const activeRef = ref ?? tickets[0]?.ref;
  const thread = activeRef
    ? await apiFetchSafe<TicketThread>(`/admin/support/tickets/${encodeURIComponent(activeRef)}`)
    : null;

  return <SupportView tickets={tickets} thread={thread} />;
}
