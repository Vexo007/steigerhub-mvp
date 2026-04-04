"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldTypes = ["text", "textarea", "number", "date", "select", "checkbox", "photo"] as const;

export function FieldCreateForm({ formId, tenantId }: { formId: string; tenantId?: string }) {
  const router = useRouter();
  const [type, setType] = useState<(typeof fieldTypes)[number]>("text");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const optionsRaw = String(formData.get("options") ?? "");
    const payload = {
      formId,
      tenantId,
      label: String(formData.get("label") ?? ""),
      fieldKey: String(formData.get("fieldKey") ?? ""),
      type,
      required: formData.get("required") === "on",
      options: optionsRaw ? optionsRaw.split(",").map((item) => item.trim()).filter(Boolean) : [],
      helpText: String(formData.get("helpText") ?? "")
    };

    await fetch("/api/agency/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    event.currentTarget.reset();
    setType("text");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl bg-white p-4">
      <input
        name="label"
        placeholder="Veldlabel"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
        required
      />
      <input
        name="fieldKey"
        placeholder="veld_key"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
        required
      />
      <select
        value={type}
        onChange={(event) => setType(event.target.value as (typeof fieldTypes)[number])}
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
      >
        {fieldTypes.map((fieldType) => (
          <option key={fieldType} value={fieldType}>
            {fieldType}
          </option>
        ))}
      </select>
      <input
        name="options"
        placeholder="opties,gescheiden,door,komma's"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
      />
      <input
        name="helpText"
        placeholder="Hulptekst"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
      />
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" name="required" />
        Verplicht veld
      </label>
      <button className="rounded-full bg-rust px-4 py-2 text-sm font-semibold text-white">
        {loading ? "Bezig..." : "Veld toevoegen"}
      </button>
    </form>
  );
}
