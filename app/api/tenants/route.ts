import { NextResponse } from "next/server";
import { createTenantSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createTenantSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Tenant payload gevalideerd. Koppel hier Supabase inserts en uitnodigingen.",
    data: parsed.data
  });
}

