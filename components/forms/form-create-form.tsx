"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FormCreateForm({ moduleId, tenantId }: { moduleId: string; tenantId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      moduleId,
      tenantId,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "")
    };

    await fetch("/api/agency/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    event.currentTarget.reset();
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-ink/10 p-4">
      <input
        name="name"
        placeholder="Nieuw formulier"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
        required
      />
      <input
        name="description"
        placeholder="Omschrijving"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
      />
      <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
        {loading ? "Bezig..." : "Formulier toevoegen"}
      </button>
    </form>
  );
}
