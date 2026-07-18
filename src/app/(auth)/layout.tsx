"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
      {/* Red top strip */}
      <div className="bg-[#DB0011] h-2 w-full" />

      {/* Header */}
      <header className="bg-white border-b border-[#E3E3E3] py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <DiamondLogo />
          <span className="font-semibold text-[#333333] text-lg tracking-tight">
            Lumina Bank
          </span>
        </Link>
        <LanguageSwitcher compact />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#767676]">
        © 2026 Lumina Bank. All rights reserved. Authorised by the FCA.
      </footer>
    </div>
  );
}

function DiamondLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#DB0011" />
      <path
        d="M12 6L18 12L12 18L6 12L12 6Z"
        fill="rgba(219,0,17,0.35)"
      />
    </svg>
  );
}
