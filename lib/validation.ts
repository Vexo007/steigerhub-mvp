import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  packageTier: z.enum(["starter", "pro", "plus"]),
  niche: z.enum(["steigerbouw"])
});

export const createProjectSchema = z.object({
  tenantId: z.string().uuid(),
  clientName: z.string().min(2),
  siteAddress: z.string().min(3),
  siteCity: z.string().min(2),
  startDate: z.string().min(1),
  materialSummary: z.string().default(""),
  safetyStatus: z.enum(["missing", "pending", "approved"]).default("missing")
});

export const checkoutSchema = z.object({
  tenantId: z.string().min(1),
  packageTier: z.enum(["starter", "pro", "plus"])
});

export const createCustomerSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(2),
  notes: z.string().default(""),
  contactName: z.string().default(""),
  contactEmail: z.string().default(""),
  contactPhone: z.string().default(""),
  roleLabel: z.string().default(""),
  addressLabel: z.string().default("Hoofdadres"),
  street: z.string().default(""),
  postalCode: z.string().default(""),
  city: z.string().default(""),
  country: z.string().default("Nederland"),
  accessNotes: z.string().default("")
});

export const createProjectTaskSchema = z.object({
  tenantId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(2),
  taskType: z.string().min(2),
  assignedTo: z.string().uuid().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().nullable().optional(),
  notes: z.string().default("")
});

export const createIncidentSchema = z.object({
  tenantId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
  title: z.string().min(2),
  description: z.string().default(""),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium")
});
