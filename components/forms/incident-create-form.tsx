"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomerAccount, Project } from "@/lib/types";

export function IncidentCreateForm({
  tenantId,
  projects,
  customers
}: {
  tenantId: string;
  projects: Project[];
  customers: CustomerAccount[];
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
      projectId: String(formData.get("projectId") ?? "") || null,
      customerId: String(formData.get("customerId") ?? "") || null,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      severity: String(formData.get("severity") ?? "medium")
    };

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Incident kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Incident vastgelegd.");
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
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink/80">
          Project
          <select name="projectId" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="">
            <option value="">Los van project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.clientName} - {project.siteAddress}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Klant
          <select name="customerId" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="">
            <option value="">Kies klant</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink/80">
        Titel
        <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="title" placeholder="Beschadigde leuning gemeld" required />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Ernst
        <select name="severity" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" defaultValue="medium">
          <option value="low">Laag</option>
          <option value="medium">Normaal</option>
          <option value="high">Hoog</option>
          <option value="critical">Kritiek</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Omschrijving
        <textarea className="min-h-24 rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="description" placeholder="Wat is er precies gebeurd, wat moet worden opgelost?" />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Opslaan..." : "Incident toevoegen"}
      </button>
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
