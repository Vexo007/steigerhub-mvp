"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProjectWorkplanSection } from "@/lib/types";
import { getWorkplanSectionFields, type WorkplanSectionKey } from "@/lib/workplans";

function getInitialValue(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

export function WorkplanSectionForm({
  workplanId,
  sectionKey,
  title,
  initialSection,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}: {
  workplanId: string;
  sectionKey: WorkplanSectionKey;
  title: string;
  initialSection?: ProjectWorkplanSection | null;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const payload = initialSection?.payload ?? {};
  const fields = getWorkplanSectionFields(sectionKey);

  const groupedFields = useMemo(() => {
    return fields.reduce<Record<string, typeof fields>>((acc, field) => {
      const group = field.group ?? "Sectie";
      acc[group] ??= [];
      acc[group].push(field);
      return acc;
    }, {});
  }, [fields]);

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
        <div className="grid gap-3 md:grid-cols-3">
          <button type="button" className="rounded-2xl bg-forest px-5 py-4 text-sm font-semibold text-white">
            HTML preview
          </button>
          <button type="button" className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink">
            PDF document
          </button>
          <button type="button" className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink">
            Word document
          </button>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Vorige
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {Object.entries(groupedFields).map(([group, groupFields]) => (
        <div key={group} className="rounded-[22px] border border-line bg-mist/55 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">{group}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {groupFields.map((field) =>
              field.textarea ? (
                <label key={field.key} className="grid gap-2 text-sm text-ink/80 md:col-span-2">
                  {field.label}
                  <textarea
                    name={field.key}
                    defaultValue={getInitialValue(payload, field.key)}
                    placeholder={field.placeholder}
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
                    placeholder={field.placeholder}
                    className="rounded-2xl border border-line bg-white px-4 py-3 outline-none"
                  />
                </label>
              )
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Vorige
        </button>
        <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "Opslaan..." : "Sectie opslaan"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Opslaan en volgende
        </button>
        {message ? <p className="self-center text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="self-center text-sm text-rose-700">{error}</p> : null}
      </div>
    </form>
  );
}
