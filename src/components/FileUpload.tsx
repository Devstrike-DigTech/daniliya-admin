"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";

export type UploadedFile = { url: string; name: string };

/**
 * Upload one or more files through /api/upload and surface the stored URLs.
 *
 * The API is the authority on what is allowed — size, type, magic-byte check —
 * so this stays thin: it posts, shows progress, and renders whatever error the
 * server returns rather than second-guessing it. When storage keys aren't set
 * the API replies 503 and that message is shown, so the control degrades
 * honestly instead of pretending to work.
 */
export default function FileUpload({
  purpose,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  multiple = false,
  value,
  onChange,
  hint,
}: {
  purpose: "kyc" | "product" | "booking" | "campaign";
  accept?: string;
  multiple?: boolean;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = () => inputRef.current?.click();

  const onFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setBusy(true);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`/api/upload?purpose=${purpose}`, { method: "POST", body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error ?? "That file could not be uploaded.");
          break; // stop on the first failure rather than half-uploading a set
        }
        uploaded.push({ url: data.url, name: file.name });
      }
      if (uploaded.length) onChange(multiple ? [...value, ...uploaded] : uploaded);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => onChange(value.filter((f) => f.url !== url));

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={pick}
        disabled={busy}
        className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-ink/20 bg-white px-6 py-8 text-center transition-colors hover:border-brand disabled:opacity-60"
      >
        <Icon name={busy ? "clock" : "upload"} size={22} className="text-ink/50" />
        <span className="text-sm font-bold">{busy ? "Uploading…" : "Choose a file"}</span>
        {hint && <span className="text-xs text-ink/50">{hint}</span>}
      </button>

      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>
      )}

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((f) => (
            <li
              key={f.url}
              className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm"
            >
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 font-bold text-ink hover:text-brand"
              >
                <Icon name="check" size={14} className="shrink-0 text-green-600" />
                <span className="truncate">{f.name}</span>
              </a>
              <button
                type="button"
                onClick={() => remove(f.url)}
                className="shrink-0 text-xs font-bold text-ink/45 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
