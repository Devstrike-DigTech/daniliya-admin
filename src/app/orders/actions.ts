"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const failed = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

/**
 * Order reversals. Both endpoints run the same server-side routine
 * (AdminOrdersService.reverse): the order moves to REFUNDED/CANCELLED, the
 * payment is marked REFUNDED, reserved stock is returned to every product, and
 * CommissionsService.voidForOrder claws back commissions — including issuing a
 * matching debit against a wallet that was already credited.
 *
 * These move real money, so both are gated behind a confirm at the call site.
 * The API rejects a second attempt ("Order is already refunded"), and that
 * message is surfaced verbatim rather than swallowed.
 */
async function reverse(ref: string, action: "refund" | "cancel"): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/orders/${ref}/${action}`, { method: "POST" });
    revalidatePath("/orders");
    revalidatePath(`/orders/${ref}`);
    revalidatePath("/finance");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/orders/{ref}/refund — no body. */
export async function refundOrder(ref: string): Promise<ActionResult> {
  return reverse(ref, "refund");
}

/** POST /admin/orders/{ref}/cancel — no body. */
export async function cancelOrder(ref: string): Promise<ActionResult> {
  return reverse(ref, "cancel");
}

/**
 * Advance an order along the fulfilment ladder — PROCESSING → SHIPPED →
 * DELIVERED → COMPLETED. Admins fulfil Daniliya-owned orders (no vendor) and
 * can push any order forward. Moving to SHIPPED needs a courier and writes the
 * shipment the buyer tracks. The API refuses backward or out-of-order moves.
 */
export async function advanceOrder(
  ref: string,
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED",
  shipment?: { courier?: string; trackingNumber?: string; estimatedDelivery?: string },
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/orders/${ref}/status`, {
      method: "POST",
      body: JSON.stringify({ status, ...shipment }),
    });
    revalidatePath("/orders");
    revalidatePath(`/orders/${ref}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
