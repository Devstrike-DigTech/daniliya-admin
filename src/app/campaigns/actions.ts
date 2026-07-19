"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Campaign mutations. These run on the server so apiFetch can read the httpOnly
 * access cookie — no token ever reaches the client.
 *
 * Every action returns a discriminated result instead of throwing, so the
 * calling client component can render the API's own error message.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "Something went wrong. Please try again.",
});

/** POST /admin/campaigns — body mirrors CreateCampaignDto. */
export type CreateCampaignPayload = {
  title: string;
  brief?: string;
  productIds?: string[];
  payoutModel: "FLAT" | "COMMISSION";
  commissionRate?: number;
  flatAmount?: number;
  startDate: string;
  endDate: string;
};

export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await apiFetch<{ id: string }>("/admin/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/campaigns");
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return failed(e);
  }
}

/** POST /admin/campaigns/{id}/pause|resume|end */
async function setCampaignStatus(
  id: string,
  action: "pause" | "resume" | "end",
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/campaigns/${id}/${action}`, { method: "POST" });
    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${id}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function pauseCampaign(id: string): Promise<ActionResult> {
  return setCampaignStatus(id, "pause");
}

export async function resumeCampaign(id: string): Promise<ActionResult> {
  return setCampaignStatus(id, "resume");
}

export async function endCampaign(id: string): Promise<ActionResult> {
  return setCampaignStatus(id, "end");
}

/**
 * Approve or reject a creator's post submission.
 *
 * This is not cosmetic moderation: CommissionsService.confirmEligible() only
 * promotes an influencer commission from PENDING to CONFIRMED once the campaign
 * post is APPROVED. Until an admin approves it here, the creator's earnings
 * never reach their wallet or a payout batch.
 */
export async function approveSubmission(
  submissionId: string,
  campaignId: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/campaigns/submissions/${submissionId}/approve`, { method: "POST" });
    revalidatePath(`/campaigns/${campaignId}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function rejectSubmission(
  submissionId: string,
  campaignId: string,
  note?: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/campaigns/submissions/${submissionId}/reject`, {
      method: "POST",
      body: JSON.stringify(note ? { note } : {}),
    });
    revalidatePath(`/campaigns/${campaignId}`);
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
