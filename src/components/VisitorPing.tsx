"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorPing() {
  const pathname = usePathname();
  useEffect(() => {
    fetch(`/api/visit?page=${encodeURIComponent(pathname)}`, { method: "GET", credentials: "omit" }).catch(() => {});
  }, [pathname]);
  return null;
}
