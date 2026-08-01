"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  createQuestion,
  createTutorial,
  deleteQuestion,
  deleteTutorial,
  updateQuestion,
  updateTutorial,
  type ActionResult,
  type AssessmentQuestion,
  type TutorialStep,
} from "./actions";

const label = "mb-1.5 block text-sm font-bold";
const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const card = "rounded-2xl border border-ink/10 bg-white p-6";

const TABS = ["Tutorial lessons", "Assessment questions"] as const;

export default function OnboardingView({
  lessons,
  questions,
}: {
  lessons: TutorialStep[];
  questions: AssessmentQuestion[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tutorial lessons");

  const publishedLessons = lessons.filter((l) => l.isPublished).length;
  const activeQuestions = questions.filter((q) => q.isActive).length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Affiliate onboarding</h1>
          <p className="mt-1 text-sm text-ink/55">
            The lessons and quiz every affiliate completes before their account
            is activated.
          </p>
        </div>
      </div>

      {/* The onboarding wall depends on this content: no published lesson means
          affiliates are stuck on "No tutorial lessons are published yet", and
          no active question means the assessment can't be graded. */}
      {(publishedLessons === 0 || activeQuestions === 0) && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p>
            {publishedLessons === 0 && "No tutorial lessons are published yet — affiliates can't start the tutorial. "}
            {activeQuestions === 0 && "No assessment questions are active yet — the quiz can't run. "}
            Publish content below to open the onboarding flow.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Published lessons"
          value={`${publishedLessons}`}
          sub={`${lessons.length} total · ${lessons.length - publishedLessons} draft`}
          accent="bg-brand"
        />
        <SummaryCard
          label="Active questions"
          value={`${activeQuestions}`}
          sub={`${questions.length} total · pass mark 60%`}
          accent="bg-green-500"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Tutorial lessons" ? (
          <LessonsPanel lessons={lessons} />
        ) : (
          <QuestionsPanel questions={questions} />
        )}
      </div>
    </>
  );
}

function SummaryCard({
  label: l,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-6">
        <p className="text-sm text-ink/55">{l}</p>
        <p className="mt-2 text-[28px] font-bold leading-none">{value}</p>
        <p className="mt-2 text-xs text-ink/50">{sub}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}

// ── Tutorial lessons ────────────────────────────────────────────────────────

function LessonsPanel({ lessons }: { lessons: TutorialStep[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<TutorialStep | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (id: string, fn: () => Promise<ActionResult>, okText?: string) => {
    setPendingId(id);
    setMsg(null);
    const res = await fn();
    setPendingId(null);
    if (!res.ok) setMsg({ ok: false, text: res.error });
    else if (okText) setMsg({ ok: true, text: okText });
  };

  const remove = async (l: TutorialStep) => {
    if (
      await confirm({
        title: "Delete lesson",
        message: `Delete "${l.title}"? If affiliates have completed it, unpublish it instead.`,
        confirmLabel: "Delete",
        tone: "danger",
      })
    ) {
      run(l.id, () => deleteTutorial(l.id));
    }
  };

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold">Tutorial lessons</p>
          <p className="text-sm text-ink/50">Shown in order. Affiliates must complete every published lesson.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="plus" size={16} /> Add lesson
        </button>
      </div>

      {msg && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-5 divide-y divide-ink/8">
        {lessons.map((l, i) => (
          <div key={l.id} className="flex flex-wrap items-center gap-4 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/8 text-sm font-bold text-ink/60">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <p className="font-bold">{l.title}</p>
                {l.isPublished ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">Published</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">Draft</span>
                )}
                {l.videoUrl && <Icon name="play" size={15} className="text-ink/40" />}
              </div>
              {l.content && <p className="mt-0.5 line-clamp-1 text-sm text-ink/55">{l.content}</p>}
            </div>

            <button
              type="button"
              onClick={() =>
                run(
                  l.id,
                  () => updateTutorial(l.id, { isPublished: !l.isPublished }),
                  `"${l.title}" is now ${l.isPublished ? "a draft" : "published"}.`,
                )
              }
              disabled={pendingId === l.id}
              role="switch"
              aria-checked={l.isPublished}
              aria-label={`${l.isPublished ? "Unpublish" : "Publish"} ${l.title}`}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${l.isPublished ? "bg-brand" : "bg-ink/20"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${l.isPublished ? "left-0.5 translate-x-5" : "left-0.5"}`} />
            </button>

            <button onClick={() => setEditing(l)} className="text-ink/40 transition-colors hover:text-brand" aria-label={`Edit ${l.title}`}>
              <Icon name="settings" size={18} />
            </button>
            <button
              onClick={() => remove(l)}
              disabled={pendingId === l.id}
              className="text-ink/35 transition-colors hover:text-red-500 disabled:opacity-50"
              aria-label={`Delete ${l.title}`}
            >
              <Icon name="ban" size={18} />
            </button>
          </div>
        ))}
        {lessons.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45">No lessons yet. Add the first one to start the tutorial.</p>
        )}
      </div>

      {(adding || editing) && (
        <LessonModal lesson={editing} onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </div>
  );
}

function LessonModal({ lesson, onClose }: { lesson: TutorialStep | null; onClose: () => void }) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [isPublished, setIsPublished] = useState(lesson?.isPublished ?? false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        content: content.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        isPublished,
      };
      const res = lesson
        ? await updateTutorial(lesson.id, payload)
        : await createTutorial(payload);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <ModalShell title={lesson ? "Edit lesson" : "Add lesson"} onClose={onClose}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className={label}>Title</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How your commission works" required />
        </div>
        <div>
          <label className={label}>Lesson content</label>
          <textarea className={`${input} min-h-32 resize-y`} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What the affiliate should learn in this lesson." />
        </div>
        <div>
          <label className={label}>Video link <span className="font-normal text-ink/40">(optional)</span></label>
          <input className={input} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="peer sr-only" />
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPublished ? "bg-brand" : "bg-ink/20"} after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform ${isPublished ? "after:translate-x-5" : ""}`} />
          Published (visible to affiliates)
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ink/15 py-3 text-sm font-bold text-ink/70 hover:bg-ink/5">Cancel</button>
          <button type="submit" disabled={pending || !title.trim()} className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {pending ? "Saving…" : lesson ? "Save changes" : "Add lesson"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Assessment questions ────────────────────────────────────────────────────

function QuestionsPanel({ questions }: { questions: AssessmentQuestion[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<AssessmentQuestion | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (id: string, fn: () => Promise<ActionResult>, okText?: string) => {
    setPendingId(id);
    setMsg(null);
    const res = await fn();
    setPendingId(null);
    if (!res.ok) setMsg({ ok: false, text: res.error });
    else if (okText) setMsg({ ok: true, text: okText });
  };

  const remove = async (q: AssessmentQuestion) => {
    if (
      await confirm({
        title: "Delete question",
        message: `Delete this question? If it's been answered in past attempts, deactivate it instead.`,
        confirmLabel: "Delete",
        tone: "danger",
      })
    ) {
      run(q.id, () => deleteQuestion(q.id));
    }
  };

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold">Assessment questions</p>
          <p className="text-sm text-ink/50">All active questions are asked; affiliates need 60% to pass.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="plus" size={16} /> Add question
        </button>
      </div>

      {msg && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-5 space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-ink/10 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/8 text-xs font-bold text-ink/60">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-bold">{q.text}</p>
                  {!q.isActive && <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-bold text-ink/50">Inactive</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <span
                      key={o}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        o === q.correctOption ? "bg-green-100 text-green-700" : "bg-ink/6 text-ink/55"
                      }`}
                    >
                      {o === q.correctOption && <Icon name="check" size={12} className="mr-1 inline text-green-600" />}
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    run(
                      q.id,
                      () => updateQuestion(q.id, { isActive: !q.isActive }),
                      `Question ${q.isActive ? "deactivated" : "activated"}.`,
                    )
                  }
                  disabled={pendingId === q.id}
                  role="switch"
                  aria-checked={q.isActive}
                  aria-label={`${q.isActive ? "Deactivate" : "Activate"} question`}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${q.isActive ? "bg-brand" : "bg-ink/20"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${q.isActive ? "left-0.5 translate-x-5" : "left-0.5"}`} />
                </button>
                <button onClick={() => setEditing(q)} className="text-ink/40 transition-colors hover:text-brand" aria-label="Edit question">
                  <Icon name="settings" size={18} />
                </button>
                <button
                  onClick={() => remove(q)}
                  disabled={pendingId === q.id}
                  className="text-ink/35 transition-colors hover:text-red-500 disabled:opacity-50"
                  aria-label="Delete question"
                >
                  <Icon name="ban" size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45">No questions yet. Add some to build the assessment.</p>
        )}
      </div>

      {(adding || editing) && (
        <QuestionModal question={editing} onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </div>
  );
}

function QuestionModal({ question, onClose }: { question: AssessmentQuestion | null; onClose: () => void }) {
  const [text, setText] = useState(question?.text ?? "");
  const [options, setOptions] = useState<string[]>(question?.options ?? ["", ""]);
  const [correct, setCorrect] = useState<number>(
    question ? Math.max(0, question.options.indexOf(question.correctOption)) : 0,
  );
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [isActive, setIsActive] = useState(question?.isActive ?? true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const setOption = (i: number, v: string) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (i: number) =>
    setOptions((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      setCorrect((c) => (i === c ? 0 : i < c ? c - 1 : c));
      return next;
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = options.map((o) => o.trim());
    const nonEmpty = cleaned.filter(Boolean);
    if (nonEmpty.length < 2) {
      setError("Add at least two answer choices.");
      return;
    }
    if (!cleaned[correct]?.trim()) {
      setError("Pick which option is the correct answer.");
      return;
    }
    const correctOption = cleaned[correct].trim();
    startTransition(async () => {
      const payload = {
        text: text.trim(),
        options: nonEmpty,
        correctOption,
        explanation: explanation.trim() || undefined,
        isActive,
      };
      const res = question
        ? await updateQuestion(question.id, payload)
        : await createQuestion(payload);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <ModalShell title={question ? "Edit question" : "Add question"} onClose={onClose}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className={label}>Question</label>
          <textarea className={`${input} min-h-20 resize-y`} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. How much do you earn per book sale?" required />
        </div>
        <div>
          <label className={label}>Answer choices <span className="font-normal text-ink/40">(select the correct one)</span></label>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  aria-label={`Mark option ${i + 1} correct`}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${correct === i ? "border-green-500 bg-green-500 text-white" : "border-ink/25 text-transparent"}`}
                >
                  <Icon name="check" size={13} />
                </button>
                <input className={`${input} flex-1`} value={o} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className="text-ink/35 hover:text-red-500" aria-label={`Remove option ${i + 1}`}>
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addOption} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:opacity-80">
            <Icon name="plus" size={14} /> Add option
          </button>
        </div>
        <div>
          <label className={label}>Explanation <span className="font-normal text-ink/40">(optional)</span></label>
          <input className={input} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Shown after answering." />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer sr-only" />
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isActive ? "bg-brand" : "bg-ink/20"} after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform ${isActive ? "after:translate-x-5" : ""}`} />
          Active (included in the quiz)
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ink/15 py-3 text-sm font-bold text-ink/70 hover:bg-ink/5">Cancel</button>
          <button type="submit" disabled={pending || !text.trim()} className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {pending ? "Saving…" : question ? "Save changes" : "Add question"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Shared modal shell ──────────────────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{title}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
