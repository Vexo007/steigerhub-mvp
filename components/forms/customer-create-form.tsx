"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerCreateForm({ tenantId }: { tenantId: string }) {
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
      name: String(formData.get("name") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      contactPhone: String(formData.get("contactPhone") ?? ""),
      roleLabel: String(formData.get("roleLabel") ?? ""),
      addressLabel: String(formData.get("addressLabel") ?? "Hoofdadres"),
      street: String(formData.get("street") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      city: String(formData.get("city") ?? ""),
      country: String(formData.get("country") ?? "Nederland"),
      accessNotes: String(formData.get("accessNotes") ?? "")
    };

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Klant kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Klant aangemaakt.");
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
        Bedrijfsnaam
        <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="name" placeholder="Van Dijk BV" required />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink/80">
          Contactpersoon
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="contactName" placeholder="Jan de Vries" />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Rol
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="roleLabel" placeholder="Projectleider" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink/80">
          E-mail
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="contactEmail" type="email" placeholder="info@vandijk.nl" />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Telefoon
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="contactPhone" placeholder="+31 6 12345678" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <label className="grid gap-2 text-sm text-ink/80">
          Adres label
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="addressLabel" defaultValue="Hoofdadres" />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Straat
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="street" placeholder="Stationsstraat 12" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink/80">
          Postcode
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="postalCode" placeholder="1012AB" />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Plaats
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="city" placeholder="Amsterdam" />
        </label>
        <label className="grid gap-2 text-sm text-ink/80">
          Land
          <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="country" defaultValue="Nederland" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink/80">
        Toegangsnotities
        <textarea className="min-h-20 rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="accessNotes" placeholder="Melden bij receptie, parkeren achterzijde" />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Interne notitie
        <textarea className="min-h-20 rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="notes" placeholder="Belangrijke klantafspraken of klachtenhistorie" />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Opslaan..." : "Klant toevoegen"}
      </button>
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
