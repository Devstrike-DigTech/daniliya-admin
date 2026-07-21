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

/** The product fields an admin form submits (create and edit share this shape). */
export type ProductInput = {
  title: string;
  slug?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  category?: string;
  vendorId?: string | null;
  commissionRate?: number;
  affiliateEligible?: boolean;
  influencerEligible?: boolean;
  commissionMode?: "INCLUSIVE" | "ADD_ON";
  publish?: boolean;
  imageUrls?: string[];
};

/** POST /admin/products — create a platform-owned or vendor-attributed product. */
export async function createProduct(
  input: ProductInput,
): Promise<ActionResult & { id?: string }> {
  try {
    const created = await apiFetch<{ id: string }>("/admin/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    revalidatePath("/products");
    return { ok: true, id: created.id };
  } catch (e) {
    return failed(e);
  }
}

/** PATCH /admin/products/{id} — edit fields, vendor attribution and images. */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/products/{id}/delist — take it off the storefront (reversible). */
export async function delistProduct(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/products/${id}/delist`, { method: "POST" });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/products/{id}/relist — put it back on the storefront. */
export async function relistProduct(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/products/${id}/relist`, { method: "POST" });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
