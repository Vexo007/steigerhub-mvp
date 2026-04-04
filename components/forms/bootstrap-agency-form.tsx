"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function BootstrapAgencyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    try {
      const response = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Agency admin kon niet worden aangemaakt.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/agency");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup mislukt.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-ink/80">
        Jouw naam
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="fullName"
          placeholder="Vexo Solutions"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Agency e-mail
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="email"
          type="email"
          placeholder="service@vexomarketing.com"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Wachtwoord
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="password"
          type="password"
          minLength={8}
          required
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Bezig..." : "Agency account aanmaken"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
