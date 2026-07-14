"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live HH:MM:SS countdown. Seeds from `seconds` so SSR/first paint matches,
 * then ticks down every second once mounted. */
export default function Countdown({
  seconds = 11 * 3600 + 59 * 60 + 50,
  className = "",
}: {
  seconds?: number;
  className?: string;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const target = Date.now() + seconds * 1000;
    const tick = () => setRemaining(Math.max(0, Math.round((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return (
    <span className={className} suppressHydrationWarning>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
