"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

/**
 * Affiliate onboarding content — tutorial lessons and assessment questions.
 * These back the affiliate /join tutorial + assessment; publishing here is what
 * unblocks the onboarding wall (an affiliate can't reach the assessment until at
 * least one lesson is published, and can't be graded without active questions).
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

const failed = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : "Something went wrong. Please try again.",
});

// ── Types (mirror the API) ──────────────────────────────────────────────────

export type TutorialStep = {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
};

export type AssessmentQuestion = {
  id: string;
  text: string;
  options: string[];
  correctOption: string;
  explanation: string | null;
  isActive: boolean;
  createdAt: string;
};

// ── Tutorial lessons ────────────────────────────────────────────────────────

export async function createTutorial(input: {
  title: string;
  content?: string;
  videoUrl?: string;
  isPublished?: boolean;
}): Promise<ActionResult> {
  try {
    await apiFetch("/admin/onboarding/tutorial", {
      method: "POST",
      body: JSON.stringify(input),
    });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function updateTutorial(
  id: string,
  input: {
    title?: string;
    content?: string;
    videoUrl?: string;
    isPublished?: boolean;
    sortOrder?: number;
  },
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/onboarding/tutorial/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function deleteTutorial(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/onboarding/tutorial/${id}`, { method: "DELETE" });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

// ── Assessment questions ────────────────────────────────────────────────────

export async function createQuestion(input: {
  text: string;
  options: string[];
  correctOption: string;
  explanation?: string;
  isActive?: boolean;
}): Promise<ActionResult> {
  try {
    await apiFetch("/admin/onboarding/assessment", {
      method: "POST",
      body: JSON.stringify(input),
    });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function updateQuestion(
  id: string,
  input: {
    text?: string;
    options?: string[];
    correctOption?: string;
    explanation?: string;
    isActive?: boolean;
  },
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/onboarding/assessment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/onboarding/assessment/${id}`, { method: "DELETE" });
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return failed(e);
  }
}
