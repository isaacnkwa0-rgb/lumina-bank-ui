"use client";

import { useEffect } from "react";

export function VisitorPing() {
  useEffect(() => {
    fetch("/api/visit", { method: "GET", credentials: "omit" }).catch(() => {});
  }, []);
  return null;
}
