"use client";

import { useEffect } from "react";

export function VisitorPing() {
  useEffect(() => {
    fetch("/visit", { method: "GET", credentials: "omit" }).catch(() => {});
  }, []);
  return null;
}
