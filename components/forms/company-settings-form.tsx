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
      secondaryColor: String(formData.get("secondaryColor") ?? "#49a642")
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
          <div className="flex items-center gap-3">
            <span
              className="h-11 w-11 rounded-2xl border border-line"
              style={{ backgroundColor: initialProfile?.primaryColor ?? "#0a331c" }}
            />
            <input
              name="primaryColor"
              defaultValue={initialProfile?.primaryColor ?? "#0a331c"}
              className="flex-1 rounded-2xl border border-line bg-mist px-4 py-3 font-mono uppercase outline-none"
              pattern="^#([A-Fa-f0-9]{6})$"
              placeholder="#0A331C"
            />
          </div>
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Secundaire kleur
          <div className="flex items-center gap-3">
            <span
              className="h-11 w-11 rounded-2xl border border-line"
              style={{ backgroundColor: initialProfile?.secondaryColor ?? "#49a642" }}
            />
            <input
              name="secondaryColor"
              defaultValue={initialProfile?.secondaryColor ?? "#49a642"}
              className="flex-1 rounded-2xl border border-line bg-mist px-4 py-3 font-mono uppercase outline-none"
              pattern="^#([A-Fa-f0-9]{6})$"
              placeholder="#49A642"
            />
          </div>
        </label>
      </div>
      <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Opslaan..." : "Company settings opslaan"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
