import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { PageHead, DataTable } from "@/components/widgets";

export const metadata: Metadata = { title: "Reviews" };

const reviews = [
  { id: "RV-2201", product: "Eco Dish Soap 500ml", customer: "Chioma E.", rating: 5, text: "Cuts grease instantly, smells lovely.", status: "Published" },
  { id: "RV-2202", product: "Ankara Ready-to-Wear", customer: "Tunde A.", rating: 2, text: "Sizing ran small, colours faded.", status: "Flagged" },
  { id: "RV-2203", product: "Meal-Prep Box", customer: "Ada O.", rating: 4, text: "Fresh and filling, delivery on time.", status: "Published" },
  { id: "RV-2204", product: "Bamboo Scrub Set", customer: "Ngozi M.", rating: 1, text: "Fell apart after two washes.", status: "Flagged" },
];

const statusPill: Record<string, string> = {
  Published: "bg-green-100 text-green-700",
  Flagged: "bg-red-100 text-red-600",
};

export default function ReviewsPage() {
  const flagged = reviews.filter((r) => r.status === "Flagged").length;
  return (
    <>
      <PageHead title="Reviews" subtitle={`${reviews.length} reviews · ${flagged} flagged for moderation`} />

      <DataTable columns={["Product", "Customer", "Rating", "Review", "Status", ""]}>
        {reviews.map((r) => (
          <tr key={r.id} className="hover:bg-ink/[0.02]">
            <td className="px-5 py-4 font-bold">{r.product}</td>
            <td className="px-5 py-4 text-ink/70">{r.customer}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center gap-1 font-bold">
                <Icon name="star" size={14} className="text-brand" /> {r.rating}
              </span>
            </td>
            <td className="max-w-[280px] px-5 py-4 text-ink/70">{r.text}</td>
            <td className="px-5 py-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[r.status]}`}>{r.status}</span>
            </td>
            <td className="px-5 py-4 text-right">
              {r.status === "Flagged" ? (
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90">Keep</button>
                  <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Remove</button>
                </div>
              ) : (
                <span className="text-xs text-ink/40">—</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
