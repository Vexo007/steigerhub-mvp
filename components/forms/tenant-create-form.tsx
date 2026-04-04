"use client";

import { useState } from "react";

const packageDescriptions = {
  starter: "Voor kleine teams die dossiers, foto's en notities willen beheren.",
  pro: "Voor teams met bouwtekeningen, veiligheid en meerdere planners.",
  plus: "Voor grotere klanten met meer opslag, meer gebruikers en maatwerk."
} as const;

export function TenantCreateForm() {
  const [tier, setTier] = useState<keyof typeof packageDescriptions>("pro");

  return (
    <form className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm text-ink/80">
        Bedrijfsnaam
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="SteigerPlus Noord"
          name="name"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Contact e-mail
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="planning@steigerplus.nl"
          name="contactEmail"
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Contactpersoon
        <input
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="J. de Vries"
          name="contactName"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink/80">
        Pakket
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value as keyof typeof packageDescriptions)}
          className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          name="packageTier"
        >
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="plus">Plus</option>
        </select>
      </label>
      <div className="md:col-span-2 rounded-3xl bg-ink px-5 py-4 text-sm text-white">
        <p className="font-semibold">Geselecteerd pakket</p>
        <p className="mt-1 text-white/75">{packageDescriptions[tier]}</p>
      </div>
      <button
        type="submit"
        className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white transition hover:bg-rust/90 md:col-span-2"
      >
        Tenant aanmaken
      </button>
    </form>
  );
}

