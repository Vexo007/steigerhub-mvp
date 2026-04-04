"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmployeeCreateForm } from "@/components/forms/employee-create-form";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import type { TenantAdminData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function TenantAdminOverview({ data }: { data: TenantAdminData }) {
  if (!data.tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-forest">Geen tenant gevonden</h2>
      </Panel>
    );
  }

  const tenant = data.tenant;

  const [projectQuery, setProjectQuery] = useState("");
  const filteredProjects = useMemo(() => {
    const normalized = projectQuery.trim().toLowerCase();
    if (!normalized) {
      return data.projects;
    }

    return data.projects.filter((project) =>
      [project.clientName, project.siteAddress, project.siteCity].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [data.projects, projectQuery]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <Panel className="bg-forest text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Bedrijfsadmin</p>
          <h2 className="mt-2 text-2xl font-semibold">{data.tenant.name}</h2>
          <p className="mt-2 text-sm text-white/72">
            Beheer hier medewerkers, projectdossiers, bedrijfsinstellingen en zicht op alle ingevulde formulieren voor dit steigerbouwbedrijf.
          </p>
        </Panel>
        <StatCard label="Medewerkers" value={data.employees.length} detail="Managers en werknemers" />
        <StatCard label="Inzendingen" value={data.recentSubmissions.length} detail="Recente formulieren" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projectbeheer</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Project aanmaken</h3>
          <p className="mt-2 text-sm text-ink/60">
            De bedrijfsadmin maakt projecten aan. Daarna vullen werknemers en managers de formulieren binnen dat project in.
          </p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={tenant.id} />
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Company settings</p>
              <h3 className="mt-2 text-2xl font-semibold text-forest">Bedrijfsprofiel en white-label</h3>
            </div>
            <Link href="/admin/settings/company" className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
              Open settings
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Kleuren en logo</p>
              <p className="mt-2 text-sm text-ink/60">Beheer hier de uitstraling van het bedrijfsaccount en de werkapp.</p>
            </div>
            <div className="rounded-[22px] border border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Bedrijfsdocumenten</p>
              <p className="mt-2 text-sm text-ink/60">Centrale plek voor RI&E, contracten, certificaten en andere documenten.</p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Gebruikers</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Werknemers beheren</h3>
          <p className="mt-2 text-sm text-ink/60">De werkgever maakt hier werknemers en managers aan voor zijn eigen bedrijf.</p>
          <div className="mt-5">
            <EmployeeCreateForm />
          </div>
          <div className="mt-6 grid gap-3">
            {data.employees.map((employee) => (
              <div key={employee.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest">{employee.fullName}</p>
                    <p className="text-sm text-ink/60">{employee.email}</p>
                  </div>
                  <Badge tone={employee.role === "tenant_admin" ? "active" : "trialing"}>
                    {employee.role === "tenant_admin" ? "manager" : "werknemer"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projecten</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Alle klantprojecten</h3>
          <div className="mt-4 max-w-md">
            <label className="grid gap-2 text-sm text-ink/70">
              Zoek project
              <input
                value={projectQuery}
                onChange={(event) => setProjectQuery(event.target.value)}
                placeholder="Zoek op bedrijfsnaam, adres of plaats"
                className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none"
              />
            </label>
          </div>
          <div className="mt-5 grid gap-3">
            {filteredProjects.length === 0 ? (
              <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Geen projecten gevonden.
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{project.clientName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {project.siteAddress}, {project.siteCity}
                      </p>
                    </div>
                    <Badge tone={project.safetyStatus}>{project.safetyStatus}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">Start: {formatDate(project.startDate)} · Status: {project.status}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/workspace/project/${project.id}`}
                      className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
                    >
                      Open project
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <Panel>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Controle</p>
        <h3 className="mt-2 text-2xl font-semibold text-forest">Wie heeft welk formulier gedaan?</h3>
        <div className="mt-5 grid gap-3">
          {data.recentSubmissions.length === 0 ? (
            <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
              Nog geen formulierinzendingen gevonden.
            </div>
          ) : (
            data.recentSubmissions.map((submission) => (
              <div key={submission.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest">{submission.formName}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      Werknemer: {submission.actorName ?? "Onbekend"} · Project: {submission.projectName ?? "Los formulier"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-ink/60">
                    <p>{formatDate(submission.createdAt)}</p>
                    <p className="capitalize">{submission.status}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
