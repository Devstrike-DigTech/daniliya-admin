"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

/** POST /admin/kyc/{id}/approve — marks the submission VERIFIED (payouts unlock). */
export async function approveKyc(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/kyc/${id}/approve`, { method: "POST" });
    revalidatePath("/kyc");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/kyc/{id}/reject — reason is required and shown to the applicant. */
export async function rejectKyc(id: string, reason: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/kyc/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    revalidatePath("/kyc");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
