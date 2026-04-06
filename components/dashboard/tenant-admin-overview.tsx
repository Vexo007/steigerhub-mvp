"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { CustomerCreateForm } from "@/components/forms/customer-create-form";
import { EmployeeCreateForm } from "@/components/forms/employee-create-form";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { ProjectTaskCreateForm } from "@/components/forms/project-task-create-form";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import type { TenantAdminData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function withTenant(href: string, tenantId?: string) {
  if (!tenantId) {
    return href;
  }

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}tenantId=${tenantId}`;
}

export function TenantAdminOverview({ data, tenantId }: { data: TenantAdminData; tenantId?: string }) {
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

  const topCustomers =
    data.customers.length > 0
      ? data.customers.slice(0, 4).map((customer) => ({
          id: customer.id,
          name: customer.name,
          contact: data.contacts.find((contact) => contact.customerId === customer.id && contact.isPrimary),
          addressCount: data.addresses.filter((address) => address.customerId === customer.id).length,
          projectCount: data.projects.filter((project) => project.customerId === customer.id || project.clientName === customer.name).length
        }))
      : Array.from(new Set(data.projects.map((project) => project.clientName))).slice(0, 4).map((customer) => ({
          id: customer,
          name: customer,
          contact: null,
          addressCount: data.projects.filter((project) => project.clientName === customer).length,
          projectCount: data.projects.filter((project) => project.clientName === customer).length
        }));

  const openTasks = data.projectTasks.filter((task) => task.status !== "done");
  const openIncidents = data.incidents.filter((incident) => incident.status !== "closed" && incident.status !== "resolved");
  const pendingReminders = data.reminders.filter((reminder) => reminder.status !== "completed");

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr]">
        <Panel className="bg-forest text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Bedrijfsadmin</p>
          <h2 className="mt-2 text-2xl font-semibold">{tenant.name}</h2>
          <p className="mt-2 text-sm text-white/72">
            Hier komt alles samen: klanten, adressen, projecten, medewerkers, documenten, meldingen en compliance.
          </p>
        </Panel>
        <StatCard label="Medewerkers" value={data.employees.length} detail="Managers en werknemers" />
        <StatCard label="Open taken" value={openTasks.length} detail="Nog uit te voeren acties" />
        <StatCard label="Open issues" value={openIncidents.length} detail="Incidenten en klachten" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href={withTenant("/admin/projects", tenantId) as Route} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Asset</p>
          <p className="mt-3 text-lg font-semibold text-forest">Projectboard</p>
          <p className="mt-2 text-sm text-ink/60">Projecten, planning, taken, reminders en dossierstatus in één scherm.</p>
        </Link>
        <Link href={withTenant("/workspace", tenantId) as Route} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Asset</p>
          <p className="mt-3 text-lg font-semibold text-forest">Werkapp preview</p>
          <p className="mt-2 text-sm text-ink/60">Zie hoe werknemers projecten kiezen, taken openen en formulieren invullen.</p>
        </Link>
        <Link href={withTenant("/admin/settings/rei", tenantId) as Route} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Asset</p>
          <p className="mt-3 text-lg font-semibold text-forest">Documenthub</p>
          <p className="mt-2 text-sm text-ink/60">RE&I, contracten, certificaten, keuringsdocumenten en veiligheidsbladen.</p>
        </Link>
        <Link href={withTenant("/admin/employees", tenantId) as Route} className="rounded-[24px] border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Asset</p>
          <p className="mt-3 text-lg font-semibold text-forest">Teambeheer</p>
          <p className="mt-2 text-sm text-ink/60">Werknemersbeheer, rollen, projecttaken en zicht op wie wat heeft ingevuld.</p>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuwe klant</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Klant, contact en adres</h3>
          <p className="mt-2 text-sm text-ink/60">Bouw je klantarchief goed op: bedrijf, contactpersoon, adres, notities en geschiedenis.</p>
          <div className="mt-5">
            <CustomerCreateForm tenantId={tenant.id} />
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projectbeheer</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Project en taak aanmaken</h3>
          <p className="mt-2 text-sm text-ink/60">Maak een dossier en plan direct de eerste taken voor keuring, oplevering of werkplan.</p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={tenant.id} />
          </div>
          <div className="mt-8 border-t border-line pt-6">
            <ProjectTaskCreateForm tenantId={tenant.id} projects={data.projects} employees={data.employees} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Team</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Medewerkers en rollen</h3>
          <p className="mt-2 text-sm text-ink/60">Managers en werknemers krijgen hun eigen rol, taken en toegang tot projecten.</p>
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
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Planning</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Projecten, taken en reminders</h3>
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
            {filteredProjects.map((project) => (
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
                <div className="mt-3 grid gap-2 text-sm text-ink/60 md:grid-cols-3">
                  <p>Start: {formatDate(project.startDate)}</p>
                  <p>{data.projectTasks.filter((task) => task.projectId === project.id && task.status !== "done").length} open taken</p>
                  <p>{data.projectDocuments.filter((document) => document.projectId === project.id).length} documenten</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/projects/${project.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                    Open project
                  </Link>
                  <Link href={`/admin/projects/${project.id}/workplans`} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                    Werkplannen
                  </Link>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 ? (
              <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">Geen projecten gevonden.</div>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3">
            {pendingReminders.slice(0, 4).map((reminder) => (
              <div key={reminder.id} className="rounded-[20px] border border-line bg-panel px-4 py-4">
                <p className="font-semibold text-forest">{reminder.title}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {reminder.kind} · deadline {formatDate(reminder.dueAt)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Klantarchief</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Belangrijkste klanten</h3>
          <div className="mt-5 grid gap-3">
            {topCustomers.map((customer) => (
              <div key={customer.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                <p className="font-semibold text-forest">{customer.name}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {customer.projectCount} project(en) · {customer.addressCount} adres(sen)
                </p>
                {customer.contact ? <p className="mt-2 text-sm text-ink/60">{customer.contact.fullName} · {customer.contact.email}</p> : null}
              </div>
            ))}
            {topCustomers.length === 0 ? (
              <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">Er zijn nog geen klanten zichtbaar.</div>
            ) : null}
          </div>
          <div className="mt-4">
            <Link href={withTenant("/admin/customers", tenantId) as Route} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Open klantenoverzicht
            </Link>
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Compliance</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Documenten, issues en audit</h3>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
              <p className="font-semibold text-forest">{data.companyDocuments.length + data.projectDocuments.length} documenten</p>
              <p className="mt-1 text-sm text-ink/60">Bedrijfs- en projectdocumenten op één plek.</p>
            </div>
            <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
              <p className="font-semibold text-forest">{openIncidents.length} open incident(en)</p>
              <p className="mt-1 text-sm text-ink/60">Gebreken, meldingen en klachten met statusopvolging.</p>
            </div>
            <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
              <p className="font-semibold text-forest">{data.auditEvents.length} audit events</p>
              <p className="mt-1 text-sm text-ink/60">Handig voor support, controle en AVG-trail.</p>
            </div>
          </div>
        </Panel>
      </section>

      <Panel>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Controle</p>
        <h3 className="mt-2 text-2xl font-semibold text-forest">Wie heeft welk formulier gedaan?</h3>
        <div className="mt-5 grid gap-3">
          {data.recentSubmissions.map((submission) => (
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
          ))}
          {data.recentSubmissions.length === 0 ? (
            <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">Nog geen formulierinzendingen gevonden.</div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
