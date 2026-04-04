"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldDefinition, FormDefinition, Project } from "@/lib/types";

export function DynamicRecordForm({
  tenantId,
  form,
  fields,
  projects,
  selectedProjectId
}: {
  tenantId: string;
  form: FormDefinition;
  fields: FieldDefinition[];
  projects: Project[];
  selectedProjectId?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = new FormData(event.currentTarget);
    data.append("tenantId", tenantId);
    data.append("formId", form.id);

    const response = await fetch("/api/records", {
      method: "POST",
      body: data
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Opslaan mislukt.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Record opgeslagen.");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[24px] border border-ink/10 bg-white p-5">
      <div>
        <h4 className="text-lg font-semibold text-ink">{form.name}</h4>
        {form.description ? <p className="mt-1 text-sm text-ink/60">{form.description}</p> : null}
      </div>
      <label className="grid gap-2 text-sm text-ink/80">
        Koppel aan project
        <select
          name="projectId"
          defaultValue={selectedProjectId ?? ""}
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
        >
          <option value="">Geen project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.clientName} - {project.siteAddress}
            </option>
          ))}
        </select>
      </label>
      {fields.map((field) => {
        const name = `field:${field.id}`;

        if (field.type === "textarea") {
          return (
            <label key={field.id} className="grid gap-2 text-sm text-ink/80">
              {field.label}
              <textarea
                name={name}
                required={field.required}
                className="min-h-24 rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              />
            </label>
          );
        }

        if (field.type === "select") {
          return (
            <label key={field.id} className="grid gap-2 text-sm text-ink/80">
              {field.label}
              <select
                name={name}
                required={field.required}
                className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              >
                <option value="">Kies...</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.id} className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" name={name} value="true" />
              {field.label}
            </label>
          );
        }

        if (field.type === "photo") {
          return (
            <label key={field.id} className="grid gap-2 text-sm text-ink/80">
              {field.label}
              <input
                type="file"
                name={name}
                accept="image/*"
                required={field.required}
                className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              />
            </label>
          );
        }

        return (
          <label key={field.id} className="grid gap-2 text-sm text-ink/80">
            {field.label}
            <input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              name={name}
              required={field.required}
              className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            />
          </label>
        );
      })}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Opslaan..." : "Formulier opslaan"}
      </button>
      {message ? <p className="text-sm text-ink/70">{message}</p> : null}
    </form>
  );
}
