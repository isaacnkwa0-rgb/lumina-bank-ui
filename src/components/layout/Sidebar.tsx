"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  Home, Landmark, ArrowLeftRight, CreditCard, Receipt,
  BarChart3, TrendingUp, Percent, Target,
  Bell, Settings, ShieldCheck, Building2, Bitcoin,
  LogOut, Repeat2, Users, Banknote, AlertTriangle,
  HelpCircle, ChevronRight, ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navGroups = [
  {
    labelKey: "sidebar.overview",
    items: [
      { href: "/dashboard",     labelKey: "nav.home",          icon: Home },
      { href: "/accounts",      labelKey: "nav.accounts",      icon: Landmark },
      { href: "/transactions",  labelKey: "nav.transactions",  icon: Receipt },
      { href: "/notifications", labelKey: "nav.notifications", icon: Bell },
    ],
  },
  {
    labelKey: "sidebar.moveMoney",
    items: [
      { href: "/transfer",        labelKey: "nav.transfer",       icon: ArrowLeftRight },
      { href: "/deposit",         labelKey: "nav.deposit",        icon: ArrowDownToLine },
      { href: "/standing-orders", labelKey: "nav.standingOrders", icon: Repeat2 },
      { href: "/direct-debits",   labelKey: "nav.directDebits",   icon: Repeat2 },
      { href: "/beneficiaries",   labelKey: "nav.beneficiaries",  icon: Users },
    ],
  },
  {
    labelKey: "sidebar.cardsCredit",
    items: [
      { href: "/cards",    labelKey: "nav.cards",    icon: CreditCard },
      { href: "/loans",    labelKey: "nav.loans",    icon: Banknote },
      { href: "/mortgage", labelKey: "nav.mortgage", icon: Building2 },
    ],
  },
  {
    labelKey: "sidebar.grow",
    items: [
      { href: "/investments", labelKey: "nav.investments",  icon: TrendingUp },
      { href: "/goals",       labelKey: "nav.savingsGoals", icon: Target },
      { href: "/crypto",      labelKey: "nav.crypto",       icon: Bitcoin },
      { href: "/insurance",   labelKey: "nav.insurance",    icon: ShieldCheck },
    ],
  },
  {
    labelKey: "sidebar.tools",
    items: [
      { href: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
      { href: "/rates",     labelKey: "nav.rates",     icon: Percent },
      { href: "/disputes",  labelKey: "nav.disputes",  icon: AlertTriangle },
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

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "LB";

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#E8E8E8] z-30">

      {/* Logo */}
      <Link
        href="/dashboard"
        className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-[17px] flex items-center gap-3 flex-shrink-0 hover:from-[#c4000f] hover:to-[#7a0009] transition-all"
      >
        <DiamondLogo />
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-wide">Lumina Bank</p>
          <p className="text-white/60 text-[9px] leading-tight tracking-[0.15em] uppercase mt-0.5">Secure Banking</p>
        </div>
      </Link>

      {/* User card */}
      {user && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-[#F8F8F8] border border-[#EEEEEE] flex items-center gap-3 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#DB0011] to-[#8B000A] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#333333] truncate leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-[#999999] truncate mt-0.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group) => (
          <div key={group.labelKey} className="mb-2">
            <p className="px-3 pt-3 pb-1 text-[9px] font-bold text-[#BBBBBB] uppercase tracking-[0.18em]">
              {t(group.labelKey as TranslationKey)}
            </p>
            {group.items.map(({ href, labelKey, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] transition-all duration-150",
                    active
                      ? "bg-red-50 text-[#DB0011] font-semibold"
                      : "text-[#666666] hover:bg-[#F8F8F8] hover:text-[#333333]"
                  )}
                >
                  {/* Icon container */}
                  <div
                    className={cn(
                      "flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-150",
                      active ? "bg-[#DB0011] shadow-sm" : "bg-[#F2F2F2]"
                    )}
                  >
                    <Icon
                      size={13}
                      strokeWidth={active ? 2.5 : 1.8}
                      className={active ? "text-white" : "text-[#888888]"}
                    />
                  </div>

                  <span className="flex-1 leading-none">{t(labelKey as TranslationKey)}</span>

                  {active && (
                    <ChevronRight size={11} className="text-[#DB0011] flex-shrink-0 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Support */}
      <div className="px-3 pb-2 flex-shrink-0">
        <Link
          href="/support"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150",
            isActive("/support")
              ? "bg-[#DB0011] text-white"
              : "bg-red-50 text-[#DB0011] hover:bg-red-100"
          )}
        >
          <HelpCircle size={15} strokeWidth={2} />
          <span>{t("support.title" as TranslationKey)}</span>
          {!isActive("/support") && (
            <ChevronRight size={11} className="ml-auto opacity-50" />
          )}
        </Link>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-[#E8E8E8] px-3 pt-2 pb-3 space-y-0.5 flex-shrink-0">
        <div className="px-2 py-1.5">
          <LanguageSwitcher compact />
        </div>
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] transition-all duration-150",
            pathname.startsWith("/profile")
              ? "bg-red-50 text-[#DB0011] font-semibold"
              : "text-[#666666] hover:bg-[#F8F8F8] hover:text-[#333333]"
          )}
        >
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            pathname.startsWith("/profile") ? "bg-[#DB0011]" : "bg-[#F2F2F2]"
          )}>
            <Settings size={13} strokeWidth={1.8} className={pathname.startsWith("/profile") ? "text-white" : "text-[#888888]"} />
          </div>
          {t("nav.profileSettings")}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-[13px] text-[#666666] hover:bg-red-50 hover:text-[#DB0011] transition-all duration-150"
        >
          <div className="h-7 w-7 rounded-lg bg-[#F2F2F2] flex items-center justify-center">
            <LogOut size={13} strokeWidth={1.8} className="text-[#888888]" />
          </div>
          {t("nav.logOff")}
        </button>
      </div>
    </aside>
  );
}
