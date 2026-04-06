"use client";

import { useEffect } from "react";

export function WorkplanPreviewAutoPrint({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.print();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [autoPrint]);

  return null;
}
