import type { ReactNode } from "react";

const toneClassName = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  trialing: "bg-lime/10 text-lime ring-1 ring-lime/15",
  past_due: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  paused: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  blocked: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  missing: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
} as const;

export function Badge({
  children,
  tone
}: {
  children: ReactNode;
  tone: keyof typeof toneClassName;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${toneClassName[tone]}`}
    >
      {children}
    </span>
  );
}
