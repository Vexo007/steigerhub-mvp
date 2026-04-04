import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Panel } from "@/components/ui/panel";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10 lg:px-6">
      <Panel>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/45">SteigerHub</p>
        <h1 className="mt-3 text-3xl font-semibold text-forest">Wachtwoord vergeten</h1>
        <p className="mt-2 text-sm text-ink/60">
          Vul je e-mailadres in. Dan sturen we een resetlink als dit account bestaat.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <Link href="/" className="mt-5 inline-flex text-sm font-semibold text-forest underline">
          Terug naar login
        </Link>
      </Panel>
    </main>
  );
}
