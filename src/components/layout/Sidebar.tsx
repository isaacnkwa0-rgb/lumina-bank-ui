"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  Home, Landmark, ArrowLeftRight, CreditCard, Receipt,
  BarChart2, TrendingUp, Globe, Target, PiggyBank,
  Bell, User, ShieldCheck, Building, Bitcoin,
  LogOut, ChevronRight, RefreshCw, AlertCircle, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navGroups = [
  {
    labelKey: "sidebar.overview",
    items: [
      { href: "/dashboard",    labelKey: "nav.home",            icon: Home },
      { href: "/accounts",     labelKey: "nav.accounts",        icon: Landmark },
      { href: "/transactions", labelKey: "nav.transactions",    icon: Receipt },
      { href: "/notifications",labelKey: "nav.notifications",   icon: Bell },
    ],
  },
  {
    labelKey: "sidebar.moveMoney",
    items: [
      { href: "/transfer",          labelKey: "nav.transfer",          icon: ArrowLeftRight },
      { href: "/standing-orders",   labelKey: "nav.standingOrders",    icon: RefreshCw },
      { href: "/direct-debits",     labelKey: "nav.directDebits",      icon: Landmark },
      { href: "/beneficiaries",     labelKey: "nav.beneficiaries",     icon: PiggyBank },
    ],
  },
  {
    labelKey: "sidebar.cardsCredit",
    items: [
      { href: "/cards",        labelKey: "nav.cards",            icon: CreditCard },
      { href: "/loans",        labelKey: "nav.loans",            icon: CreditCard },
      { href: "/mortgage",     labelKey: "nav.mortgage",         icon: Building },
    ],
  },
  {
    labelKey: "sidebar.grow",
    items: [
      { href: "/investments",  labelKey: "nav.investments",      icon: TrendingUp },
      { href: "/goals",        labelKey: "nav.savingsGoals",     icon: Target },
      { href: "/crypto",       labelKey: "nav.crypto",           icon: Bitcoin },
      { href: "/insurance",    labelKey: "nav.insurance",        icon: ShieldCheck },
    ],
  },
  {
    labelKey: "sidebar.tools",
    items: [
      { href: "/analytics",    labelKey: "nav.analytics",        icon: BarChart2 },
      { href: "/rates",        labelKey: "nav.rates",            icon: Globe },
    ],
  },
  {
    labelKey: "nav.support",
    items: [
      { href: "/support",      labelKey: "support.title",        icon: HelpCircle },
      { href: "/disputes",     labelKey: "nav.disputes",         icon: AlertCircle },
    ],
  },
] as const;

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
  const { t } = useLanguage();

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
          <div key={group.labelKey} className="mb-1">
            <p className="px-4 py-1.5 text-[9px] font-bold text-[#AAAAAA] uppercase tracking-widest">
              {t(group.labelKey as TranslationKey)}
            </p>
            {group.items.map(({ href, labelKey, icon: Icon }) => {
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
                  <span>{t(labelKey as TranslationKey)}</span>
                  {active && <ChevronRight size={12} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[#E3E3E3] p-3 space-y-1 flex-shrink-0">
        <div className="px-3 py-2">
          <LanguageSwitcher compact />
        </div>
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
          {t("nav.profileSettings")}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-[#DB0011] hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          {t("nav.logOff")}
        </button>
      </div>
    </aside>
  );
}
