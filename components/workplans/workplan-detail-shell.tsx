"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { WorkplanSectionForm } from "@/components/workplans/workplan-section-form";
import type { ProjectWorkplanSection } from "@/lib/types";
import { workplanSections, type WorkplanSectionKey } from "@/lib/workplans";

function sectionCompletion(section: ProjectWorkplanSection | null | undefined) {
  if (!section) {
    return false;
  }

  return Object.values(section.payload ?? {}).some((value) => {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return Boolean(value);
  });
}

export function WorkplanDetailShell({
  workplanId,
  sections
}: {
  workplanId: string;
  sections: ProjectWorkplanSection[];
}) {
  const [activeSection, setActiveSection] = useState<WorkplanSectionKey>("algemeen");

  const sectionMap = useMemo(() => {
    return new Map(sections.map((section) => [section.sectionKey, section] as const));
  }, [sections]);

  const current = workplanSections.find((section) => section.key === activeSection) ?? workplanSections[0];
  const initialSection = sectionMap.get(current.key) ?? null;

  return (
    <div className="grid gap-6">
      <div className="overflow-x-auto rounded-[24px] border border-line bg-panel shadow-soft">
        <div className="flex min-w-max gap-0">
          {workplanSections.map((section, index) => {
            const complete = sectionCompletion(sectionMap.get(section.key));
            const active = section.key === activeSection;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`flex min-w-[170px] items-center justify-between gap-3 border-r border-line px-4 py-4 text-left transition ${
                  active ? "bg-white text-forest" : "bg-forest text-white"
                }`}
              >
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${active ? "text-ink/45" : "text-white/45"}`}>
                    Stap {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{section.title}</p>
                </div>
                <span
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold ${
                    complete
                      ? active
                        ? "bg-lime text-white"
                        : "bg-white text-forest"
                      : active
                        ? "bg-amber-100 text-amber-800"
                        : "bg-white/15 text-white"
                  }`}
                >
                  {complete ? "OK" : "!"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Panel>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">{current.title}</p>
        <h3 className="mt-2 text-2xl font-semibold text-forest">{current.title}</h3>
        <p className="mt-2 text-sm text-ink/60">{current.description}</p>
        <div className="mt-5">
          <WorkplanSectionForm
            workplanId={workplanId}
            sectionKey={current.key}
            title={current.title}
            initialSection={initialSection}
          />
        </div>
      </Panel>
    </div>
  );
}
