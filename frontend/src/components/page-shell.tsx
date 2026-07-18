"use client";

import type { ReactNode } from "react";
import { VerdictProvider } from "@/lib/verdict-context";
import { RequestVerdictDialog } from "@/components/request-verdict-dialog";
import { useVerdictDialog } from "@/lib/verdict-context";

function DialogController() {
  const { dialogOpen, setDialogOpen } = useVerdictDialog();
  return <RequestVerdictDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />;
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <VerdictProvider>
      {children}
      <DialogController />
    </VerdictProvider>
  );
}
