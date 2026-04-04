import Link from "next/link";
import { Panel } from "@/components/ui/panel";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
      <Panel className="w-full">
        <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Demo login</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Kies hoe je de app wilt bekijken</h1>
        <p className="mt-3 text-sm text-ink/70">
          In productie koppel je dit aan Supabase Auth, magic links of e-mail uitnodigingen.
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/agency" className="rounded-2xl bg-ink px-4 py-3 text-center text-white">
            Agency admin
          </Link>
          <Link href="/workspace" className="rounded-2xl bg-mist px-4 py-3 text-center text-ink">
            Tenant gebruiker
          </Link>
        </div>
      </Panel>
    </main>
  );
}

