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
