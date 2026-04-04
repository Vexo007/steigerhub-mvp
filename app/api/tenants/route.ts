import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/auth";
import { clonePackageForTenant, getPackageDefinitions } from "@/lib/package-builder-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createTenantSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen agency admins mogen tenants aanmaken." }, { status: 403 });
  }

  const json = await request.json();
  const parsed = createTenantSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." },
      { status: 500 }
    );
  }

  const db = supabase as any;
  const temporaryPassword = `Steiger!${crypto.randomUUID().slice(0, 8)}`;
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.contactEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.contactName
    }
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Tenant login kon niet worden aangemaakt." },
      { status: 500 }
    );
  }

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .insert({
      name: parsed.data.name,
      niche: parsed.data.niche,
      package_tier: parsed.data.packageTier,
      status: "trialing",
      contact_name: parsed.data.contactName,
      contact_email: parsed.data.contactEmail
    })
    .select("id,name,niche,package_tier,status,contact_name,contact_email,stripe_customer_id")
    .single();

  if (tenantError || !tenant) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: tenantError?.message ?? "Tenant kon niet worden aangemaakt." },
      { status: 500 }
    );
  }

  const moduleKeys = ["materials", "blueprints", "safety_docs", "notes", "photos", "timeline"];
  const amountByTier = {
    starter: 79,
    pro: 149,
    plus: 249
  } as const;

  const [moduleResult, subscriptionResult, auditResult] = await Promise.all([
    db.from("tenant_module_settings").insert(
      moduleKeys.map((moduleKey) => ({
        tenant_id: tenant.id,
        module_key: moduleKey,
        enabled: true
      }))
    ),
    db.from("subscriptions").insert({
      tenant_id: tenant.id,
      stripe_customer_id: `manual-${tenant.id}`,
      stripe_price_id: `manual-${parsed.data.packageTier}`,
      package_tier: parsed.data.packageTier,
      status: "trialing",
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }),
    db.from("audit_logs").insert({
      tenant_id: tenant.id,
      action: "tenant_created",
      target_table: "tenants",
      target_id: tenant.id,
      metadata: {
        packageTier: parsed.data.packageTier,
        amountMonthly: amountByTier[parsed.data.packageTier]
      }
    })
  ]);

  if (moduleResult.error || subscriptionResult.error || auditResult.error) {
    return NextResponse.json(
      {
        error:
          moduleResult.error?.message ??
          subscriptionResult.error?.message ??
          auditResult.error?.message ??
          "Tenant is deels aangemaakt maar configuratie mislukte."
      },
      { status: 500 }
    );
  }

  const { error: profileError } = await db.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: tenant.id,
    role: "tenant_admin",
    full_name: parsed.data.contactName,
    email: parsed.data.contactEmail
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  const templates = await getPackageDefinitions();
  const preferredTemplateName =
    parsed.data.packageTier === "starter"
      ? "Steigerbouw Basic"
      : parsed.data.packageTier === "pro"
        ? "Steigerbouw Pro"
        : "Steigerbouw Custom";
  const template = templates.find((item) => item.isTemplate && item.name === preferredTemplateName);

  if (template) {
    try {
      await clonePackageForTenant({
        tenantId: tenant.id,
        packageTemplateId: template.id,
        tenantName: parsed.data.name
      });
    } catch (cloneError) {
      return NextResponse.json(
        {
          error:
            cloneError instanceof Error
              ? cloneError.message
              : "Tenant is aangemaakt, maar pakketkopie maken mislukte."
        },
        { status: 500 }
      );
    }
  }

  revalidatePath("/agency");
  revalidatePath("/agency/packages");
  revalidatePath(`/agency/tenants/${tenant.id}/config`);
  revalidatePath(`/workspace?tenantId=${tenant.id}`);

  return NextResponse.json({
    message: "Tenant succesvol aangemaakt.",
    data: {
      id: tenant.id,
      name: tenant.name,
      packageTier: tenant.package_tier,
      status: tenant.status,
      loginEmail: parsed.data.contactEmail,
      temporaryPassword
    }
  });
}
