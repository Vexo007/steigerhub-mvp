import type { HTMLAttributes, ReactNode } from "react";

export function Panel({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[24px] border border-line/80 bg-panel p-6 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
