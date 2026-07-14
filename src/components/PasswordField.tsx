"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

/** Password input with an animated show/hide toggle. */
export default function PasswordField({
  placeholder = "Password",
  value,
  onChange,
  required,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
        className="group absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink active:scale-90"
      >
        {/* two icons crossfade/scale for an animated swap */}
        <span className="relative block h-[18px] w-[18px]">
          <span
            className={`absolute inset-0 transition-all duration-300 ${
              show ? "scale-50 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <Icon name="eye" size={18} />
          </span>
          <span
            className={`absolute inset-0 transition-all duration-300 ${
              show ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <Icon name="eye-off" size={18} />
          </span>
        </span>
      </button>
    </div>
  );
}
