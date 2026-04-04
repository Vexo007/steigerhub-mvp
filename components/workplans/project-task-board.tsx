"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectTaskCard } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ProjectTaskBoard({
  project,
  tasks,
  primaryCtaHref,
  primaryCtaLabel = "Open werkplan generator"
}: {
  project: Project;
  tasks: ProjectTaskCard[];
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
}) {
  const generatorTask = tasks.find((task) => task.variant === "generator");
  const otherTasks = tasks.filter((task) => task.variant !== "generator");

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-line bg-panel p-6 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Project</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest">{project.clientName}</h1>
          <p className="mt-2 text-sm text-ink/60">
            {project.siteAddress}, {project.siteCity}
          </p>
          <p className="mt-3 text-sm text-ink/60">
            Open dit project en werk per taakblok in plaats van door één lange lijst formulieren te scrollen.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-line bg-mist/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Start</p>
              <p className="mt-2 text-sm font-semibold text-forest">{formatDate(project.startDate)}</p>
            </div>
            <div className="rounded-[20px] border border-line bg-mist/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Status</p>
              <p className="mt-2 text-sm font-semibold capitalize text-forest">{project.status}</p>
            </div>
            <div className="rounded-[20px] border border-line bg-mist/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Veiligheid</p>
              <div className="mt-2">
                <Badge tone={project.safetyStatus}>{project.safetyStatus}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-line bg-mist/60 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Werknotitie</p>
            <p className="mt-2 text-sm text-ink/70">
              {project.materialSummary || "Nog geen materiaal-, montage- of werknotitie toegevoegd."}
            </p>
          </div>
        </article>

        <article className="rounded-[28px] border border-line bg-forest p-6 text-white shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Snelle actie</p>
          <h2 className="mt-2 text-2xl font-semibold">{generatorTask?.label ?? "Werkplan generator"}</h2>
          <p className="mt-3 text-sm text-white/72">
            Start vanuit dit project direct met een werkplan, zoals een Algemeen VGM plan, en werk daarna sectie voor sectie verder.
          </p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[20px] bg-white/8 p-4 text-sm text-white/80">
              {generatorTask?.description ?? "Maak projectgebonden plannen aan voor voorbereiding, risico's en bijlagen."}
            </div>
            <Link
              href={(primaryCtaHref ?? generatorTask?.href ?? "#") as Route}
              className="inline-flex justify-center rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {otherTasks.map((task) => (
          <article key={task.key} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Taak</p>
            <h2 className="mt-2 text-xl font-semibold text-forest">{task.label}</h2>
            <p className="mt-3 text-sm text-ink/65">{task.description}</p>
            <div className="mt-5">
              <Link href={task.href as Route} className="inline-flex rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                Open taak
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
