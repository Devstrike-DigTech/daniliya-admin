import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** Proxy to the API's public password reset — sets the new password from a token. */
export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));

  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const m = body?.message;
    return NextResponse.json(
      { error: Array.isArray(m) ? m.join(", ") : (m ?? "Could not reset the password.") },
      { status: res.status },
    );
  }
  return NextResponse.json(body?.data ?? { ok: true });
}
