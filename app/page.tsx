import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Panel } from "@/components/ui/panel";
import { getAgencyBootstrapState, getCurrentAppUser } from "@/lib/auth";

export default async function HomePage() {
  const [user, bootstrapState] = await Promise.all([getCurrentAppUser(), getAgencyBootstrapState()]);

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-10 lg:px-6">
      <Panel className="border-forest/10 shadow-panel">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/45">SteigerHub</p>
        <h1 className="mt-3 text-3xl font-semibold text-forest">Inloggen</h1>
        <p className="mt-2 text-sm text-ink/60">
          Log in met je agency account of met je bedrijfslogin.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/forgot-password" className="font-semibold text-forest underline">
            Ik ben mijn wachtwoord vergeten
          </Link>
          {!bootstrapState.hasAgencyAdmin ? (
            <Link href="/setup" className="font-semibold text-forest underline">
              Eerste setup
            </Link>
          ) : null}
        </div>
      </Panel>
    </main>
  );
}
