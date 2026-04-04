export type UserRole = "agency_admin" | "tenant_admin" | "tenant_staff";
export type TenantStatus = "trialing" | "active" | "past_due" | "paused" | "blocked";
export type Niche = "steigerbouw";
export type PackageTier = "starter" | "pro" | "plus";
export type ModuleKey =
  | "materials"
  | "blueprints"
  | "safety_docs"
  | "notes"
  | "photos"
  | "timeline";
export type ProjectStatus = "draft" | "planned" | "active" | "inspection" | "completed";
export type FileKind = "photo" | "blueprint" | "safety" | "other";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface EmployeeSummary {
  id: string;
  fullName: string;
  email: string;
  role: Exclude<UserRole, "agency_admin">;
  createdAt: string;
}

export interface CompanyProfile {
  tenantId: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoPath: string | null;
  rieNotes: string;
  companyNotes: string;
}

export interface CompanyDocument {
  id: string;
  tenantId: string;
  category: "rie" | "contract" | "certificate" | "other";
  title: string;
  bucketPath: string;
  fileName: string;
  uploadedBy: string | null;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  niche: Niche;
  packageTier: PackageTier;
  status: TenantStatus;
  stripeCustomerId: string | null;
  contactName: string;
  contactEmail: string;
  activeUsers: number;
  projectCount: number;
}

export interface TenantModuleSetting {
  tenantId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
}

export interface Project {
  id: string;
  tenantId: string;
  clientName: string;
  siteAddress: string;
  siteCity: string;
  status: ProjectStatus;
  createdAt: string;
  startDate: string;
  materialSummary: string;
  safetyStatus: "missing" | "pending" | "approved";
}

export interface ProjectFile {
  id: string;
  projectId: string;
  tenantId: string;
  kind: FileKind;
  fileName: string;
  uploadedAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  tenantId: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  label: string;
  fieldKey: string;
  inputType: "text" | "textarea" | "date" | "number";
  enabled: boolean;
}

export interface SubscriptionSummary {
  tenantId: string;
  packageTier: PackageTier;
  amountMonthly: number;
  stripePriceId: string;
  nextBillingDate: string;
  paymentState: "paid" | "past_due" | "trialing";
}

export interface AgencyDashboardData {
  tenants: Tenant[];
  subscriptions: SubscriptionSummary[];
  source: "mock" | "supabase";
}

export interface TenantWorkspaceData {
  tenant: Tenant | null;
  projects: Project[];
  projectFiles: ProjectFile[];
  projectNotes: ProjectNote[];
  modules: TenantModuleSetting[];
  fields: CustomFieldDefinition[];
  source: "mock" | "supabase";
}

export type DynamicFieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "photo";

export interface PackageDefinition {
  id: string;
  name: string;
  niche: Niche;
  description: string;
  isTemplate: boolean;
}

export interface ModuleDefinition {
  id: string;
  packageId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface FormDefinition {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface FieldDefinition {
  id: string;
  formId: string;
  label: string;
  fieldKey: string;
  type: DynamicFieldType;
  required: boolean;
  options: string[];
  helpText: string;
  sortOrder: number;
}

export interface DynamicRecord {
  id: string;
  tenantId: string;
  projectId: string | null;
  formId: string;
  createdBy: string | null;
  createdAt: string;
  status: string;
}

export interface DynamicFieldValue {
  id: string;
  recordId: string;
  fieldId: string;
  value: unknown;
}

export interface ModuleBundle {
  module: ModuleDefinition;
  forms: Array<{
    form: FormDefinition;
    fields: FieldDefinition[];
  }>;
}

export interface PackageWorkspaceData {
  tenant: Tenant | null;
  packageDefinition: PackageDefinition | null;
  projects: Project[];
  moduleBundles: ModuleBundle[];
  recordsByFormId: Record<
    string,
    Array<{
      record: DynamicRecord;
      actorName: string | null;
      values: DynamicFieldValue[];
    }>
  >;
}

export interface ProjectTaskCard {
  key: string;
  label: string;
  description: string;
  href: string;
  variant: "generator" | "form";
}

export interface ProjectWorkplan {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  planType: string;
  status: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWorkplanSection {
  id: string;
  workplanId: string;
  sectionKey: string;
  title: string;
  payload: Record<string, unknown>;
  updatedAt: string;
}

export interface TenantConfigData {
  tenant: Tenant | null;
  packageDefinition: PackageDefinition | null;
  packages: PackageDefinition[];
  moduleBundles: ModuleBundle[];
}

export interface PackageTemplateData {
  packageDefinition: PackageDefinition | null;
  moduleBundles: ModuleBundle[];
}

export interface TenantAdminData {
  tenant: Tenant | null;
  packageDefinition: PackageDefinition | null;
  employees: EmployeeSummary[];
  projects: Project[];
  companyProfile: CompanyProfile | null;
  companyDocuments: CompanyDocument[];
  recentSubmissions: Array<{
    id: string;
    formName: string;
    projectName: string | null;
    actorName: string | null;
    createdAt: string;
    status: string;
  }>;
}
