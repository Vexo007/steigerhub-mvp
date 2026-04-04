"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const packageDescriptions = {
  starter: "Voor kleine teams die dossiers, foto's en notities willen beheren.",
  pro: "Voor teams met bouwtekeningen, veiligheid en meerdere planners.",
  plus: "Voor grotere klanten met meer opslag, meer gebruikers en maatwerk."
} as const;

export function TenantCreateForm() {
  const router = useRouter();
  const [tier, setTier] = useState<keyof typeof packageDescriptions>("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCredentials(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      packageTier: String(formData.get("packageTier") ?? "pro"),
      niche: "steigerbouw"
    };

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
        data?: { id?: string; loginEmail?: string; temporaryPassword?: string };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Tenant kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Tenant aangemaakt.");
      if (result.data?.loginEmail && result.data?.temporaryPassword) {
        setCredentials({
          email: result.data.loginEmail,
          password: result.data.temporaryPassword
        });
      }
      event.currentTarget.reset();
      setTier("pro");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm text-ink/80">
        Bedrijfsnaam
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="SteigerPlus Noord"
          name="name"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Contact e-mail
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="planning@steigerplus.nl"
          name="contactEmail"
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Contactpersoon
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="J. de Vries"
          name="contactName"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Pakket
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value as keyof typeof packageDescriptions)}
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="packageTier"
        >
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="plus">Plus</option>
        </select>
      </label>
      <div className="md:col-span-2 rounded-3xl bg-ink px-5 py-4 text-sm text-white">
        <p className="font-semibold">Geselecteerd pakket</p>
        <p className="mt-1 text-white/75">{packageDescriptions[tier]}</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white transition hover:bg-rust/90 md:col-span-2"
      >
        {loading ? "Bezig..." : "Tenant aanmaken"}
      </button>
      {success ? <p className="text-sm text-emerald-700 md:col-span-2">{success}</p> : null}
      {credentials ? (
        <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-sm text-emerald-900 md:col-span-2">
          <p className="font-semibold">Tijdelijke tenant-login</p>
          <p className="mt-1">E-mail: {credentials.email}</p>
          <p>Wachtwoord: {credentials.password}</p>
          <p className="mt-2 text-emerald-900/75">De klant kan hiermee direct inloggen via `/login`.</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-rose-700 md:col-span-2">{error}</p> : null}
    </form>
  );
}
