import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
} from "@/lib/auth-cookies";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";

/** Pages reachable without a session. */
const PUBLIC_PATHS = ["/login", "/verify", "/forgot-password", "/reset-password"];

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
  pathname.startsWith("/api/auth");

/**
 * Optimistic gatekeeper + silent token refresh. (Next 16 renamed Middleware to
 * Proxy — same functionality.) Access tokens live 15 minutes; when one expires
 * we mint a fresh pair from the refresh token here, since Proxy is one of the
 * few places that can both call the API and set cookies.
 *
 * This is a UX convenience, NOT the security boundary: real authorization is
 * enforced by the API's JWT + role guards on every request.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  if (isPublic(pathname)) {
    // Already signed in? Skip the login screen.
    if (access && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (access) return NextResponse.next();

  if (refresh) {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (res.ok) {
        const body = await res.json();
        const { accessToken, refreshToken } = body.data;
        const response = NextResponse.next();
        response.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
        response.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
        return response;
      }
    } catch {
      // fall through to sign-in
    }
  }

  const login = new URL("/login", req.url);
  if (pathname !== "/") login.searchParams.set("next", pathname);
  const redirect = NextResponse.redirect(login);
  redirect.cookies.delete(ACCESS_COOKIE);
  redirect.cookies.delete(REFRESH_COOKIE);
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|fonts).*)"],
};
