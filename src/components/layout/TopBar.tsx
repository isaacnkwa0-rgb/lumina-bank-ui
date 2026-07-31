"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, X, LogOut, Settings, Home, Landmark, ArrowLeftRight,
  CreditCard, Receipt, BarChart3, Percent, Target, TrendingUp,
  Bitcoin, ShieldCheck, Building2, Users, Banknote, AlertTriangle,
  Repeat2, HelpCircle, ChevronRight, Menu,
} from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",     label: "Home",             icon: Home },
      { href: "/accounts",      label: "Accounts",         icon: Landmark },
      { href: "/transactions",  label: "Transactions",     icon: Receipt },
      { href: "/notifications", label: "Notifications",    icon: Bell },
    ],
  },
  {
    label: "Move Money",
    items: [
      { href: "/transfer",        label: "Transfer",         icon: ArrowLeftRight },
      { href: "/standing-orders", label: "Standing Orders",  icon: Repeat2 },
      { href: "/direct-debits",   label: "Direct Debits",    icon: Repeat2 },
      { href: "/beneficiaries",   label: "Beneficiaries",    icon: Users },
    ],
  },
  {
    label: "Cards & Credit",
    items: [
      { href: "/cards",    label: "Cards",    icon: CreditCard },
      { href: "/loans",    label: "Loans",    icon: Banknote },
      { href: "/mortgage", label: "Mortgage", icon: Building2 },
    ],
  },
  {
    label: "Grow",
    items: [
      { href: "/investments", label: "Investments",   icon: TrendingUp },
      { href: "/goals",       label: "Savings Goals", icon: Target },
      { href: "/crypto",      label: "Crypto",        icon: Bitcoin },
      { href: "/insurance",   label: "Insurance",     icon: ShieldCheck },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/analytics", label: "Analytics",       icon: BarChart3 },
      { href: "/rates",     label: "Exchange Rates",  icon: Percent },
      { href: "/disputes",  label: "Disputes",        icon: AlertTriangle },
    ],
  },
];

function DiamondLogo({ white = false }: { white?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill={white ? "white" : "#DB0011"} />
      <path d="M12 6L18 12L12 18L6 12L12 6Z" fill={white ? "rgba(255,255,255,0.3)" : "rgba(219,0,17,0.35)"} />
    </svg>
  );
}

export function TopBar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    notificationsApi
      .unreadCount()
      .then((res) => setUnreadCount(res.data.data.unreadCount))
      .catch(() => {});
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "LB";

  function navigate(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#EEEEEE] h-[60px] flex items-center px-4 gap-3 shadow-sm">

        {/* Hamburger — opens left nav drawer */}
        <button
          onClick={() => setMenuOpen(true)}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#F5F5F5] text-[#555555] hover:bg-[#EEEEEE] transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>

        {/* Logo — centred */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#DB0011] to-[#8B000A] flex items-center justify-center flex-shrink-0">
            <DiamondLogo white />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight tracking-wide">Lumina Bank</p>
            {user && (
              <p className="text-[10px] text-[#AAAAAA] leading-none truncate">
                {getGreeting()}, {user.firstName}
              </p>
            )}
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Notification bell */}
          <Link
            href="/notifications"
            className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-[#F5F5F5] text-[#555555] hover:bg-[#EEEEEE] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#DB0011] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar — goes to profile */}
          <Link
            href="/profile"
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#DB0011] to-[#8B000A] flex items-center justify-center flex-shrink-0 shadow-sm"
            aria-label="Profile"
          >
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </Link>
        </div>
      </header>

      {/* Left slide-out nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel — slides from LEFT */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl">

            {/* Header */}
            <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-12 pb-5">
              <div className="flex items-center justify-between mb-4">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                  <DiamondLogo white />
                  <span className="text-white font-bold text-sm tracking-wide">Lumina Bank</span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-white/20 text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[13px] font-bold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-white/60 text-[10px] truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
              {menuGroups.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="px-2 pt-2 pb-1 text-[9px] font-bold text-[#BBBBBB] uppercase tracking-[0.18em]">
                    {group.label}
                  </p>
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <button
                        key={href}
                        onClick={() => navigate(href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] transition-all duration-150 text-left",
                          active
                            ? "bg-red-50 text-[#DB0011] font-semibold"
                            : "text-[#555555] hover:bg-[#F8F8F8]"
                        )}
                      >
                        <div className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",
                          active ? "bg-[#DB0011]" : "bg-[#F2F2F2]"
                        )}>
                          <Icon size={13} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-white" : "text-[#888888]"} />
                        </div>
                        <span className="flex-1">{label}</span>
                        {active && <ChevronRight size={11} className="text-[#DB0011] opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-[#EEEEEE] px-3 py-3 space-y-1 flex-shrink-0">
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-50 text-[#DB0011] text-[13px] font-semibold"
              >
                <HelpCircle size={15} strokeWidth={2} />
                Help & Support
                <ChevronRight size={11} className="ml-auto opacity-50" />
              </Link>
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] text-[#555555] hover:bg-[#F8F8F8] transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-[#F2F2F2] flex items-center justify-center">
                  <Settings size={13} strokeWidth={1.8} className="text-[#888888]" />
                </div>
                Profile & Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] text-[#DB0011] hover:bg-red-50 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-[#FFF0F0] flex items-center justify-center">
                  <LogOut size={13} strokeWidth={1.8} className="text-[#DB0011]" />
                </div>
                Log off
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
