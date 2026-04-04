import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-[22px] border border-line bg-panel px-5 py-5 shadow-soft">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-forest">{value}</p>
      {detail ? <p className="mt-2 text-sm text-ink/55">{detail}</p> : null}
    </div>
  );
}
