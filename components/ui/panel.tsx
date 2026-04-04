import type { ReactNode } from "react";

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] border border-white/60 bg-white p-6 shadow-panel ${className}`}>
      {children}
    </div>
  );
}
