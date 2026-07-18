"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type VerdictContextValue = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
};

const VerdictContext = createContext<VerdictContextValue | null>(null);

export function VerdictProvider({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <VerdictContext.Provider value={{ dialogOpen, setDialogOpen }}>
      {children}
    </VerdictContext.Provider>
  );
}

export function useVerdictDialog() {
  const ctx = useContext(VerdictContext);
  if (!ctx) throw new Error("useVerdictDialog must be used within VerdictProvider");
  return ctx;
}
