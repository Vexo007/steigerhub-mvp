"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectWorkplanSection } from "@/lib/types";
import type { WorkplanSectionKey } from "@/lib/workplans";

type SectionField = {
  key: string;
  label: string;
  type?: "date";
  textarea?: boolean;
};

function getInitialValue(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

function getSectionFields(sectionKey: WorkplanSectionKey): SectionField[] {
  switch (sectionKey) {
    case "algemeen":
      return [
        { key: "titel", label: "Titel" },
        { key: "projectnummer", label: "Projectnummer" },
        { key: "adres", label: "Adres" },
        { key: "plaats", label: "Plaats" },
        { key: "startdatum", label: "Startdatum", type: "date" },
        { key: "einddatum", label: "Einddatum", type: "date" }
      ];
    case "partijen":
      return [
        { key: "opdrachtgever", label: "Opdrachtgever" },
        { key: "hoofdaannemer", label: "Hoofdaannemer" },
        { key: "uitvoerder", label: "Uitvoerder" },
        { key: "contactpersoon", label: "Contactpersoon" },
        { key: "telefoon", label: "Telefoon" }
      ];
    case "referenties":
      return [
        { key: "bron", label: "Bron / referentie" },
        { key: "documenten", label: "Documenten", textarea: true },
        { key: "opmerkingen", label: "Opmerkingen", textarea: true }
      ];
    case "werkzaamheden":
      return [
        { key: "werkstappen", label: "Werkstappen", textarea: true },
        { key: "projectlocatie", label: "Inrichting projectlocatie", textarea: true },
        { key: "werktijden", label: "Werk- en rusttijden" }
      ];
    case "risicos":
      return [
        { key: "risicos", label: "Belangrijkste risico's", textarea: true },
        { key: "maatregelen", label: "Maatregelen", textarea: true },
        { key: "pbm", label: "Verplichte PBM", textarea: true }
      ];
    case "bijlagen":
      return [{ key: "bijlagen", label: "Bijlagen / afspraken", textarea: true }];
    default:
      return [];
  }
}

export function WorkplanSectionForm({
  workplanId,
  sectionKey,
  title,
  initialSection
}: {
  workplanId: string;
  sectionKey: WorkplanSectionKey;
  title: string;
  initialSection?: ProjectWorkplanSection | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const payload = initialSection?.payload ?? {};
  const fields = getSectionFields(sectionKey);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    fields.forEach((field) => {
      values[field.key] = String(formData.get(field.key) ?? "");
    });

    const response = await fetch(`/api/workplans/${workplanId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionKey,
        title,
        payload: values
      })
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Sectie opslaan mislukt.");
      setLoading(false);
      return;
    }

    setMessage("Sectie opgeslagen.");
    router.refresh();
    setLoading(false);
  }

  if (sectionKey === "genereren") {
    return (
      <div className="grid gap-4 rounded-[22px] border border-line bg-mist/55 p-5">
        <p className="text-sm text-ink/65">Wanneer alle secties zijn ingevuld, kun je hieronder een documentvoorbeeld openen.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">
            HTML preview
          </button>
          <button type="button" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink">
            PDF document
          </button>
          <button type="button" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink">
            Word document
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[22px] border border-line bg-mist/55 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) =>
          field.textarea ? (
            <label key={field.key} className="grid gap-2 text-sm text-ink/80 md:col-span-2">
              {field.label}
              <textarea
                name={field.key}
                defaultValue={getInitialValue(payload, field.key)}
                className="min-h-28 rounded-2xl border border-line bg-white px-4 py-3 outline-none"
              />
            </label>
          ) : (
            <label key={field.key} className="grid gap-2 text-sm text-ink/80">
              {field.label}
              <input
                type={field.type === "date" ? "date" : "text"}
                name={field.key}
                defaultValue={getInitialValue(payload, field.key)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none"
              />
            </label>
          )
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Opslaan..." : "Sectie opslaan"}
        </button>
        {message ? <p className="self-center text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="self-center text-sm text-rose-700">{error}</p> : null}
      </div>
    </form>
  );
}
