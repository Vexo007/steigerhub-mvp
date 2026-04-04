import { cookies } from "next/headers";
import type { AppUser, UserRole } from "@/lib/types";
import { mockUser } from "@/lib/mock-data";

export async function getCurrentUser(): Promise<AppUser> {
  const cookieStore = await cookies();
  const role = (cookieStore.get("demo-role")?.value as UserRole | undefined) ?? mockUser.role;

  if (role === "agency_admin") {
    return mockUser;
  }

  return {
    id: "user_tenant_1",
    fullName: "Lisa Planner",
    email: "planner@steigerplus.nl",
    role,
    tenantId: "tenant_steigerplus"
  };
}

