import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Panel } from "@/components/ui/panel";
import { getAgencyBootstrapState, getCurrentAppUser } from "@/lib/auth";

export default async function LoginPage() {
  const [user, bootstrapState] = await Promise.all([getCurrentAppUser(), getAgencyBootstrapState()]);

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-8 lg:px-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="bg-ink text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-sand">SteigerHub login</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Log in als agency of klantomgeving.</h1>
          <p className="mt-4 max-w-lg text-white/75">
            Agency beheert klanten en pakketten. Klanten zien alleen hun eigen tenant en werkprocessen.
          </p>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-semibold text-ink">Inloggen</h2>
          <p className="mt-2 text-sm text-ink/60">
            Gebruik je agency-login of de tijdelijke tenant-login die bij onboarding is aangemaakt.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          {!bootstrapState.hasAgencyAdmin ? (
            <p className="mt-4 text-sm text-ink/60">
              Nog geen agency admin? Ga naar <a className="font-semibold text-ink underline" href="/setup">/setup</a>.
            </p>
          ) : null}
        </Panel>
      </section>
    </main>
  );
}
