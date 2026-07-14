import Icon from "@/components/Icon";

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  // green — settled / live / good
  active: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  verified: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  confirmed: "bg-green-100 text-green-700",
  // amber — in progress / needs attention
  pending: "bg-amber-100 text-amber-700",
  "under review": "bg-amber-100 text-amber-700",
  review: "bg-amber-100 text-amber-700",
  queued: "bg-amber-100 text-amber-700",
  invited: "bg-amber-100 text-amber-700",
  packed: "bg-blue-100 text-blue-700",
  shipped: "bg-blue-100 text-blue-700",
  new: "bg-blue-100 text-blue-700",
  scheduled: "bg-blue-100 text-blue-700",
  // red — bad
  suspended: "bg-red-100 text-red-700",
  denied: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status.toLowerCase()] ?? "bg-ink/10 text-ink/60";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {status}
    </span>
  );
}

/** Reusable card-wrapped table with sticky-styled header. */
export function DataTable({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-5 py-3.5 font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
}

/** Unified stat tile used across Command centre, list summaries and detail metrics.
 * Optional top accent bar, icon tile, trend delta, and sub-line. */
export function StatTile({
  label,
  value,
  icon,
  accent = "bg-brand",
  soft = "bg-brand/15 text-brand",
  delta,
  up,
  sub,
  accentBottom,
}: {
  label: string;
  value: string;
  icon?: string;
  accent?: string;
  soft?: string;
  delta?: string;
  up?: boolean;
  sub?: string;
  accentBottom?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {!accentBottom && <div className={`h-1 w-full ${accent}`} />}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-ink/55">{label}</p>
          {icon && (
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${soft}`}>
              <Icon name={icon} size={18} />
            </span>
          )}
        </div>
        <p className="mt-3 text-[26px] font-bold leading-none">{value}</p>
        {delta && (
          <p className="mt-3 flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center gap-0.5 font-bold ${up ? "text-green-600" : "text-red-500"}`}>
              <Icon name={up ? "trending-up" : "trending-down"} size={13} />
              {delta}
            </span>
            <span className="text-ink/45">vs last week</span>
          </p>
        )}
        {sub && <p className="mt-2 text-xs text-ink/50">{sub}</p>}
      </div>
      {accentBottom && <div className={`h-1.5 w-full ${accent}`} />}
    </div>
  );
}
