import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  // LoginForm reads ?next= via useSearchParams, which needs a Suspense boundary
  // so the page can still be prerendered.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
