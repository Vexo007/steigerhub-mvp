"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (resetError) {
        throw resetError;
      }

      setMessage("Als dit e-mailadres bestaat, is er een resetlink verstuurd.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset versturen mislukt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-ink/80">
        E-mailadres
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Bezig..." : "Resetlink versturen"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
