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
