import type { Metadata } from "next";
import SupportView from "./SupportView";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return <SupportView />;
}
