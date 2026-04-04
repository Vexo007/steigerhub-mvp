import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthorizedTenantId } from "@/lib/auth";
import { getPackageWorkspaceData } from "@/lib/package-builder-data";
import type { AppUser, PackageWorkspaceData, Project, ProjectTaskCard, ProjectWorkplan, ProjectWorkplanSection, Tenant } from "@/lib/types";

type ProjectRow = {
  id: string;
  tenant_id: string;
  client_name: string;
  site_address: string;
  site_city: string;
  status: Project["status"];
  created_at: string;
  start_date: string | null;
  material_summary: string;
  safety_status: Project["safetyStatus"];
};

type WorkplanRow = {
  id: string;
  tenant_id: string;
  project_id: string;
  title: string;
  plan_type: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type WorkplanSectionRow = {
  id: string;
  workplan_id: string;
  section_key: string;
  title: string;
  payload: Record<string, unknown> | null;
  updated_at: string;
};

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    clientName: row.client_name,
    siteAddress: row.site_address,
    siteCity: row.site_city,
    status: row.status,
    createdAt: row.created_at,
    startDate: row.start_date ?? row.created_at,
    materialSummary: row.material_summary,
    safetyStatus: row.safety_status
  };
}

function mapWorkplan(row: WorkplanRow): ProjectWorkplan {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    projectId: row.project_id,
    title: row.title,
    planType: row.plan_type,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapWorkplanSection(row: WorkplanSectionRow): ProjectWorkplanSection {
  return {
    id: row.id,
    workplanId: row.workplan_id,
    sectionKey: row.section_key,
    title: row.title,
    payload: row.payload ?? {},
    updatedAt: row.updated_at
  };
}

export async function getAuthorizedProjectContext(user: AppUser, projectId: string): Promise<{
  tenantId: string;
  project: Project;
}> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Missing Supabase admin client.");
  }

  const db = supabase as any;
  const { data: projectRow } = await db
    .from("projects")
    .select("id,tenant_id,client_name,site_address,site_city,status,created_at,start_date,material_summary,safety_status")
    .eq("id", projectId)
    .single();

  if (!projectRow) {
    throw new Error("Project niet gevonden.");
  }

  const tenantId = getAuthorizedTenantId(user, (projectRow as ProjectRow).tenant_id) ?? (projectRow as ProjectRow).tenant_id;

  return {
    tenantId,
    project: mapProject(projectRow as ProjectRow)
  };
}

export async function getProjectTaskData(user: AppUser, projectId: string): Promise<{
  tenant: Tenant | null;
  project: Project;
  workspace: PackageWorkspaceData;
  tasks: ProjectTaskCard[];
}> {
  const { tenantId, project } = await getAuthorizedProjectContext(user, projectId);
  const workspace = await getPackageWorkspaceData(tenantId);

  const tasks = workspace.moduleBundles.map((bundle) => {
    const isWorkplan = bundle.module.slug === "werkplan-generator";
    return {
      key: bundle.module.id,
      label: bundle.module.name,
      description: isWorkplan
        ? "Start of beheer hier een werkplan zoals Algemeen VGM plan per project."
        : `Open ${bundle.forms.length} formulier${bundle.forms.length === 1 ? "" : "en"} voor dit project.`,
      href: isWorkplan
        ? `/workspace/project/${project.id}/workplans`
        : `/workspace?tenantId=${tenantId}&projectId=${project.id}#module-${bundle.module.slug}`,
      variant: isWorkplan ? "generator" : "form"
    } satisfies ProjectTaskCard;
  });

  return {
    tenant: workspace.tenant,
    project,
    workspace,
    tasks
  };
}

export async function getProjectWorkplans(user: AppUser, projectId: string): Promise<{
  tenant: Tenant | null;
  project: Project;
  workplans: ProjectWorkplan[];
}> {
  const { tenantId, project } = await getAuthorizedProjectContext(user, projectId);
  const workspace = await getPackageWorkspaceData(tenantId);
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      tenant: workspace.tenant,
      project,
      workplans: []
    };
  }

  const db = supabase as any;
  const { data: workplanRows } = await db
    .from("project_workplans")
    .select("id,tenant_id,project_id,title,plan_type,status,created_by,created_at,updated_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  return {
    tenant: workspace.tenant,
    project,
    workplans: ((workplanRows ?? []) as WorkplanRow[]).map(mapWorkplan)
  };
}

export async function getWorkplanDetail(user: AppUser, workplanId: string): Promise<{
  tenant: Tenant | null;
  project: Project;
  workplan: ProjectWorkplan;
  sections: ProjectWorkplanSection[];
}> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Missing Supabase admin client.");
  }

  const db = supabase as any;
  const { data: workplanRow } = await db
    .from("project_workplans")
    .select("id,tenant_id,project_id,title,plan_type,status,created_by,created_at,updated_at")
    .eq("id", workplanId)
    .single();

  if (!workplanRow) {
    throw new Error("Werkplan niet gevonden.");
  }

  const mappedWorkplan = mapWorkplan(workplanRow as WorkplanRow);
  const { tenantId, project } = await getAuthorizedProjectContext(user, mappedWorkplan.projectId);
  const workspace = await getPackageWorkspaceData(tenantId);

  const { data: sectionRows } = await db
    .from("project_workplan_sections")
    .select("id,workplan_id,section_key,title,payload,updated_at")
    .eq("workplan_id", workplanId)
    .order("updated_at", { ascending: true });

  return {
    tenant: workspace.tenant,
    project,
    workplan: mappedWorkplan,
    sections: ((sectionRows ?? []) as WorkplanSectionRow[]).map(mapWorkplanSection)
  };
}
