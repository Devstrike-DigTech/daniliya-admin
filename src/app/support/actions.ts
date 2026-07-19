"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "That action could not be completed.",
});

/** Post an admin reply into the ticket thread. */
export async function replyToTicket(ref: string, body: string): Promise<ActionResult> {
  if (!body.trim()) return { ok: false, error: "Write a reply first." };
  try {
    await apiFetch(`/admin/support/tickets/${ref}/reply`, {
      method: "POST",
      body: JSON.stringify({ body: body.trim() }),
    });
    revalidatePath("/support");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** Take ownership — the API assigns the ticket to the acting admin. */
export async function assignTicket(ref: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/support/tickets/${ref}/assign`, { method: "POST" });
    revalidatePath("/support");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function closeTicket(ref: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/support/tickets/${ref}/close`, { method: "POST" });
    revalidatePath("/support");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
