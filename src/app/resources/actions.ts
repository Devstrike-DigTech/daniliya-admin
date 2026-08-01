"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Affiliate marketing resources — brand creatives, ready-to-send scripts and
 * training-video links. Each is global (productId null) or scoped to a product;
 * affiliates see the published ones on their Resources page.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "Something went wrong. Please try again.",
});

export type ResourceType = "CREATIVE" | "SCRIPT" | "VIDEO";

export type AdminResource = {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  productId: string | null;
  fileUrl: string | null;
  fileFormat: string | null;
  fileMeta: string | null;
  body: string | null;
  videoUrl: string | null;
  duration: string | null;
  isPublished: boolean;
  sortOrder: number;
  productTitle: string | null;
  productSlug: string | null;
};

/** The fields a create/edit form submits. */
export type ResourceInput = {
  type: ResourceType;
  title: string;
  description?: string;
  productId?: string | null;
  fileUrl?: string;
  fileFormat?: string;
  fileMeta?: string;
  body?: string;
  videoUrl?: string;
  duration?: string;
  isPublished?: boolean;
};

export async function createResource(input: ResourceInput): Promise<ActionResult> {
  try {
    await apiFetch("/admin/resources", { method: "POST", body: JSON.stringify(input) });
    revalidatePath("/resources");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function updateResource(
  id: string,
  input: Partial<ResourceInput> & { sortOrder?: number },
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/resources/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    revalidatePath("/resources");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function deleteResource(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/resources/${id}`, { method: "DELETE" });
    revalidatePath("/resources");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
