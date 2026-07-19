"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const failed = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

function revalidate(ref: string) {
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${ref}`);
}

/**
 * Booking lifecycle. The server enforces a transition table
 * (bookings.service.ts TRANSITIONS):
 *
 *   REQUESTED   → CONFIRMED | CANCELLED
 *   CONFIRMED   → IN_PROGRESS | CANCELLED
 *   IN_PROGRESS → COMPLETED | CANCELLED
 *   COMPLETED / CANCELLED → terminal
 *
 * Anything else returns "Cannot move a X booking to Y". The UI only offers the
 * legal moves, but the guard is the server's, not ours.
 *
 * There is no REJECTED status: /reject and /cancel both land on CANCELLED and
 * differ only in intent (reject is the REQUESTED-stage refusal).
 */

/**
 * POST /admin/bookings/{ref}/accept → CONFIRMED.
 *
 * This is where the job is priced: quotedAmount is written here and nowhere
 * else. The request field is `note` — the API echoes it back as `adminNote`,
 * so do not mirror the response shape into the request.
 */
export async function acceptBooking(
  ref: string,
  input: { quotedAmount?: number; note?: string },
): Promise<ActionResult> {
  try {
    const body: { quotedAmount?: number; note?: string } = {};
    if (input.quotedAmount !== undefined && !Number.isNaN(input.quotedAmount)) {
      body.quotedAmount = input.quotedAmount;
    }
    const note = input.note?.trim();
    if (note) body.note = note;

    await apiFetch(`/admin/bookings/${ref}/accept`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidate(ref);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/bookings/{ref}/start → IN_PROGRESS. No body. */
export async function startBooking(ref: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/bookings/${ref}/start`, { method: "POST" });
    revalidate(ref);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/bookings/{ref}/complete → COMPLETED. No body. Terminal. */
export async function completeBooking(ref: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/bookings/${ref}/complete`, { method: "POST" });
    revalidate(ref);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/bookings/{ref}/reject → CANCELLED, storing `cancelReason`. */
export async function rejectBooking(ref: string, reason?: string): Promise<ActionResult> {
  return withReason(ref, "reject", reason);
}

/** POST /admin/bookings/{ref}/cancel → CANCELLED, storing `cancelReason`. */
export async function cancelBooking(ref: string, reason?: string): Promise<ActionResult> {
  return withReason(ref, "cancel", reason);
}

async function withReason(
  ref: string,
  action: "reject" | "cancel",
  reason?: string,
): Promise<ActionResult> {
  try {
    const trimmed = reason?.trim();
    await apiFetch(`/admin/bookings/${ref}/${action}`, {
      method: "POST",
      body: JSON.stringify(trimmed ? { reason: trimmed } : {}),
    });
    revalidate(ref);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
