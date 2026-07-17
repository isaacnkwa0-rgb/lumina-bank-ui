"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const MoreSheetContext = createContext<{
  open: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}>({ open: false, openSheet: () => {}, closeSheet: () => {} });

export function MoreSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MoreSheetContext.Provider
      value={{ open, openSheet: () => setOpen(true), closeSheet: () => setOpen(false) }}
    >
      {children}
    </MoreSheetContext.Provider>
  );
}

export function useMoreSheet() {
  return useContext(MoreSheetContext);
}
