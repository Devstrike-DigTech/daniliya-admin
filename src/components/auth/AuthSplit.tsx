import Image from "next/image";

/** Two-pane auth layout: branded cream/gold panel + form column. Admin-only. */
export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col overflow-hidden bg-[#fdf6e3] lg:flex">
        <div className="flex h-32 items-center bg-brand px-10">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <Image src="/images/brand/emblem.png" alt="Daniliya" width={44} height={44} className="h-11 w-11 object-contain" />
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-10 py-12">
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Run the entire <span className="text-brand">Daniliya</span> platform from one place.
          </h2>
          <p className="mt-6 max-w-md text-ink/55">
            Approve vendors, release Monday payouts, moderate the marketplace, launch campaigns, and
            audit everything — all from a single command centre.
          </p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 opacity-60 [background-image:radial-gradient(var(--color-brand)_1.6px,transparent_1.6px)] [background-size:16px_16px]"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 right-4 h-56 w-56 rounded-full bg-gradient-to-br from-ink/20 to-brand/30 blur-xl" />
      </div>

      {/* Form column */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">{children}</div>
    </div>
  );
}
