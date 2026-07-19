"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

/** Take a review down. It stops being visible on the product. */
export async function removeReview(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/reviews/${id}/remove`, { method: "POST" });
    revalidatePath("/reviews");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** Clear a flag and leave the review published. */
export async function keepReview(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/reviews/${id}/keep`, { method: "POST" });
    revalidatePath("/reviews");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** Flag a review for a second look, with an optional reason. */
export async function flagReview(id: string, reason?: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/reviews/${id}/flag`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    });
    revalidatePath("/reviews");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
