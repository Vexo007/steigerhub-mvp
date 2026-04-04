import type { ReactNode } from "react";

const toneClassName = {
  active: "bg-emerald-100 text-emerald-800",
  trialing: "bg-sky-100 text-sky-800",
  past_due: "bg-amber-100 text-amber-800",
  paused: "bg-stone-200 text-stone-700",
  blocked: "bg-rose-100 text-rose-800",
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  missing: "bg-rose-100 text-rose-800",
  paid: "bg-emerald-100 text-emerald-800"
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneClassName[tone]}`}
    >
      {children}
    </span>
  );
}
