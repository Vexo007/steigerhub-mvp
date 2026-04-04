import { customFields, projectFiles, projectNotes, projects, subscriptions, tenantModules, tenants } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CustomFieldDefinition,
  Project,
  ProjectFile,
  ProjectNote,
  SubscriptionSummary,
  Tenant,
  TenantModuleSetting
} from "@/lib/types";

type AgencyTenantRow = {
  id: string;
  name: string;
  niche: "steigerbouw";
  package_tier: "starter" | "pro" | "plus";
  status: "trialing" | "active" | "past_due" | "paused" | "blocked";
  stripe_customer_id: string | null;
  contact_name: string;
  contact_email: string;
  projects: Array<{ count: number }> | null;
  profiles: Array<{ count: number }> | null;
};

type SubscriptionRow = {
  tenant_id: string;
  package_tier: "starter" | "pro" | "plus";
  stripe_price_id: string;
  status: "trialing" | "active" | "past_due" | "paused" | "blocked";
  current_period_end: string | null;
};

type ProjectRow = {
  id: string;
  tenant_id: string;
  client_name: string;
  site_address: string;
  site_city: string;
  status: "draft" | "planned" | "active" | "inspection" | "completed";
  created_at: string;
  start_date: string | null;
  material_summary: string;
  safety_status: "missing" | "pending" | "approved";
};

type ProjectFileRow = {
  id: string;
  project_id: string;
  tenant_id: string;
  kind: "photo" | "blueprint" | "safety" | "other";
  file_name: string;
  created_at: string;
};

type ProjectNoteRow = {
  id: string;
  project_id: string;
  tenant_id: string;
  body: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

type CustomFieldRow = {
  id: string;
  tenant_id: string;
  label: string;
  field_key: string;
  input_type: "text" | "textarea" | "date" | "number";
  enabled: boolean;
};

type ModuleRow = {
  tenant_id: string;
  module_key: TenantModuleSetting["moduleKey"];
  enabled: boolean;
};

const packageAmounts = {
  starter: 79,
  pro: 149,
  plus: 249
} as const;

const liveDashboardsEnabled = process.env.ENABLE_LIVE_DASHBOARDS === "true";

async function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms = 3000): Promise<T> {
  return await Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Timed out")), ms);
    })
  ]);
}

function mapTenant(row: AgencyTenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    packageTier: row.package_tier,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    activeUsers: row.profiles?.[0]?.count ?? 0,
    projectCount: row.projects?.[0]?.count ?? 0
  };
}

function mapSubscription(row: SubscriptionRow): SubscriptionSummary {
  return {
    tenantId: row.tenant_id,
    packageTier: row.package_tier,
    amountMonthly: packageAmounts[row.package_tier],
    stripePriceId: row.stripe_price_id,
    nextBillingDate: row.current_period_end ?? new Date().toISOString(),
    paymentState: row.status === "past_due" ? "past_due" : row.status === "trialing" ? "trialing" : "paid"
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    clientName: row.client_name,
    siteAddress: row.site_address,
    siteCity: row.site_city,
    status: row.status,
    createdAt: row.created_at,
    startDate: row.start_date ?? row.created_at,
    materialSummary: row.material_summary,
    safetyStatus: row.safety_status
  };
}

function mapProjectFile(row: ProjectFileRow): ProjectFile {
  return {
    id: row.id,
    projectId: row.project_id,
    tenantId: row.tenant_id,
    kind: row.kind,
    fileName: row.file_name,
    uploadedAt: row.created_at
  };
}

function mapProjectNote(row: ProjectNoteRow): ProjectNote {
  return {
    id: row.id,
    projectId: row.project_id,
    tenantId: row.tenant_id,
    author: row.profiles?.full_name ?? "Onbekend",
    createdAt: row.created_at,
    body: row.body
  };
}

function mapCustomField(row: CustomFieldRow): CustomFieldDefinition {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    label: row.label,
    fieldKey: row.field_key,
    inputType: row.input_type,
    enabled: row.enabled
  };
}

function mapModule(row: ModuleRow): TenantModuleSetting {
  return {
    tenantId: row.tenant_id,
    moduleKey: row.module_key,
    enabled: row.enabled
  };
}

export async function getAgencyDashboardData() {
  if (!liveDashboardsEnabled) {
    return { tenants, subscriptions, source: "mock" as const };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { tenants, subscriptions, source: "mock" as const };
  }

  try {
    const [{ data: tenantRows, error: tenantError }, { data: subscriptionRows, error: subscriptionError }] =
      await withTimeout(
        Promise.all([
          supabase
            .from("tenants")
            .select("id,name,niche,package_tier,status,stripe_customer_id,contact_name,contact_email,projects(count),profiles(count)")
            .order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("tenant_id,package_tier,stripe_price_id,status,current_period_end")
        ])
      );

    if (tenantError || subscriptionError || !tenantRows) {
      return { tenants, subscriptions, source: "mock" as const };
    }

    return {
      tenants: (tenantRows as unknown as AgencyTenantRow[]).map(mapTenant),
      subscriptions: ((subscriptionRows ?? []) as SubscriptionRow[]).map(mapSubscription),
      source: "supabase" as const
    };
  } catch {
    return { tenants, subscriptions, source: "mock" as const };
  }
}

export async function getTenantWorkspaceData(tenantId?: string) {
  if (!liveDashboardsEnabled) {
    return {
      tenant: tenants[0] ?? null,
      projects,
      projectFiles,
      projectNotes,
      modules: tenantModules,
      fields: customFields,
      source: "mock" as const
    };
  }

  const supabase = createSupabaseAdminClient();
  const fallbackTenantId = tenantId ?? tenants[0]?.id;

  if (!supabase || !fallbackTenantId) {
    return {
      tenant: tenants[0] ?? null,
      projects,
      projectFiles,
      projectNotes,
      modules: tenantModules,
      fields: customFields,
      source: "mock" as const
    };
  }

  let tenantResponse;
  try {
    tenantResponse = await withTimeout(
      supabase
        .from("tenants")
        .select("id,name,niche,package_tier,status,stripe_customer_id,contact_name,contact_email")
        .eq("id", fallbackTenantId)
        .single()
    );
  } catch {
    return {
      tenant: tenants[0] ?? null,
      projects,
      projectFiles,
      projectNotes,
      modules: tenantModules,
      fields: customFields,
      source: "mock" as const
    };
  }

  const { data: tenantRow, error: tenantError } = tenantResponse as {
    data: unknown;
    error: unknown;
  };

  if (tenantError || !tenantRow) {
    return {
      tenant: tenants[0] ?? null,
      projects,
      projectFiles,
      projectNotes,
      modules: tenantModules,
      fields: customFields,
      source: "mock" as const
    };
  }

  const tenantData = tenantRow as unknown as {
    id: string;
    name: string;
    niche: Tenant["niche"];
    package_tier: Tenant["packageTier"];
    status: Tenant["status"];
    stripe_customer_id: string | null;
    contact_name: string;
    contact_email: string;
  };

  let queryResults;
  try {
    queryResults = await withTimeout(
      Promise.all([
        supabase
          .from("projects")
          .select("id,tenant_id,client_name,site_address,site_city,status,created_at,start_date,material_summary,safety_status")
          .eq("tenant_id", fallbackTenantId)
          .order("created_at", { ascending: false }),
        supabase.from("tenant_module_settings").select("tenant_id,module_key,enabled").eq("tenant_id", fallbackTenantId),
        supabase
          .from("custom_field_definitions")
          .select("id,tenant_id,label,field_key,input_type,enabled")
          .eq("tenant_id", fallbackTenantId)
          .order("created_at", { ascending: true }),
        supabase
          .from("project_notes")
          .select("id,project_id,tenant_id,body,created_at,profiles(full_name)")
          .eq("tenant_id", fallbackTenantId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_files")
          .select("id,project_id,tenant_id,kind,file_name,created_at")
          .eq("tenant_id", fallbackTenantId)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", fallbackTenantId)
      ])
    );
  } catch {
    return {
      tenant: tenants[0] ?? null,
      projects,
      projectFiles,
      projectNotes,
      modules: tenantModules,
      fields: customFields,
      source: "mock" as const
    };
  }

  const [projectRows, moduleRows, fieldRows, noteRows, fileRows, profileCountRows] = queryResults;

  return {
    tenant: {
      id: tenantData.id,
      name: tenantData.name,
      niche: tenantData.niche,
      packageTier: tenantData.package_tier,
      status: tenantData.status,
      stripeCustomerId: tenantData.stripe_customer_id,
      contactName: tenantData.contact_name,
      contactEmail: tenantData.contact_email,
      activeUsers: profileCountRows.count ?? 0,
      projectCount: projectRows.data?.length ?? 0
    } satisfies Tenant,
    projects: ((projectRows.data ?? []) as ProjectRow[]).map(mapProject),
    projectFiles: ((fileRows.data ?? []) as ProjectFileRow[]).map(mapProjectFile),
    projectNotes: ((noteRows.data ?? []) as ProjectNoteRow[]).map(mapProjectNote),
    modules: ((moduleRows.data ?? []) as ModuleRow[]).map(mapModule),
    fields: ((fieldRows.data ?? []) as CustomFieldRow[]).map(mapCustomField),
    source: "supabase" as const
  };
}
