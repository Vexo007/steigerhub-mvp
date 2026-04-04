import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAgencyDashboardData, getTenantWorkspaceData } from "@/lib/data";
import type {
  DynamicFieldType,
  FieldDefinition,
  FormDefinition,
  ModuleBundle,
  ModuleDefinition,
  PackageDefinition,
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
  created_at: string;
  status: string;
};

type FieldValueRow = {
  id: string;
  record_id: string;
  field_id: string;
  value: unknown;
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
    .select("id,tenant_id,project_id,form_id,created_at,status")
    .eq("tenant_id", tenant.id)
    .in("form_id", formIds)
    .order("created_at", { ascending: false });

  const recordIds = ((recordRows ?? []) as RecordRow[]).map((record) => record.id);
  const { data: valueRows } = recordIds.length
    ? await db.from("field_values").select("id,record_id,field_id,value").in("record_id", recordIds)
    : { data: [] };

  const records = (recordRows ?? []) as RecordRow[];
  const values = (valueRows ?? []) as FieldValueRow[];
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
            createdAt: record.created_at,
            status: record.status
          },
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
