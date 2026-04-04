"use client";

import Link from "next/link";
import type { Project, ProjectTaskCard } from "@/lib/types";

export function ProjectTaskBoard({
  project,
  tasks
}: {
  project: Project;
  tasks: ProjectTaskCard[];
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-line bg-panel p-6 shadow-soft">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Project</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest">{project.clientName}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {project.siteAddress}, {project.siteCity}
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Open dit project en werk per taakblok in plaats van door één lange lijst formulieren te scrollen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article key={task.key} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">
              {task.variant === "generator" ? "Generator" : "Taak"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-forest">{task.label}</h2>
            <p className="mt-3 text-sm text-ink/65">{task.description}</p>
            <div className="mt-5">
              <Link href={task.href} className="inline-flex rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                Open taak
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
