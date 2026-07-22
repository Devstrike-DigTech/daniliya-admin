"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Settings mutations. Team writes are SUPERADMIN-only on the API — a plain ADMIN
 * gets a 403 whose message is passed straight back to the UI.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "Something went wrong. Please try again.",
});

export type AdminRole = "SUPERADMIN" | "FINANCE" | "SUPPORT" | "USER_MANAGER";

/** POST /admin/team/invite */
export async function inviteTeammate(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}): Promise<ActionResult> {
  try {
    await apiFetch("/admin/team/invite", { method: "POST", body: JSON.stringify(input) });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** PATCH /admin/team/{id}/role */
export async function changeTeammateRole(id: string, role: AdminRole): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/team/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** DELETE /admin/team/{id} */
export async function removeTeammate(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/team/${id}`, { method: "DELETE" });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** POST /auth/change-password — signed-in password change. */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    await apiFetch("/auth/change-password", { method: "POST", body: JSON.stringify(input) });
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** PATCH /admin/settings/config — body is { values: { KEY: "9000.00" } }. */
export async function updatePlatformConfig(values: Record<string, string>): Promise<ActionResult> {
  try {
    await apiFetch("/admin/settings/config", {
      method: "PATCH",
      body: JSON.stringify({ values }),
    });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

// ── Bookable services (verticals) ───────────────────────────────────────────

/** A service vertical, as returned by GET /admin/services. */
export type ServiceVertical = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  bookings: number;
  quoteRequests: number;
};

/** POST /admin/services — add a bookable service. */
export async function createService(input: {
  name: string;
  description?: string;
  isActive?: boolean;
}): Promise<ActionResult> {
  try {
    await apiFetch("/admin/services", { method: "POST", body: JSON.stringify(input) });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** PATCH /admin/services/{id} — edit name/description or flip active. */
export async function updateService(
  id: string,
  input: { name?: string; description?: string; isActive?: boolean },
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/services/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

/** DELETE /admin/services/{id} — refused by the API if it has booking history. */
export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/services/${id}`, { method: "DELETE" });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
