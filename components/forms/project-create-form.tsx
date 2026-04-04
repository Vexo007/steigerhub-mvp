"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectCreateForm({ tenantId }: { tenantId: string }) {
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
      clientName: String(formData.get("clientName") ?? ""),
      siteAddress: String(formData.get("siteAddress") ?? ""),
      siteCity: String(formData.get("siteCity") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      materialSummary: String(formData.get("materialSummary") ?? ""),
      safetyStatus: String(formData.get("safetyStatus") ?? "missing")
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Project kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Project aangemaakt.");
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
        Klantnaam
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="Woonstaete BV"
          name="clientName"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Adres
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="Havenstraat 17"
          name="siteAddress"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Plaats
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="Groningen"
          name="siteCity"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Startdatum
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="startDate"
          type="date"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Materiaal / werknotitie
        <textarea
          className="min-h-24 rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="72 frames, 110 planken, extra afscherming straatzijde"
          name="materialSummary"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Veiligheidsstatus
        <select
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="safetyStatus"
          defaultValue="pending"
        >
          <option value="missing">Ontbreekt</option>
          <option value="pending">In afwachting</option>
          <option value="approved">Goedgekeurd</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Opslaan..." : "Werkzaamheden toevoegen"}
      </button>
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}

