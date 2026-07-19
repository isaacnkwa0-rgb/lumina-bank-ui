"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { MoreSheetProvider } from "@/lib/more-sheet-context";
import { KycBanner } from "@/components/KycBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MoreSheetProvider>
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="flex flex-col min-h-screen bg-[#F8F8F8] lg:ml-60">
        {/* TopBar — mobile only (lg: hidden) */}
        <TopBar />
        <KycBanner />
        <main className="flex-1 pb-20 lg:pb-8 lg:px-8">{children}</main>
        {/* BottomNav — mobile only */}
        <BottomNav />
      </div>
    </MoreSheetProvider>
  );
}
