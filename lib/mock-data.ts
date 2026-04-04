import type {
  AppUser,
  CustomFieldDefinition,
  Project,
  ProjectFile,
  ProjectNote,
  SubscriptionSummary,
  Tenant,
  TenantModuleSetting
} from "@/lib/types";

export const mockUser: AppUser = {
  id: "user_agency_1",
  fullName: "Bas van Bureau",
  email: "bas@steigerhub.nl",
  role: "agency_admin",
  tenantId: null
};

export const tenants: Tenant[] = [
  {
    id: "tenant_steigerplus",
    name: "SteigerPlus Noord",
    niche: "steigerbouw",
    packageTier: "pro",
    status: "active",
    stripeCustomerId: "cus_steigerplus",
    contactName: "J. de Vries",
    contactEmail: "planning@steigerplus.nl",
    activeUsers: 8,
    projectCount: 14
  },
  {
    id: "tenant_veiligzicht",
    name: "VeiligZicht Steigers",
    niche: "steigerbouw",
    packageTier: "starter",
    status: "trialing",
    stripeCustomerId: "cus_veiligzicht",
    contactName: "M. Peters",
    contactEmail: "info@veiligzicht.nl",
    activeUsers: 3,
    projectCount: 4
  }
];

export const subscriptions: SubscriptionSummary[] = [
  {
    tenantId: "tenant_steigerplus",
    packageTier: "pro",
    amountMonthly: 149,
    stripePriceId: "price_pro",
    nextBillingDate: "2026-04-21",
    paymentState: "paid"
  },
  {
    tenantId: "tenant_veiligzicht",
    packageTier: "starter",
    amountMonthly: 79,
    stripePriceId: "price_starter",
    nextBillingDate: "2026-04-12",
    paymentState: "trialing"
  }
];

export const tenantModules: TenantModuleSetting[] = [
  { tenantId: "tenant_steigerplus", moduleKey: "materials", enabled: true },
  { tenantId: "tenant_steigerplus", moduleKey: "blueprints", enabled: true },
  { tenantId: "tenant_steigerplus", moduleKey: "safety_docs", enabled: true },
  { tenantId: "tenant_steigerplus", moduleKey: "notes", enabled: true },
  { tenantId: "tenant_steigerplus", moduleKey: "photos", enabled: true },
  { tenantId: "tenant_steigerplus", moduleKey: "timeline", enabled: true }
];

export const customFields: CustomFieldDefinition[] = [
  {
    id: "field_contact_on_site",
    tenantId: "tenant_steigerplus",
    label: "Contactpersoon op locatie",
    fieldKey: "contact_on_site",
    inputType: "text",
    enabled: true
  },
  {
    id: "field_delivery_slot",
    tenantId: "tenant_steigerplus",
    label: "Levertijdvak",
    fieldKey: "delivery_slot",
    inputType: "text",
    enabled: true
  }
];

export const projects: Project[] = [
  {
    id: "proj_1",
    tenantId: "tenant_steigerplus",
    clientName: "Woonstaete BV",
    siteAddress: "Havenstraat 17",
    siteCity: "Groningen",
    status: "active",
    createdAt: "2026-03-25",
    startDate: "2026-04-04",
    materialSummary: "72 frames, 110 planken, 18 consoles",
    safetyStatus: "approved"
  },
  {
    id: "proj_2",
    tenantId: "tenant_steigerplus",
    clientName: "Zonlicht Vastgoed",
    siteAddress: "Prinsenkade 102",
    siteCity: "Zwolle",
    status: "inspection",
    createdAt: "2026-03-17",
    startDate: "2026-04-01",
    materialSummary: "48 frames, 80 planken, 6 traptorens",
    safetyStatus: "pending"
  }
];

export const projectFiles: ProjectFile[] = [
  {
    id: "file_1",
    tenantId: "tenant_steigerplus",
    projectId: "proj_1",
    kind: "blueprint",
    fileName: "bouwtekening-havenstraat.pdf",
    uploadedAt: "2026-04-01"
  },
  {
    id: "file_2",
    tenantId: "tenant_steigerplus",
    projectId: "proj_1",
    kind: "safety",
    fileName: "veiligheidsplan-v3.pdf",
    uploadedAt: "2026-04-02"
  }
];

export const projectNotes: ProjectNote[] = [
  {
    id: "note_1",
    projectId: "proj_1",
    tenantId: "tenant_steigerplus",
    author: "Bas van Bureau",
    createdAt: "2026-04-02T08:10:00.000Z",
    body: "Klant wil extra afscherming aan straatzijde. Voor montage eerst verkeersmaatregel afstemmen."
  },
  {
    id: "note_2",
    projectId: "proj_2",
    tenantId: "tenant_steigerplus",
    author: "Lisa Planner",
    createdAt: "2026-04-02T14:20:00.000Z",
    body: "Inspectie-document nog niet ondertekend. Upload verwacht voor einde dag."
  }
];

