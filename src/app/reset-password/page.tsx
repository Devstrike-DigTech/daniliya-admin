import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  // useSearchParams (reads ?token=) must sit under a Suspense boundary.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
