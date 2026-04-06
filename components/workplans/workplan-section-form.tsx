"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { WorkplanSectionUploadForm } from "@/components/workplans/workplan-section-upload-form";
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
  projectDefaults,
  previewHref,
  pdfHref,
  wordHref,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}: {
  workplanId: string;
  sectionKey: WorkplanSectionKey;
  title: string;
  initialSection?: ProjectWorkplanSection | null;
  projectDefaults?: Record<string, string>;
  previewHref?: string;
  pdfHref?: string;
  wordHref?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<"save" | "next">("save");
  const payload = initialSection?.payload ?? {};
  const fields = getWorkplanSectionFields(sectionKey);
  const uploadedFiles = Array.isArray(payload.uploadedFiles)
    ? (payload.uploadedFiles as Array<{ path: string; fileName: string; uploadedAt?: string; signedUrl?: string }>)
    : [];

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
      values[field.key] = String(formData.get(field.key) ?? projectDefaults?.[field.key] ?? "");
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

    if (submitMode === "next" && canGoNext) {
      onNext?.();
    }
  }

  if (sectionKey === "genereren") {
    return (
      <div className="grid gap-5 rounded-[22px] border border-line bg-mist/55 p-5">
        <div className="rounded-[20px] border border-line bg-white px-4 py-4 text-sm text-ink/65">
          Wanneer alle secties zijn ingevuld, kun je hieronder een documentvoorbeeld openen of later exporteren.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <a
            href={previewHref ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-forest px-5 py-4 text-center text-sm font-semibold text-white shadow-soft"
          >
            HTML preview
          </a>
          <a
            href={pdfHref ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-line bg-white px-5 py-4 text-center text-sm font-semibold text-ink shadow-soft"
          >
            PDF / print
          </a>
          <a href={wordHref ?? "#"} className="rounded-2xl border border-line bg-white px-5 py-4 text-center text-sm font-semibold text-ink shadow-soft">
            Word document
          </a>
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
        <section key={group} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
          <div className="border-b border-line bg-forest px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">Onderdeel</p>
                <p className="mt-1 text-base font-semibold">{group}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                {groupFields.length} veld{groupFields.length === 1 ? "" : "en"}
              </span>
            </div>
          </div>
          <div className="grid gap-4 bg-mist/40 p-5 md:grid-cols-2">
            {groupFields.map((field) =>
              field.textarea ? (
                <label key={field.key} className="grid gap-2 text-sm text-ink/80 md:col-span-2">
                  {field.label}
                  {field.description ? <span className="text-xs text-ink/55">{field.description}</span> : null}
                  <textarea
                    name={field.key}
                    defaultValue={getInitialValue(payload, field.key) || projectDefaults?.[field.key] || ""}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 4}
                    className="min-h-28 rounded-2xl border border-line bg-white px-4 py-3 outline-none"
                  />
                </label>
              ) : (
                <label key={field.key} className="grid gap-2 text-sm text-ink/80">
                  {field.label}
                  {field.description ? <span className="text-xs text-ink/55">{field.description}</span> : null}
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    name={field.key}
                    defaultValue={getInitialValue(payload, field.key) || projectDefaults?.[field.key] || ""}
                    placeholder={field.placeholder}
                    className="rounded-2xl border border-line bg-white px-4 py-3 outline-none"
                  />
                </label>
              )
            )}
          </div>
        </section>
      ))}

      <WorkplanSectionUploadForm
        workplanId={workplanId}
        sectionKey={sectionKey}
        title={title}
        existingFiles={uploadedFiles}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-line bg-panel px-5 py-4">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Vorige
        </button>
        <button
          type="submit"
          onClick={() => setSubmitMode("save")}
          disabled={loading}
          className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Opslaan..." : "Sectie opslaan"}
        </button>
        <button
          type="submit"
          onClick={() => setSubmitMode("next")}
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
