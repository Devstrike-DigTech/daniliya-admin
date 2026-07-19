"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function post(path: string, revalidate: string[]): Promise<ActionResult> {
  try {
    const res = await apiFetch<{ message?: string }>(path, { method: "POST" });
    revalidate.forEach((p) => revalidatePath(p));
    return { ok: true, message: res?.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "That action could not be completed.",
    };
  }
}

/**
 * Build this period's payout batches.
 *
 * This also promotes eligible commissions from PENDING to CONFIRMED and credits
 * the beneficiaries' wallets (PayoutsService.run → commissions.confirmEligible),
 * so it is the step that turns earnings into money owed. It is guarded by a
 * Redis lock server-side, so a double-click cannot produce two runs.
 */
export async function runPayouts(): Promise<ActionResult> {
  return post("/admin/payouts/run", ["/payouts", "/finance", "/"]);
}

/** Approve and schedule — gated on compliance checks, then initiates transfers. */
export async function approveBatch(ref: string): Promise<ActionResult> {
  return post(`/admin/payouts/${ref}/approve`, [`/payouts/${ref}`, "/payouts", "/finance"]);
}

export async function retryBatch(ref: string): Promise<ActionResult> {
  return post(`/admin/payouts/${ref}/retry`, [`/payouts/${ref}`, "/payouts"]);
}

export async function holdBatch(ref: string): Promise<ActionResult> {
  return post(`/admin/payouts/${ref}/hold`, [`/payouts/${ref}`, "/payouts"]);
}

export async function cancelBatch(ref: string): Promise<ActionResult> {
  return post(`/admin/payouts/${ref}/cancel`, [`/payouts/${ref}`, "/payouts"]);
}
