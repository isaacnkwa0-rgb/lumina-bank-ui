"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Home, Landmark, ArrowLeftRight, CreditCard, Receipt,
  BarChart2, TrendingUp, Globe, Target, PiggyBank,
  Bell, User, ShieldCheck, Building, Bitcoin,
  LogOut, ChevronRight, RefreshCw, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",    label: "Home",            icon: Home },
      { href: "/accounts",     label: "Accounts",        icon: Landmark },
      { href: "/transactions", label: "Transactions",    icon: Receipt },
      { href: "/notifications",label: "Notifications",   icon: Bell },
    ],
  },
  {
    label: "Move Money",
    items: [
      { href: "/transfer",          label: "Transfer",          icon: ArrowLeftRight },
      { href: "/standing-orders",   label: "Standing Orders",   icon: RefreshCw },
      { href: "/direct-debits",     label: "Direct Debits",     icon: Landmark },
      { href: "/beneficiaries",     label: "Saved Payees",      icon: PiggyBank },
    ],
  },
  {
    label: "Cards & Credit",
    items: [
      { href: "/cards",        label: "Cards",           icon: CreditCard },
      { href: "/loans",        label: "Loans",           icon: CreditCard },
      { href: "/mortgage",     label: "Mortgage",        icon: Building },
    ],
  },
  {
    label: "Grow",
    items: [
      { href: "/investments",  label: "Investments",     icon: TrendingUp },
      { href: "/goals",        label: "Savings Goals",   icon: Target },
      { href: "/crypto",       label: "Crypto",          icon: Bitcoin },
      { href: "/insurance",    label: "Insurance",       icon: ShieldCheck },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/analytics",    label: "Analytics",       icon: BarChart2 },
      { href: "/rates",        label: "Exchange Rates",  icon: Globe },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/disputes",     label: "My Disputes",     icon: AlertCircle },
    ],
  },
];

function DiamondLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="white" />
      <path d="M12 6L18 12L12 18L6 12L12 6Z" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E3E3E3] z-30">
      {/* Logo */}
      <Link href="/dashboard" className="bg-[#DB0011] px-4 py-4 flex items-center gap-2.5 flex-shrink-0 hover:bg-[#c4000f] transition-colors">
        <DiamondLogo />
        <div>
          <p className="text-white font-bold text-sm leading-tight">Lumina Bank</p>
          <p className="text-white/60 text-[10px] leading-tight">Secure Banking</p>
        </div>
      </Link>

      {/* User pill */}
      {user && (
        <div className="px-3 py-3 border-b border-[#E3E3E3] flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#DB0011]/10 flex items-center justify-center flex-shrink-0">
            <User size={15} className="text-[#DB0011]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#333333] truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-[#767676] truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-4 py-1.5 text-[9px] font-bold text-[#AAAAAA] uppercase tracking-widest">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-red-50 text-[#DB0011] font-semibold border-r-2 border-[#DB0011]"
                      : "text-[#555555] hover:bg-[#F8F8F8] hover:text-[#333333]"
                  )}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                  <span>{label}</span>
                  {active && <ChevronRight size={12} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[#E3E3E3] p-3 space-y-1 flex-shrink-0">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors",
            pathname.startsWith("/profile")
              ? "bg-red-50 text-[#DB0011] font-semibold"
              : "text-[#555555] hover:bg-[#F8F8F8]"
          )}
        >
          <User size={15} />
          Profile & Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-[#DB0011] hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          Log off
        </button>
      </div>
    </aside>
  );
}
