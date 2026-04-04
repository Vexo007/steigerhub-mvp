"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CompanyProfile } from "@/lib/types";

export function CompanySettingsForm({
  tenantId,
  initialProfile
}: {
  tenantId: string;
  initialProfile: CompanyProfile | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      tenantId,
      displayName: String(formData.get("displayName") ?? ""),
      primaryColor: String(formData.get("primaryColor") ?? "#0a331c"),
      secondaryColor: String(formData.get("secondaryColor") ?? "#49a642"),
      rieNotes: String(formData.get("rieNotes") ?? ""),
      companyNotes: String(formData.get("companyNotes") ?? "")
    };

    try {
      const response = await fetch("/api/company-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Company settings opslaan mislukt.");
      }

      setMessage("Company settings opgeslagen.");
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
        Weergavenaam bedrijf
        <input
          name="displayName"
          defaultValue={initialProfile?.displayName ?? ""}
          className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink/80">
          Primaire kleur
          <input
            type="color"
            name="primaryColor"
            defaultValue={initialProfile?.primaryColor ?? "#0a331c"}
            className="h-14 w-full rounded-2xl border border-line bg-mist px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Secundaire kleur
          <input
            type="color"
            name="secondaryColor"
            defaultValue={initialProfile?.secondaryColor ?? "#49a642"}
            className="h-14 w-full rounded-2xl border border-line bg-mist px-3 py-2 outline-none"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink/80">
        RI&E notities
        <textarea
          name="rieNotes"
          defaultValue={initialProfile?.rieNotes ?? ""}
          className="min-h-28 rounded-2xl border border-line bg-mist px-4 py-3 outline-none"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Algemene bedrijfsnotities
        <textarea
          name="companyNotes"
          defaultValue={initialProfile?.companyNotes ?? ""}
          className="min-h-28 rounded-2xl border border-line bg-mist px-4 py-3 outline-none"
        />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Opslaan..." : "Company settings opslaan"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
