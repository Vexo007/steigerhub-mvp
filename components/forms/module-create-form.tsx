"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModuleCreateForm({ packageId, tenantId }: { packageId: string; tenantId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      packageId,
      tenantId,
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "")
    };

    await fetch("/api/agency/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    event.currentTarget.reset();
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl bg-mist p-4">
      <input
        name="name"
        placeholder="Nieuwe module"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
        required
      />
      <input
        name="slug"
        placeholder="module-slug"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
        required
      />
      <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
        {loading ? "Bezig..." : "Module toevoegen"}
      </button>
    </form>
  );
}
