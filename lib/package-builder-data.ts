import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAgencyDashboardData, getTenantWorkspaceData } from "@/lib/data";
import type {
  CompanyDocument,
  CompanyProfile,
  DynamicFieldType,
  EmployeeSummary,
  FieldDefinition,
  FormDefinition,
  ModuleBundle,
  ModuleDefinition,
  PackageTemplateData,
  PackageDefinition,
  TenantAdminData,
  PackageWorkspaceData,
  Tenant,
  TenantConfigData
} from "@/lib/types";

type PackageRow = {
  id: string;
  name: string;
  niche: "steigerbouw";
  description: string;
  is_template: boolean;
};

type ModuleRow = {
  id: string;
  package_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_enabled: boolean;
};

type FormRow = {
  id: string;
  module_id: string;
  name: string;
  description: string;
  sort_order: number;
};

type FieldRow = {
  id: string;
  form_id: string;
  label: string;
  field_key: string;
  type: DynamicFieldType;
  required: boolean;
  options: unknown;
  help_text: string;
  sort_order: number;
};

type RecordRow = {
  id: string;
  tenant_id: string;
  project_id: string | null;
  form_id: string;
  created_by: string | null;
  created_at: string;
  status: string;
};

type FieldValueRow = {
  id: string;
  record_id: string;
  field_id: string;
  value: unknown;
};

type CompanyProfileRow = {
  tenant_id: string;
  display_name: string;
  primary_color: string;
  secondary_color: string;
  logo_path: string | null;
  rie_notes: string;
  company_notes: string;
};

type CompanyDocumentRow = {
  id: string;
  tenant_id: string;
  category: CompanyDocument["category"];
  title: string;
  bucket_path: string;
  file_name: string;
  uploaded_by: string | null;
  created_at: string;
};

function mapPackage(row: PackageRow): PackageDefinition {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    description: row.description,
    isTemplate: row.is_template
  };
}

function mapModule(row: ModuleRow): ModuleDefinition {
  return {
    id: row.id,
    packageId: row.package_id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    isEnabled: row.is_enabled
  };
}

function mapForm(row: FormRow): FormDefinition {
  return {
    id: row.id,
    moduleId: row.module_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order
  };
}

function mapField(row: FieldRow): FieldDefinition {
  return {
    id: row.id,
    formId: row.form_id,
    label: row.label,
    fieldKey: row.field_key,
    type: row.type,
    required: row.required,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    helpText: row.help_text,
    sortOrder: row.sort_order
  };
}

function mapCompanyProfile(row: CompanyProfileRow): CompanyProfile {
  return {
    tenantId: row.tenant_id,
    displayName: row.display_name,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    logoPath: row.logo_path,
    rieNotes: row.rie_notes,
    companyNotes: row.company_notes
  };
}

function mapCompanyDocument(row: CompanyDocumentRow): CompanyDocument {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    category: row.category,
    title: row.title,
    bucketPath: row.bucket_path,
    fileName: row.file_name,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at
  };
}

function buildModuleBundles(
  modules: ModuleDefinition[],
  forms: FormDefinition[],
  fields: FieldDefinition[]
): ModuleBundle[] {
  return modules
    .filter((module) => module.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((module) => ({
      module,
      forms: forms
        .filter((form) => form.moduleId === module.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((form) => ({
          form,
          fields: fields
            .filter((field) => field.formId === form.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        }))
    }));
}

async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const dashboard = await getAgencyDashboardData();
  return dashboard.tenants.find((tenant) => tenant.id === tenantId) ?? null;
}

export async function getPackageDefinitions(): Promise<PackageDefinition[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const db = supabase as any;
  const { data } = await db.from("packages").select("id,name,niche,description,is_template").order("name");
  return ((data ?? []) as PackageRow[]).map(mapPackage);
}

export async function getTenantConfigData(tenantId: string): Promise<TenantConfigData> {
  const supabase = createSupabaseAdminClient();
  const tenant = await getTenantById(tenantId);

  if (!supabase || !tenant) {
    return {
      tenant,
      packageDefinition: null,
      packages: [],
      moduleBundles: []
    };
  }

  const db = supabase as any;
  const { data: tenantRow } = await db.from("tenants").select("package_id").eq("id", tenantId).single();
  const packageId = tenantRow?.package_id as string | null;
  const packages = await getPackageDefinitions();
  const packageDefinition = packages.find((item) => item.id === packageId) ?? null;

  if (!packageId) {
    return {
      tenant,
      packageDefinition,
      packages,
      moduleBundles: []
    };
  }

  const { data: moduleRows } = await db
    .from("package_modules")
    .select("id,package_id,name,slug,sort_order,is_enabled")
    .eq("package_id", packageId);

  const modules = ((moduleRows ?? []) as ModuleRow[]).map(mapModule);
  const moduleIds = modules.map((module) => module.id);
  const { data: formsData } = moduleIds.length
    ? await db.from("module_forms").select("id,module_id,name,description,sort_order").in("module_id", moduleIds)
    : { data: [] };
  const forms = ((formsData ?? []) as FormRow[]).map(mapForm);

  const formIds = forms.map((form) => form.id);
  const { data: fieldsData } = formIds.length
    ? await db
        .from("form_fields")
        .select("id,form_id,label,field_key,type,required,options,help_text,sort_order")
        .in("form_id", formIds)
    : { data: [] };
  const fields = ((fieldsData ?? []) as FieldRow[]).map(mapField);

  return {
    tenant,
    packageDefinition,
    packages,
    moduleBundles: buildModuleBundles(modules, forms, fields)
  };
}

export async function getPackageTemplateData(packageId: string): Promise<PackageTemplateData> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      packageDefinition: null,
      moduleBundles: []
    };
  }

  const db = supabase as any;
  const { data: packageRow } = await db.from("packages").select("id,name,niche,description,is_template").eq("id", packageId).single();

  if (!packageRow) {
    return {
      packageDefinition: null,
      moduleBundles: []
    };
  }

  const packageDefinition = mapPackage(packageRow as PackageRow);
  const { data: moduleRows } = await db
    .from("package_modules")
    .select("id,package_id,name,slug,sort_order,is_enabled")
    .eq("package_id", packageId);

  const modules = ((moduleRows ?? []) as ModuleRow[]).map(mapModule);
  const moduleIds = modules.map((module) => module.id);
  const { data: formsData } = moduleIds.length
    ? await db.from("module_forms").select("id,module_id,name,description,sort_order").in("module_id", moduleIds)
    : { data: [] };
  const forms = ((formsData ?? []) as FormRow[]).map(mapForm);

  const formIds = forms.map((form) => form.id);
  const { data: fieldsData } = formIds.length
    ? await db
        .from("form_fields")
        .select("id,form_id,label,field_key,type,required,options,help_text,sort_order")
        .in("form_id", formIds)
    : { data: [] };
  const fields = ((fieldsData ?? []) as FieldRow[]).map(mapField);

  return {
    packageDefinition,
    moduleBundles: buildModuleBundles(modules, forms, fields)
  };
}

export async function getPackageWorkspaceData(tenantId?: string): Promise<PackageWorkspaceData> {
  const workspace = await getTenantWorkspaceData(tenantId);
  const tenant = workspace.tenant;
  const supabase = createSupabaseAdminClient();

  if (!supabase || !tenant) {
    return {
      tenant,
      packageDefinition: null,
      projects: workspace.projects,
      moduleBundles: [],
      recordsByFormId: {}
    };
  }

  const config = await getTenantConfigData(tenant.id);
  const formIds = config.moduleBundles.flatMap((bundle) => bundle.forms.map((item) => item.form.id));

  if (formIds.length === 0) {
    return {
      tenant,
      packageDefinition: config.packageDefinition,
      projects: workspace.projects,
      moduleBundles: config.moduleBundles,
      recordsByFormId: {}
    };
  }

  const db = supabase as any;
  const { data: recordRows } = await db
    .from("records")
    .select("id,tenant_id,project_id,form_id,created_by,created_at,status")
    .eq("tenant_id", tenant.id)
    .in("form_id", formIds)
    .order("created_at", { ascending: false });

  const actorIds = ((recordRows ?? []) as RecordRow[]).map((record) => record.created_by).filter(Boolean);
  const { data: actorRows } = actorIds.length
    ? await db.from("profiles").select("id,full_name").in("id", actorIds)
    : { data: [] };

  const recordIds = ((recordRows ?? []) as RecordRow[]).map((record) => record.id);
  const { data: valueRows } = recordIds.length
    ? await db.from("field_values").select("id,record_id,field_id,value").in("record_id", recordIds)
    : { data: [] };

  const records = (recordRows ?? []) as RecordRow[];
  const values = (valueRows ?? []) as FieldValueRow[];
  const actors = new Map<string, string>(((actorRows ?? []) as Array<{ id: string; full_name: string | null }>).map((row) => [row.id, row.full_name ?? "Onbekend"]));
  const recordsByFormId = Object.fromEntries(
    formIds.map((formId) => [
      formId,
      records
        .filter((record) => record.form_id === formId)
        .map((record) => ({
          record: {
            id: record.id,
            tenantId: record.tenant_id,
            projectId: record.project_id,
            formId: record.form_id,
            createdBy: record.created_by,
            createdAt: record.created_at,
            status: record.status
          },
          actorName: record.created_by ? (actors.get(record.created_by) ?? "Onbekend") : null,
          values: values
            .filter((value) => value.record_id === record.id)
            .map((value) => ({
              id: value.id,
              recordId: value.record_id,
              fieldId: value.field_id,
              value: value.value
            }))
        }))
    ])
  ) as PackageWorkspaceData["recordsByFormId"];

  return {
    tenant,
    packageDefinition: config.packageDefinition,
    projects: workspace.projects,
    moduleBundles: config.moduleBundles,
    recordsByFormId
  };
}

export async function getTenantAdminData(tenantId?: string): Promise<TenantAdminData> {
  const workspace = await getPackageWorkspaceData(tenantId);
  const tenant = workspace.tenant;
  const supabase = createSupabaseAdminClient();

  if (!tenant || !supabase) {
    return {
      tenant,
      packageDefinition: workspace.packageDefinition,
      employees: [],
      projects: workspace.projects,
      companyProfile: null,
      companyDocuments: [],
      recentSubmissions: []
    };
  }

  const db = supabase as any;
  const [{ data: profileRows }, { data: recordRows }, { data: companyProfileRow }, { data: companyDocumentRows }] = await Promise.all([
    db
      .from("profiles")
      .select("id,full_name,email,role,created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false }),
    db
      .from("records")
      .select("id,project_id,form_id,created_by,created_at,status")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("company_profiles")
      .select("tenant_id,display_name,primary_color,secondary_color,logo_path,rie_notes,company_notes")
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    db
      .from("company_documents")
      .select("id,tenant_id,category,title,bucket_path,file_name,uploaded_by,created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
  ]);

  const employees = ((profileRows ?? []) as Array<{
    id: string;
    full_name: string;
    email: string;
    role: EmployeeSummary["role"];
    created_at: string;
  }>).map((profile) => ({
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at
  }));

  const formLookup = new Map(
    workspace.moduleBundles.flatMap((bundle) => bundle.forms.map(({ form }) => [form.id, form.name] as const))
  );
  const projectLookup = new Map(workspace.projects.map((project) => [project.id, project.clientName] as const));
  const employeeLookup = new Map(employees.map((employee) => [employee.id, employee.fullName] as const));

  const recentSubmissions = ((recordRows ?? []) as Array<{
    id: string;
    project_id: string | null;
    form_id: string;
    created_by: string | null;
    created_at: string;
    status: string;
  }>).map((record) => ({
    id: record.id,
    formName: formLookup.get(record.form_id) ?? "Onbekend formulier",
    projectName: record.project_id ? (projectLookup.get(record.project_id) ?? "Onbekend project") : null,
    actorName: record.created_by ? (employeeLookup.get(record.created_by) ?? "Onbekend") : null,
    createdAt: record.created_at,
    status: record.status
  }));

  return {
    tenant,
    packageDefinition: workspace.packageDefinition,
    employees,
    projects: workspace.projects,
    companyProfile: companyProfileRow ? mapCompanyProfile(companyProfileRow as CompanyProfileRow) : null,
    companyDocuments: ((companyDocumentRows ?? []) as CompanyDocumentRow[]).map(mapCompanyDocument),
    recentSubmissions
  };
}

export async function clonePackageForTenant(args: {
  tenantId: string;
  packageTemplateId: string;
  tenantName: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Missing Supabase admin client.");
  }

  const db = supabase as any;
  const { data: sourcePackage, error: sourceError } = await db
    .from("packages")
    .select("id,name,niche,description")
    .eq("id", args.packageTemplateId)
    .single();

  if (sourceError || !sourcePackage) {
    throw new Error(sourceError?.message ?? "Package template not found.");
  }

  const { data: tenantPackage, error: packageError } = await db
    .from("packages")
    .insert({
      name: `${args.tenantName} pakket`,
      niche: sourcePackage.niche,
      description: sourcePackage.description,
      is_template: false
    })
    .select("id")
    .single();

  if (packageError || !tenantPackage) {
    throw new Error(packageError?.message ?? "Tenant package could not be created.");
  }

  const { data: modules } = await db
    .from("package_modules")
    .select("id,name,slug,sort_order,is_enabled")
    .eq("package_id", args.packageTemplateId)
    .order("sort_order");

  const moduleIdMap = new Map<string, string>();

  for (const moduleRow of ((modules ?? []) as Array<{ id: string; name: string; slug: string; sort_order: number; is_enabled: boolean }>)) {
    const { data: newModule, error: moduleError } = await db
      .from("package_modules")
      .insert({
        package_id: tenantPackage.id,
        name: moduleRow.name,
        slug: moduleRow.slug,
        sort_order: moduleRow.sort_order,
        is_enabled: moduleRow.is_enabled
      })
      .select("id")
      .single();

    if (moduleError || !newModule) {
      throw new Error(moduleError?.message ?? "Module cloning failed.");
    }

    moduleIdMap.set(moduleRow.id, newModule.id);
  }

  const sourceModuleIds = [...moduleIdMap.keys()];
  const { data: forms } = sourceModuleIds.length
    ? await db
        .from("module_forms")
        .select("id,module_id,name,description,sort_order")
        .in("module_id", sourceModuleIds)
        .order("sort_order")
    : { data: [] };

  const formIdMap = new Map<string, string>();

  for (const formRow of ((forms ?? []) as Array<{ id: string; module_id: string; name: string; description: string; sort_order: number }>)) {
    const { data: newForm, error: formError } = await db
      .from("module_forms")
      .insert({
        module_id: moduleIdMap.get(formRow.module_id),
        name: formRow.name,
        description: formRow.description,
        sort_order: formRow.sort_order
      })
      .select("id")
      .single();

    if (formError || !newForm) {
      throw new Error(formError?.message ?? "Form cloning failed.");
    }

    formIdMap.set(formRow.id, newForm.id);
  }

  const sourceFormIds = [...formIdMap.keys()];
  const { data: fields } = sourceFormIds.length
    ? await db
        .from("form_fields")
        .select("form_id,label,field_key,type,required,options,help_text,sort_order")
        .in("form_id", sourceFormIds)
        .order("sort_order")
    : { data: [] };

  if ((fields ?? []).length > 0) {
    const clonedFields = (fields as Array<{
      form_id: string;
      label: string;
      field_key: string;
      type: DynamicFieldType;
      required: boolean;
      options: unknown;
      help_text: string;
      sort_order: number;
    }>).map((field) => ({
      form_id: formIdMap.get(field.form_id),
      label: field.label,
      field_key: field.field_key,
      type: field.type,
      required: field.required,
      options: field.options ?? [],
      help_text: field.help_text,
      sort_order: field.sort_order
    }));

    const { error: fieldCloneError } = await db.from("form_fields").insert(clonedFields);
    if (fieldCloneError) {
      throw new Error(fieldCloneError.message);
    }
  }

  const { error: tenantUpdateError } = await db
    .from("tenants")
    .update({ package_id: tenantPackage.id })
    .eq("id", args.tenantId);

  if (tenantUpdateError) {
    throw new Error(tenantUpdateError.message);
  }

  revalidatePath("/agency");
  revalidatePath(`/agency/tenants/${args.tenantId}/config`);
  revalidatePath(`/workspace?tenantId=${args.tenantId}`);

  return tenantPackage.id as string;
}
