"use client";

import { useMemo, useState, useTransition } from "react";
import Icon from "@/components/Icon";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  createResource,
  deleteResource,
  updateResource,
  type ActionResult,
  type AdminResource,
  type ResourceType,
} from "./actions";

const label = "mb-1.5 block text-sm font-bold";
const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const card = "rounded-2xl border border-ink/10 bg-white p-6";

type ProductOption = { id: string; title: string };

const TYPE_META: Record<ResourceType, { label: string; icon: string; verb: string }> = {
  CREATIVE: { label: "Brand creative", icon: "download", verb: "Download" },
  SCRIPT: { label: "Script", icon: "copy", verb: "Copy" },
  VIDEO: { label: "Training video", icon: "play", verb: "Play" },
};

const FILTERS = ["All", "CREATIVE", "SCRIPT", "VIDEO"] as const;

export default function ResourcesView({
  resources,
  products,
}: {
  resources: AdminResource[];
  products: ProductOption[];
}) {
  const confirm = useConfirm();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [editing, setEditing] = useState<AdminResource | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const counts = {
    CREATIVE: resources.filter((r) => r.type === "CREATIVE").length,
    SCRIPT: resources.filter((r) => r.type === "SCRIPT").length,
    VIDEO: resources.filter((r) => r.type === "VIDEO").length,
  };

  const rows = useMemo(
    () => (filter === "All" ? resources : resources.filter((r) => r.type === filter)),
    [resources, filter],
  );

  const run = async (id: string, fn: () => Promise<ActionResult>, okText?: string) => {
    setPendingId(id);
    setMsg(null);
    const res = await fn();
    setPendingId(null);
    if (!res.ok) setMsg({ ok: false, text: res.error });
    else if (okText) setMsg({ ok: true, text: okText });
  };

  const remove = async (r: AdminResource) => {
    if (
      await confirm({
        title: "Delete resource",
        message: `Delete "${r.title}"? Affiliates will no longer see it.`,
        confirmLabel: "Delete",
        tone: "danger",
      })
    ) {
      run(r.id, () => deleteResource(r.id));
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Marketing resources</h1>
          <p className="mt-1 text-sm text-ink/55">
            Creatives, ready-to-send scripts and training videos affiliates use to sell.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="plus" size={16} /> Add resource
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Brand creatives" value={counts.CREATIVE} accent="bg-brand" />
        <SummaryCard label="Scripts" value={counts.SCRIPT} accent="bg-[#6d3fa0]" />
        <SummaryCard label="Training videos" value={counts.VIDEO} accent="bg-green-500" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              filter === f ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"
            }`}
          >
            {f === "All" ? "All" : `${TYPE_META[f].label}s`}
          </button>
        ))}
      </div>

      {msg && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className={`${card} flex flex-wrap items-center gap-4 !p-4`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
              <Icon name={TYPE_META[r.type].icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="font-bold">{r.title}</p>
                <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-xs font-bold text-ink/55">
                  {TYPE_META[r.type].label}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                  {r.productTitle ?? "All products"}
                </span>
                {!r.isPublished && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">Draft</span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-ink/55">
                {r.type === "SCRIPT" ? r.body : r.type === "VIDEO" ? r.videoUrl : `${r.fileFormat ?? "File"}${r.fileMeta ? ` · ${r.fileMeta}` : ""}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                run(
                  r.id,
                  () => updateResource(r.id, { isPublished: !r.isPublished }),
                  `"${r.title}" is now ${r.isPublished ? "a draft" : "published"}.`,
                )
              }
              disabled={pendingId === r.id}
              role="switch"
              aria-checked={r.isPublished}
              aria-label={`${r.isPublished ? "Unpublish" : "Publish"} ${r.title}`}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${r.isPublished ? "bg-brand" : "bg-ink/20"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${r.isPublished ? "left-0.5 translate-x-5" : "left-0.5"}`} />
            </button>
            <button onClick={() => setEditing(r)} className="text-ink/40 transition-colors hover:text-brand" aria-label={`Edit ${r.title}`}>
              <Icon name="settings" size={18} />
            </button>
            <button
              onClick={() => remove(r)}
              disabled={pendingId === r.id}
              className="text-ink/35 transition-colors hover:text-red-500 disabled:opacity-50"
              aria-label={`Delete ${r.title}`}
            >
              <Icon name="ban" size={18} />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <div className={`${card} py-12 text-center text-sm text-ink/45`}>
            No resources yet. Add the first one so affiliates have something to share.
          </div>
        )}
      </div>

      {(adding || editing) && (
        <ResourceModal
          resource={editing}
          products={products}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function SummaryCard({ label: l, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-6">
        <p className="text-sm text-ink/55">{l}</p>
        <p className="mt-2 text-[28px] font-bold leading-none">{value}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}

function ResourceModal({
  resource,
  products,
  onClose,
}: {
  resource: AdminResource | null;
  products: ProductOption[];
  onClose: () => void;
}) {
  const [type, setType] = useState<ResourceType>(resource?.type ?? "CREATIVE");
  const [title, setTitle] = useState(resource?.title ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [productId, setProductId] = useState<string>(resource?.productId ?? "");
  const [isPublished, setIsPublished] = useState(resource?.isPublished ?? true);
  // CREATIVE
  const [file, setFile] = useState<UploadedFile[]>(
    resource?.fileUrl ? [{ url: resource.fileUrl, name: resource.title }] : [],
  );
  const [fileFormat, setFileFormat] = useState(resource?.fileFormat ?? "");
  const [fileMeta, setFileMeta] = useState(resource?.fileMeta ?? "");
  // SCRIPT
  const [body, setBody] = useState(resource?.body ?? "");
  // VIDEO
  const [videoUrl, setVideoUrl] = useState(resource?.videoUrl ?? "");
  const [duration, setDuration] = useState(resource?.duration ?? "");

  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (type === "CREATIVE" && !file[0]?.url) {
      setError("Upload the creative file (image or PDF).");
      return;
    }
    if (type === "SCRIPT" && !body.trim()) {
      setError("Add the script copy.");
      return;
    }
    if (type === "VIDEO" && !videoUrl.trim()) {
      setError("Add the video link.");
      return;
    }

    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      productId: productId || null,
      fileUrl: type === "CREATIVE" ? file[0]?.url : undefined,
      fileFormat: type === "CREATIVE" ? fileFormat.trim() || undefined : undefined,
      fileMeta: type === "CREATIVE" ? fileMeta.trim() || undefined : undefined,
      body: type === "SCRIPT" ? body.trim() : undefined,
      videoUrl: type === "VIDEO" ? videoUrl.trim() : undefined,
      duration: type === "VIDEO" ? duration.trim() || undefined : undefined,
      isPublished,
    };

    startTransition(async () => {
      const res = resource
        ? await updateResource(resource.id, payload)
        : await createResource(payload);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{resource ? "Edit resource" : "Add resource"}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          {/* Type is chosen on create and fixed after — it decides the payload. */}
          {!resource && (
            <div>
              <label className={label}>Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPE_META) as ResourceType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-bold transition-colors ${
                      type === t ? "border-brand bg-brand/8 text-brand" : "border-ink/12 text-ink/55 hover:border-ink/25"
                    }`}
                  >
                    <Icon name={TYPE_META[t].icon} size={18} />
                    {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={label}>Title</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. WhatsApp status banner" required />
          </div>

          <div>
            <label className={label}>
              Applies to <span className="font-normal text-ink/40">(scope)</span>
            </label>
            <select className={input} value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">All products (global)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {type === "CREATIVE" && (
            <>
              <div>
                <label className={label}>Creative file</label>
                <FileUpload
                  purpose="resource"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  value={file}
                  onChange={setFile}
                  hint="PNG, JPG, WEBP or PDF · up to 10MB"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Format <span className="font-normal text-ink/40">(optional)</span></label>
                  <input className={input} value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} placeholder="PNG" />
                </div>
                <div>
                  <label className={label}>Detail <span className="font-normal text-ink/40">(optional)</span></label>
                  <input className={input} value={fileMeta} onChange={(e) => setFileMeta(e.target.value)} placeholder="1080×1920" />
                </div>
              </div>
            </>
          )}

          {type === "SCRIPT" && (
            <div>
              <label className={label}>Script copy</label>
              <textarea className={`${input} min-h-32 resize-y`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="The message the affiliate can copy and send." />
            </div>
          )}

          {type === "VIDEO" && (
            <>
              <div>
                <label className={label}>Video link</label>
                <input className={input} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" />
              </div>
              <div>
                <label className={label}>Duration <span className="font-normal text-ink/40">(optional)</span></label>
                <input className={input} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6:42" />
              </div>
            </>
          )}

          <div>
            <label className={label}>Description <span className="font-normal text-ink/40">(optional)</span></label>
            <input className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line shown under the title." />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="peer sr-only" />
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPublished ? "bg-brand" : "bg-ink/20"} after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform ${isPublished ? "after:translate-x-5" : ""}`} />
            Published (visible to affiliates)
          </label>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ink/15 py-3 text-sm font-bold text-ink/70 hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending || !title.trim()} className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
              {pending ? "Saving…" : resource ? "Save changes" : "Add resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
