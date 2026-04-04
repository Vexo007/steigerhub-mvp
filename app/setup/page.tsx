import { redirect } from "next/navigation";
import { BootstrapAgencyForm } from "@/components/forms/bootstrap-agency-form";
import { Panel } from "@/components/ui/panel";
import { getAgencyBootstrapState, getCurrentAppUser } from "@/lib/auth";

export default async function SetupPage() {
  const [user, bootstrapState] = await Promise.all([getCurrentAppUser(), getAgencyBootstrapState()]);

  if (user) {
    redirect("/app");
  }

  if (bootstrapState.hasAgencyAdmin) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8 lg:px-10">
      <Panel>
        <p className="text-sm uppercase tracking-[0.24em] text-ink/50">Eerste setup</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Maak je eerste agency-admin aan</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink/65">
          Dit is een eenmalige stap. Daarna log je in via de normale loginpagina en maak je klanten vanuit het
          agency dashboard aan.
        </p>
        <div className="mt-6">
          <BootstrapAgencyForm />
        </div>
      </Panel>
    </main>
  );
}
