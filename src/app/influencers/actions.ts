"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Influencer mutations. These run on the server so apiFetch can read the httpOnly
 * access cookie — no token ever reaches the client.
 *
 * Note the two different identifiers the API uses: approve/reject are keyed on
 * the *influencer profile* id, while suspend/reinstate/message are keyed on the
 * *user* id (AdminPeopleController — `influencers/:id/approve` vs `users/:userId/…`).
 * Passing the wrong one 404s.
 */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

function touch(profileId: string) {
  revalidatePath(`/influencers/${profileId}`);
  revalidatePath("/influencers");
}

/**
 * POST /admin/influencers/{id}/approve — sets isApproved and stamps approvedAt.
 * Approval is what admits the creator to campaigns, so it is audited server-side.
 */
export async function approveInfluencer(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/influencers/${id}/approve`, { method: "POST" });
    touch(id);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/influencers/{id}/reject — reason is optional and stored on rejectedReason. */
export async function rejectInfluencer(id: string, reason?: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/influencers/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
    });
    touch(id);
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
export async function suspendInfluencer(userId: string, profileId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${userId}/suspend`, { method: "POST" });
    touch(profileId);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/users/{userId}/reinstate — returns User.status to ACTIVE. */
export async function reinstateInfluencer(
  userId: string,
  profileId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${userId}/reinstate`, { method: "POST" });
    touch(profileId);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/**
 * POST /admin/users/{userId}/message — sends an email via the API's mailer.
 * Both fields are required and body is capped at 2000 chars (MessageUserDto).
 */
export async function messageInfluencer(
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
