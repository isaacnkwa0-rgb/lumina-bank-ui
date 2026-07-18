"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5]">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 bg-[#1a1a2e] h-14 flex items-center px-4 gap-3">
        <Link
          href="/dashboard"
          className="p-1 -ml-1 text-white/70 hover:text-white transition-colors"
          aria-label="Back to app"
        >
          <ArrowLeft size={20} />
        </Link>
        <ShieldCheck size={18} className="text-[#DB0011]" />
        <span className="text-white font-semibold text-base tracking-tight">
          Admin Console
        </span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-white/30">
          Internal
        </span>
      </header>

      <main className="flex-1 lg:px-8 lg:py-6">{children}</main>
    </div>
  );
}
