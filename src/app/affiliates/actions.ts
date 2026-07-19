"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Affiliate mutations. These run on the server so apiFetch can read the httpOnly
 * access cookie — no token ever reaches the client.
 *
 * Note the two different identifiers the API uses: the tier endpoint is keyed on
 * the *affiliate profile* id, while suspend/reinstate/message are keyed on the
 * *user* id (AdminPeopleController — `affiliates/:id/tier` vs `users/:userId/…`).
 * Passing the wrong one 404s.
 */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

export type AffiliateTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

/** POST /admin/affiliates/{id}/tier — {id} is the affiliate profile id. Audited server-side. */
export async function changeAffiliateTier(id: string, tier: AffiliateTier): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/affiliates/${id}/tier`, {
      method: "POST",
      body: JSON.stringify({ tier }),
    });
    revalidatePath(`/affiliates/${id}`);
    revalidatePath("/affiliates");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/**
 * POST /admin/users/{userId}/suspend — {userId} is the user id, not the profile id.
 *
 * This flips User.status to SUSPENDED, which locks the person out of their
 * portal; it is not a soft flag. The API refuses it for accounts still in
 * PENDING_VERIFICATION.
 */
export async function suspendAffiliate(userId: string, profileId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${userId}/suspend`, { method: "POST" });
    revalidatePath(`/affiliates/${profileId}`);
    revalidatePath("/affiliates");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/users/{userId}/reinstate — returns User.status to ACTIVE. */
export async function reinstateAffiliate(userId: string, profileId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${userId}/reinstate`, { method: "POST" });
    revalidatePath(`/affiliates/${profileId}`);
    revalidatePath("/affiliates");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/**
 * POST /admin/users/{userId}/message — sends an email via the API's mailer.
 * Both fields are required and body is capped at 2000 chars (MessageUserDto).
 */
export async function messageAffiliate(
  userId: string,
  subject: string,
  body: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${userId}/message`, {
      method: "POST",
      body: JSON.stringify({ subject, body }),
    });
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
