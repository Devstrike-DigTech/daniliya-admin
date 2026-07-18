import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "./auth-cookies";

export const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The API wraps every success in { success, data, timestamp }. */
type Envelope<T> = { success: boolean; data: T; message?: string | string[] };

/**
 * Server-side fetch to the Daniliya API. Reads the httpOnly access token from
 * cookies and unwraps the response envelope. Token refresh is handled in
 * middleware, so a 401 here means the session is genuinely gone.
 *
 * Server Components / Route Handlers only — never import into a client component.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok) {
    const raw = body?.message;
    throw new ApiError(res.status, Array.isArray(raw) ? raw.join(", ") : (raw ?? "Request failed"));
  }
  return body?.data as T;
}

/**
 * Same as apiFetch but returns null instead of throwing — for dashboard panels
 * that should degrade to an empty state rather than blow up the whole page.
 */
export async function apiFetchSafe<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    return await apiFetch<T>(path, init);
  } catch {
    return null;
  }
}
