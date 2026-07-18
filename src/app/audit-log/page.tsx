import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/widgets";
import { apiFetchSafe } from "@/lib/api";

export const metadata: Metadata = { title: "Audit Log" };

type AuditEntry = { actor: string; action: string; target: string; at: string };
type AuditPage = { data: AuditEntry[]; meta: { page: number; limit: number; total: number } };

const stamp = (v: string) =>
  new Date(v).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AuditLogPage() {
  const res = await apiFetchSafe<AuditPage>("/admin/audit-log?limit=50");
  const entries = res?.data ?? [];

  return (
    <>
      <PageHead title="Audit log" subtitle="Immutable record of every administrative action" />

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              placeholder="Search actions, action or target"
              className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
            />
            <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Icon name="search" size={17} />
            </span>
          </div>
          <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 px-5 text-sm font-bold text-ink/70 transition-colors hover:bg-ink/5">
            <Icon name="filter" size={17} /> Filter
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Timestamp</th>
                <th className="px-4 py-3.5 font-bold">Actor</th>
                <th className="px-4 py-3.5 font-bold">Action</th>
                <th className="px-4 py-3.5 font-bold">Target</th>
                {/* The API does not return an IP on audit entries. */}
                <th className="px-4 py-3.5 font-bold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {entries.map((e, i) => (
                <tr key={`${e.at}-${i}`} className="hover:bg-ink/[0.02]">
                  <td className="py-4 pr-4 text-ink/70">{stamp(e.at)}</td>
                  <td className="px-4 py-4 font-bold">{e.actor}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-full bg-brand/12 px-3 py-1 text-xs font-bold text-brand">{e.action}</span>
                  </td>
                  <td className="px-4 py-4 text-ink/70">{e.target}</td>
                  <td className="px-4 py-4 font-mono text-xs text-ink/55">—</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-ink/45">
                    No audit entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
