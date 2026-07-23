"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, X, LogOut, User } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function TopBar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    notificationsApi
      .unreadCount()
      .then((res) => setUnreadCount(res.data.data.unreadCount))
      .catch(() => {});
  }, []);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E3E3E3] h-14 flex items-center px-4">
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1 -ml-1 text-[#333333] hover:text-[#DB0011] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo + Name */}
        <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
          <DiamondLogo />
          <span className="font-semibold text-[#333333] text-base tracking-tight">
            Lumina Bank
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <LanguageSwitcher compact />
          <Link
            href="/notifications"
            className="relative p-1 text-[#333333] hover:text-[#DB0011] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#DB0011] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => { router.push("/profile"); router.refresh(); }}
            className="p-1 text-[#333333] hover:text-[#DB0011] transition-colors"
            aria-label="Profile"
          >
            <User size={22} />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 bg-[#DB0011] text-white text-xs font-medium px-3 h-8 rounded-sm hover:bg-[#b8000e] transition-colors"
            aria-label="Log off"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Log off</span>
          </button>
        </div>
      </header>

      {/* Slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <div className="bg-[#DB0011] px-4 py-5 flex items-center justify-between">
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <DiamondLogo white />
                <span className="text-white font-semibold text-base">Lumina Bank</span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="px-4 py-4 border-b border-[#E3E3E3] flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#DB0011] flex items-center justify-center flex-shrink-0">
                  <GenderAvatar gender={user.gender} size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-[#767676]">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-2">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    router.refresh();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-[#333333] hover:bg-[#F8F8F8] border-b border-[#E3E3E3]/50"
                >
                  <span>{item.label}</span>
                  <span className="text-[#DB0011] font-bold">›</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E3E3E3]">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 text-sm text-[#DB0011] font-medium py-2"
              >
                <LogOut size={16} />
                Log off
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const menuItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transfer", label: "Transfer" },
  { href: "/standing-orders", label: "Standing Orders" },
  { href: "/direct-debits", label: "Direct Debits" },
  { href: "/pay", label: "Bill Payments" },
  { href: "/topup", label: "Add Money" },
  { href: "/beneficiaries", label: "Saved Payees" },
  { href: "/cards", label: "Cards" },
  { href: "/analytics", label: "Spending Analytics" },
  { href: "/rates", label: "Exchange Rates" },
  { href: "/loans", label: "Loans" },
  { href: "/mortgage", label: "Mortgage" },
  { href: "/investments", label: "Investments" },
  { href: "/goals", label: "Savings Goals" },
  { href: "/disputes", label: "My Disputes" },
  { href: "/support", label: "Help & Support" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile & Settings" },
];

function GenderAvatar({ gender, size = 20 }: { gender?: string; size?: number }) {
  if (gender === "MALE") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Head */}
        <circle cx="12" cy="7" r="4" fill="white" />
        {/* Shoulders */}
        <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="white" />
      </svg>
    );
  }
  if (gender === "FEMALE") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Head */}
        <circle cx="12" cy="7" r="4" fill="white" />
        {/* Hair */}
        <path d="M8 5.5C8 3.5 9.8 2 12 2s4 1.5 4 3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Shoulders with slight curve */}
        <path d="M5 22c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="white" />
      </svg>
    );
  }
  // OTHER or undefined — generic person
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="white" />
      <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="white" />
    </svg>
  );
}

function DiamondLogo({ white = false }: { white?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L22 12L12 22L2 12L12 2Z"
        fill={white ? "white" : "#DB0011"}
      />
      <path
        d="M12 6L18 12L12 18L6 12L12 6Z"
        fill={white ? "rgba(255,255,255,0.3)" : "rgba(219,0,17,0.35)"}
      />
    </svg>
  );
}
