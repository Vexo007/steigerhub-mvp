"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { workplanTypes } from "@/lib/workplans";

export function WorkplanCreateForm({
  tenantId,
  projectId
}: {
  tenantId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      tenantId,
      projectId,
      title: String(formData.get("title") ?? ""),
      planType: String(formData.get("planType") ?? "")
    };

    const response = await fetch("/api/workplans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error?: string; id?: string };
    if (!response.ok || !result.id) {
      setError(result.error ?? "Werkplan kon niet worden aangemaakt.");
      setLoading(false);
      return;
    }

    router.push(`/workspace/project/${projectId}/workplans/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[22px] border border-line bg-mist/60 p-5">
      <label className="grid gap-2 text-sm text-ink/80">
        Type werkplan
        <select name="planType" className="rounded-2xl border border-line bg-white px-4 py-3 outline-none" defaultValue={workplanTypes[0]}>
          {workplanTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Titel
        <input
          name="title"
          placeholder="Algemeen VGM plan"
          defaultValue={workplanTypes[0]}
          className="rounded-2xl border border-line bg-white px-4 py-3 outline-none"
          required
        />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Aanmaken..." : "Nieuw werkplan"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
