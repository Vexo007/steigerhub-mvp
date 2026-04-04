import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

type ProfileRow = {
  id: string;
  tenant_id: string | null;
  role: AppUser["role"];
  full_name: string;
  email: string;
};

function mapProfile(row: ProfileRow): AppUser {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    role: row.role,
    fullName: row.full_name,
    email: row.email
  };
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const db = admin as any;
  const { data: profile } = await db
    .from("profiles")
    .select("id,tenant_id,role,full_name,email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return mapProfile(profile as ProfileRow);
}

export async function requireAppUser() {
  const user = await getCurrentAppUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAgencyUser() {
  const user = await requireAppUser();
  if (user.role !== "agency_admin") {
    redirect("/app");
  }

  return user;
}

export async function getAgencyBootstrapState() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return { hasAgencyAdmin: false };
  }

  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "agency_admin");
  return { hasAgencyAdmin: (count ?? 0) > 0 };
}

export function getAuthorizedTenantId(user: AppUser, requestedTenantId?: string | null) {
  if (user.role === "agency_admin") {
    return requestedTenantId ?? null;
  }

  if (!user.tenantId) {
    throw new Error("Deze gebruiker is nog niet aan een tenant gekoppeld.");
  }

  if (requestedTenantId && requestedTenantId !== user.tenantId) {
    throw new Error("Je hebt geen toegang tot deze tenant.");
  }

  return user.tenantId;
}

export function getDefaultAppPath(user: AppUser) {
  return user.role === "agency_admin" ? "/agency" : "/workspace";
}
