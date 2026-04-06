"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import type { ModuleBundle, Project, ProjectTask, ReminderItem, Tenant } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type WorkerAction = {
  key: string;
  label: string;
  caption: string;
  href: Route;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function moduleMatches(moduleBundles: ModuleBundle[], patterns: string[]) {
  return moduleBundles.some((bundle) => {
    const searchable = [
      normalize(bundle.module.name),
      normalize(bundle.module.slug),
      ...bundle.forms.flatMap(({ form }) => [normalize(form.name), normalize(form.description)])
    ];

    return patterns.some((pattern) => searchable.some((value) => value.includes(pattern)));
  });
}

function createWorkerActions(project: Project, tenantId: string, moduleBundles: ModuleBundle[]): WorkerAction[] {
  const actions: WorkerAction[] = [
    {
      key: "project",
      label: "Project taken",
      caption: "Open alle taken binnen dit project",
      href: `/workspace/project/${project.id}` as Route
    }
  ];

  if (moduleMatches(moduleBundles, ["werkplan"])) {
    actions.push({
      key: "workplan",
      label: "Werkplan",
      caption: "Maak of open een algemeen VGM plan",
      href: `/workspace/project/${project.id}/workplans` as Route
    });
  }

  if (moduleMatches(moduleBundles, ["keuring", "inspectie"])) {
    actions.push({
      key: "inspection",
      label: "Keuring",
      caption: "Voer een inspectie of keuring uit",
      href: `/workspace?tenantId=${tenantId}&projectId=${project.id}#formulieren` as Route
    });
  }

  if (moduleMatches(moduleBundles, ["tekening", "blueprint"])) {
    actions.push({
      key: "drawing",
      label: "Tekening",
      caption: "Bekijk de projectinformatie en tekeningen",
      href: `/workspace/project/${project.id}` as Route
    });
  }

  if (moduleMatches(moduleBundles, ["oplever"])) {
    actions.push({
      key: "handover",
      label: "Oplevering",
      caption: "Vul de oplevering van dit project in",
      href: `/workspace?tenantId=${tenantId}&projectId=${project.id}#formulieren` as Route
    });
  }

  actions.push({
    key: "forms",
    label: "Formulieren",
    caption: "Open alle formulieren voor dit project",
    href: `/workspace?tenantId=${tenantId}&projectId=${project.id}#formulieren` as Route
  });

  return actions;
}

export function WorkerProjectDashboard({
  tenant,
  projects,
  moduleBundles,
  projectTasks,
  reminders,
  selectedProjectId
}: {
  tenant: Tenant;
  projects: Project[];
  moduleBundles: ModuleBundle[];
  projectTasks: ProjectTask[];
  reminders: ReminderItem[];
  selectedProjectId?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(selectedProjectId ?? projects[0]?.id ?? null);

  const filteredProjects = projects.filter((project) => {
    const haystack = `${project.clientName} ${project.siteAddress} ${project.siteCity}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const activeProject = filteredProjects.find((project) => project.id === activeProjectId) ?? filteredProjects[0] ?? null;
  const actions = activeProject ? createWorkerActions(activeProject, tenant.id, moduleBundles) : [];
  const todaysTasks = projectTasks.filter((task) => task.status !== "done").slice(0, 4);
  const upcomingReminders = reminders.filter((reminder) => reminder.status !== "completed").slice(0, 3);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel className="h-fit p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projecten dashboard</p>
        <h3 className="mt-2 text-2xl font-semibold text-forest">Mijn klanten</h3>
        <p className="mt-2 text-sm text-ink/60">Zoek op klantnaam, adres of plaats en open daarna direct de juiste taak.</p>

        <label className="mt-5 grid gap-2 text-sm text-ink/70">
          Zoeken
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op klant of project"
            className="rounded-[20px] border border-line bg-mist px-4 py-3 outline-none transition focus:border-lime"
          />
        </label>

        <div className="mt-5 grid gap-3">
          {filteredProjects.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-line bg-mist px-4 py-4 text-sm text-ink/60">
              Geen projecten gevonden voor je zoekterm.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isActive = activeProject?.id === project.id;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProjectId(project.id)}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    isActive ? "border-lime bg-lime/10 shadow-soft" : "border-line bg-white hover:border-lime/45 hover:bg-mist/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{project.clientName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {project.siteAddress}, {project.siteCity}
                      </p>
                    </div>
                    <span className="rounded-full border border-line px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
                      {project.status}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Panel>

      <div className="grid gap-6">
        <Panel className="bg-forest p-5 text-white sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Geselecteerd project</p>
          {activeProject ? (
            <>
              <h3 className="mt-2 text-3xl font-semibold">{activeProject.clientName}</h3>
              <p className="mt-2 text-sm text-white/72">
                {activeProject.siteAddress}, {activeProject.siteCity}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white/8 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Contact</p>
                  <p className="mt-2 text-sm font-semibold">{tenant.contactName}</p>
                  <p className="mt-1 text-sm text-white/72">{tenant.contactEmail}</p>
                </div>
                <div className="rounded-[20px] bg-white/8 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Planning</p>
                  <p className="mt-2 text-sm font-semibold">Start {formatDate(activeProject.startDate)}</p>
                  <p className="mt-1 text-sm text-white/72">Veiligheid: {activeProject.safetyStatus}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-[20px] bg-white/8 p-4 text-sm text-white/72">Kies links eerst een project.</div>
          )}
        </Panel>

        <Panel className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Vandaag</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Mijn taken vandaag</h3>
          <div className="mt-5 grid gap-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                <p className="font-semibold text-forest">{task.title}</p>
                <p className="mt-1 text-sm text-ink/60">{task.taskType} · prioriteit {task.priority}</p>
              </div>
            ))}
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="rounded-[20px] border border-line bg-panel px-4 py-4">
                <p className="font-semibold text-forest">{reminder.title}</p>
                <p className="mt-1 text-sm text-ink/60">{reminder.kind} · {formatDate(reminder.dueAt)}</p>
              </div>
            ))}
            {todaysTasks.length === 0 && upcomingReminders.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist px-4 py-4 text-sm text-ink/60">
                Geen directe taken ingepland. Kies hieronder een project om aan te werken.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Taken</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Kies wat je wilt doen</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className="rounded-[22px] border border-line bg-mist/70 p-5 transition hover:border-lime hover:bg-lime/8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-forest text-xs font-bold uppercase tracking-[0.18em] text-white">
                    {action.label.slice(0, 2)}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">
                    Open
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-forest">{action.label}</p>
                <p className="mt-2 text-sm text-ink/60">{action.caption}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
