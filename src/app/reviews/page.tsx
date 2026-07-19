import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { PageHead, DataTable } from "@/components/widgets";
import { apiFetchSafe } from "@/lib/api";
import ReviewModeration from "./ReviewModeration";

export const metadata: Metadata = { title: "Reviews" };

type ReviewRow = {
  id: string;
  productId: string;
  rating: number;
  body: string;
  status: string;
  flagReason: string | null;
  response: string | null;
  createdAt: string;
  reviewer: string;
  product: string;
};

const statusPill: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  FLAGGED: "bg-red-100 text-red-600",
  REMOVED: "bg-ink/8 text-ink/60",
};

const titled = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();

export default async function ReviewsPage() {
  const reviews = (await apiFetchSafe<ReviewRow[]>("/admin/reviews")) ?? [];
  const flagged = reviews.filter((r) => r.status === "FLAGGED").length;

  return (
    <>
      <PageHead title="Reviews" subtitle={`${reviews.length} reviews · ${flagged} flagged for moderation`} />

      <DataTable columns={["Product", "Customer", "Rating", "Review", "Status", ""]}>
        {reviews.map((r) => (
          <tr key={r.id} className="hover:bg-ink/[0.02]">
            <td className="px-5 py-4 font-bold">{r.product}</td>
            <td className="px-5 py-4 text-ink/70">{r.reviewer}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center gap-1 font-bold">
                <Icon name="star" size={14} className="text-brand" /> {r.rating}
              </span>
            </td>
            <td className="max-w-[280px] px-5 py-4 text-ink/70">
              {r.body}
              {r.flagReason && (
                <span className="mt-1 block text-xs font-bold text-red-600">Flagged: {r.flagReason}</span>
              )}
            </td>
            <td className="px-5 py-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[r.status] ?? "bg-ink/8 text-ink/60"}`}>{titled(r.status)}</span>
            </td>
            <td className="px-5 py-4 text-right">
              <ReviewModeration id={r.id} status={r.status} />
            </td>
          </tr>
        ))}
        {reviews.length === 0 && (
          <tr>
            <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink/45">
              No reviews yet.
            </td>
          </tr>
        )}
      </DataTable>
    </>
  );
}
