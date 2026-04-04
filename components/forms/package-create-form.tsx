"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PackageCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      isTemplate: true
    };

    const response = await fetch("/api/agency/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Pakket kon niet worden aangemaakt.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        name="name"
        placeholder="Nieuw pakket"
        className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
        required
      />
      <textarea
        name="description"
        placeholder="Korte omschrijving"
        className="min-h-24 rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Opslaan..." : "Pakket toevoegen"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}

