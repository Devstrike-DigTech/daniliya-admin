/** Shared cookie names + options. Tokens are httpOnly — never readable by JS. */
export const ACCESS_COOKIE = "daniliya_at";
export const REFRESH_COOKIE = "daniliya_rt";

export const ACCESS_MAX_AGE = 15 * 60; // matches JWT_ACCESS_EXPIRES_IN (15m)
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // matches JWT_REFRESH_EXPIRES_IN (7d)

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});
