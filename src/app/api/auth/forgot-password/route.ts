import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * Proxy to the API's public password-reset request. The API always replies with
 * the same generic message (it never reveals whether an account exists), which
 * we pass straight through.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: "" }));

  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const m = body?.message;
    return NextResponse.json(
      { error: Array.isArray(m) ? m.join(", ") : (m ?? "Could not send the reset link.") },
      { status: res.status },
    );
  }
  return NextResponse.json(body?.data ?? { ok: true });
}
