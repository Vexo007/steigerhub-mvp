"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompanyLogoUploadForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const data = new FormData(event.currentTarget);
    data.append("tenantId", tenantId);

    try {
      const response = await fetch("/api/company-logo", {
        method: "POST",
        body: data
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Logo uploaden mislukt.");
      }

      setMessage("Logo bijgewerkt.");
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
        Logo bestand
        <input type="file" name="file" accept="image/*" className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" required />
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Uploaden..." : "Logo uploaden"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
