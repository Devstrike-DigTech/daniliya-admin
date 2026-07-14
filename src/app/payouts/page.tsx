import type { Metadata } from "next";
import PayoutsView from "./PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default function PayoutsPage() {
  return <PayoutsView />;
}
