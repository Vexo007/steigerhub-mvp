import { redirect } from "next/navigation";
import { getDefaultAppPath, requireAppUser } from "@/lib/auth";

export default async function AppEntryPage() {
  const user = await requireAppUser();
  redirect(getDefaultAppPath(user));
}
