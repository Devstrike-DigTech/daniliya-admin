import type { Metadata } from "next";
import VerifyForm from "@/components/auth/VerifyForm";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyPage() {
  return <VerifyForm />;
}
