"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModuleToggleButton({
  moduleId,
  tenantId,
  isEnabled
}: {
  moduleId: string;
  tenantId: string;
  isEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/agency/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, isEnabled: !isEnabled })
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink"
    >
      {loading ? "..." : isEnabled ? "Zet uit" : "Zet aan"}
    </button>
  );
}

