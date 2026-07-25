"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
/** Local Y/M/D → "YYYY-MM-DD" without the timezone shift `toISOString` causes. */
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function prettyLabel(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/**
 * Branded calendar field. Renders a styled trigger + popover calendar in the
 * "YYYY-MM-DD" format a native <input type="date"> uses.
 *
 * Two modes:
 *  - Uncontrolled / FormData: pass `name` and it keeps a hidden input in sync,
 *    so it drops straight into any form that reads FormData.
 *  - Controlled: pass `value` + `onChange`, for React-state driven forms.
 */
export default function DatePicker({
  name,
  id,
  className = "",
  min,
  disablePast = false,
  placeholder = "Select a date",
  value: controlledValue,
  defaultValue,
  onChange,
}: {
  name?: string;
  id?: string;
  className?: string;
  /** Earliest selectable day as "YYYY-MM-DD". */
  min?: string;
  /** Convenience: disable every day before today. */
  disablePast?: boolean;
  placeholder?: string;
  value?: string;
  /** Initial value for uncontrolled (FormData) use. */
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const now = new Date();
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const minIso = min ?? (disablePast ? todayIso : undefined);

  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlledValue ?? internal;
  const setValue = (v: string) => (onChange ? onChange(v) : setInternal(v));

  const [open, setOpen] = useState(false);
  const initial = value ? value.split("-").map(Number) : null;
  const [view, setView] = useState({
    y: initial ? initial[0] : now.getFullYear(),
    m: initial ? initial[1] - 1 : now.getMonth(),
  });
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // When opening, jump the view to the selected month (if any).
  const openPicker = () => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setView({ y, m: m - 1 });
    }
    setOpen((o) => !o);
  };

  const grid = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay(); // 0=Sun
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const pick = (d: number) => {
    setValue(iso(view.y, view.m, d));
    setOpen(false);
  };
  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        id={id}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2 text-left ${className} ${value ? "text-ink" : "text-ink/35"}`}
      >
        <span>{value ? prettyLabel(value) : placeholder}</span>
        <Icon name="calendar" size={18} className="shrink-0 text-ink/45" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-ink/10 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-ink/5"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <p className="text-sm font-bold">
              {MONTHS[view.m]} {view.y}
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-ink/5"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-ink/40">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">{w}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (d === null) return <span key={i} />;
              const cell = iso(view.y, view.m, d);
              const selected = cell === value;
              const isToday = cell === todayIso;
              const disabled = minIso ? cell < minIso : false;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  aria-pressed={selected}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm transition-colors
                    ${selected ? "bg-brand font-bold text-white" : "hover:bg-brand/10"}
                    ${!selected && isToday ? "font-bold text-brand ring-1 ring-brand/40" : ""}
                    ${disabled ? "cursor-not-allowed text-ink/20 hover:bg-transparent" : "text-ink/80"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="text-xs font-bold text-ink/45 transition-colors hover:text-ink"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setView({ y: now.getFullYear(), m: now.getMonth() });
                setValue(todayIso);
                setOpen(false);
              }}
              className="text-xs font-bold text-brand hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
