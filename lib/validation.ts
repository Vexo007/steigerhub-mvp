import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  packageTier: z.enum(["starter", "pro", "plus"]),
  niche: z.enum(["steigerbouw"])
});

export const checkoutSchema = z.object({
  tenantId: z.string().min(1),
  packageTier: z.enum(["starter", "pro", "plus"])
});

