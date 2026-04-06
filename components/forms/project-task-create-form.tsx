"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EmployeeSummary, Project } from "@/lib/types";

export function ProjectTaskCreateForm({
  tenantId,
  projects,
  employees
}: {
  tenantId: string;
  projects: Project[];
  employees: EmployeeSummary[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      tenantId,
      projectId: String(formData.get("projectId") ?? ""),
      title: String(formData.get("title") ?? ""),
      taskType: String(formData.get("taskType") ?? ""),
      assignedTo: String(formData.get("assignedTo") ?? "") || null,
      priority: String(formData.get("priority") ?? "medium"),
      dueDate: String(formData.get("dueDate") ?? "") || null,
      notes: String(formData.get("notes") ?? "")
    };

    try {
      const response = await fetch("/api/project-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Taak kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Taak aangemaakt.");
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-ink/80">
        Project
        <select name="projectId" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" required>
          <option value="">Kies een project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.clientName} - {project.siteAddress}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink/80">
          Taak
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="title" placeholder="Werkplek keuring uitvoeren" required />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Type
          <select name="taskType" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="keuring">
            <option value="keuring">Keuring</option>
            <option value="werkplan">Werkplan</option>
            <option value="oplevering">Oplevering</option>
            <option value="tekening">Tekening</option>
            <option value="algemeen">Algemeen</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink/80">
          Toewijzen aan
          <select name="assignedTo" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="">
            <option value="">Nog niet toegewezen</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Prioriteit
          <select name="priority" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="medium">
            <option value="low">Laag</option>
            <option value="medium">Normaal</option>
            <option value="high">Hoog</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Deadline
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="dueDate" type="datetime-local" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink/80">
        Notities
        <textarea className="min-h-20 rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="notes" placeholder="Extra toelichting voor de werkvloer" />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Opslaan..." : "Taak toevoegen"}
      </button>
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
