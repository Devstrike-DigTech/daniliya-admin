import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";

/**
 * Proxies a file upload to the API's POST /uploads.
 *
 * The browser can't call the API directly — the access token is an httpOnly
 * cookie it never sees. This forwards the multipart body with the bearer
 * attached and hands back {url, key, ...} or the API's own error, unchanged.
 */
export async function POST(req: Request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Please sign in to upload a file." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const purpose = searchParams.get("purpose") ?? "";

  // Stream the incoming multipart body straight through — no buffering, no
  // re-encoding, so the API sees exactly what the browser sent.
  const form = await req.formData();

  const res = await fetch(`${API_URL}/uploads?purpose=${encodeURIComponent(purpose)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const m = body?.message;
    return NextResponse.json(
      { error: Array.isArray(m) ? m.join(", ") : (m ?? "Upload failed.") },
      { status: res.status },
    );
  }
  return NextResponse.json(body);
}
