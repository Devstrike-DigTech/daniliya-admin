"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const failed = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

/**
 * Product moderation. These are the ONLY two moderation endpoints the API
 * exposes — there is no "unlist" and no admin "remove". REMOVED is set by the
 * vendor deleting a product that already has order history
 * (vendor-products.service.ts), not by an admin.
 *
 * Note the server does not guard the source status (AdminService.moderateProduct
 * updates from any state), so the calling UI is responsible for only offering
 * the transition that makes sense.
 */

/** POST /admin/products/{id}/approve — status becomes ACTIVE and it enters the public catalogue. */
export async function approveProduct(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/products/${id}/approve`, { method: "POST" });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/**
 * POST /admin/products/{id}/reject — status becomes REJECTED and the reason is
 * stored on `rejectedReason`, which is visible to the vendor. The reason is
 * optional to the API (it defaults to "Rejected"), but we always ask for one.
 */
export async function rejectProduct(id: string, reason?: string): Promise<ActionResult> {
  try {
    const trimmed = reason?.trim();
    await apiFetch(`/admin/products/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(trimmed ? { reason: trimmed } : {}),
    });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
