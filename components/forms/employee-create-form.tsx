"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmployeeCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCredentials(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "tenant_staff")
    };

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
        data?: { loginEmail?: string; temporaryPassword?: string };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Medewerker kon niet worden aangemaakt.");
      }

      setSuccess(result.message ?? "Medewerker aangemaakt.");
      if (result.data?.loginEmail && result.data?.temporaryPassword) {
        setCredentials({
          email: result.data.loginEmail,
          password: result.data.temporaryPassword
        });
      }
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
        Naam
        <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="fullName" required />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        E-mail
        <input className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="email" type="email" required />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Rol
        <select className="rounded-2xl border border-line bg-mist px-4 py-3 outline-none" name="role" defaultValue="tenant_staff">
          <option value="tenant_staff">Werknemer</option>
          <option value="tenant_admin">Manager / admin</option>
        </select>
      </label>
      <button type="submit" disabled={loading} className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Bezig..." : "Gebruiker aanmaken"}
      </button>
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {credentials ? (
        <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <p className="font-semibold">Tijdelijke login</p>
          <p className="mt-1">E-mail: {credentials.email}</p>
          <p>Wachtwoord: {credentials.password}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
