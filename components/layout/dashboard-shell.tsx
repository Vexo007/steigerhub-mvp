import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  caption?: string;
};

export function DashboardShell({
  roleLabel,
  brand,
  title,
  subtitle,
  navItems,
  actions,
  children
}: {
  roleLabel: string;
  brand: string;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-line bg-forest px-4 py-4 text-white lg:min-h-screen lg:w-[280px] lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">{roleLabel}</p>
              <h1 className="mt-2 text-2xl font-semibold">{brand}</h1>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/85 lg:hidden"
            >
              Home
            </Link>
          </div>

          <div className="mt-5 hidden rounded-[24px] bg-white/6 p-4 text-sm text-white/70 lg:block">
            Duidelijke software voor agency, bedrijf en werkvloer. Rustig, snel en mobielvriendelijk.
          </div>

          <nav className="mt-5 grid gap-2 lg:mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={`rounded-[18px] px-4 py-3 transition ${
                  item.active ? "bg-white text-forest shadow-soft" : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                {item.caption ? (
                  <div className={`mt-1 text-xs ${item.active ? "text-forest/65" : "text-white/48"}`}>{item.caption}</div>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="mt-8 hidden lg:block">{actions}</div>
        </aside>

        <div className="flex-1 px-4 py-4 lg:px-8 lg:py-6">
          <header className="rounded-[26px] border border-line bg-panel px-5 py-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/45">{roleLabel}</p>
                <h2 className="mt-2 text-3xl font-semibold text-forest lg:text-4xl">{title}</h2>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm text-ink/60">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3 lg:hidden">{actions}</div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
