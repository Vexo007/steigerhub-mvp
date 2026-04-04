"use client";

import { useState } from "react";

export function StripeCheckoutButton({
  tenantId,
  packageTier
}: {
  tenantId: string;
  packageTier: "starter" | "pro" | "plus";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tenantId, packageTier })
      });

      if (!response.ok) {
        throw new Error("Kon Stripe-checkout niet starten.");
      }

      const payload = (await response.json()) as { url: string };
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Bezig..." : "Stripe checkout openen"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

