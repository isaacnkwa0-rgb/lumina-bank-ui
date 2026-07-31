"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMoreSheet } from "@/lib/more-sheet-context";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  Home, CreditCard, ArrowLeftRight, LayoutGrid, Landmark,
  BarChart3, Percent, Target, Bell, Settings,
  TrendingUp, X, Bitcoin, ShieldCheck, Building2, Receipt,
  HelpCircle, Repeat2, Users, Banknote, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", labelKey: "nav.home",     icon: Home },
  { href: "/accounts",  labelKey: "nav.accounts", icon: Landmark },
  { href: "/transfer",  labelKey: "nav.transfer", icon: ArrowLeftRight },
  { href: "/cards",     labelKey: "nav.cards",    icon: CreditCard },
] as const;

const moreItems = [
  { href: "/transactions",   labelKey: "nav.transactions",    icon: Receipt,      color: "bg-slate-900  text-slate-300"    },
  { href: "/analytics",      labelKey: "nav.analytics",       icon: BarChart3,    color: "bg-blue-950   text-blue-400"     },
  { href: "/crypto",         labelKey: "nav.crypto",          icon: Bitcoin,      color: "bg-orange-950 text-orange-400"   },
  { href: "/investments",    labelKey: "nav.investments",     icon: TrendingUp,   color: "bg-emerald-950 text-emerald-400" },
  { href: "/loans",          labelKey: "nav.loans",           icon: Banknote,     color: "bg-purple-950 text-purple-400"   },
  { href: "/mortgage",       labelKey: "nav.mortgage",        icon: Building2,    color: "bg-indigo-950 text-indigo-400"   },
  { href: "/insurance",      labelKey: "nav.insurance",       icon: ShieldCheck,  color: "bg-rose-950   text-rose-400"     },
  { href: "/goals",          labelKey: "nav.savingsGoals",    icon: Target,       color: "bg-amber-950  text-amber-400"    },
  { href: "/rates",          labelKey: "nav.rates",           icon: Percent,      color: "bg-sky-950    text-sky-400"      },
  { href: "/beneficiaries",  labelKey: "nav.beneficiaries",  icon: Users,        color: "bg-teal-950   text-teal-400"     },
  { href: "/disputes",       labelKey: "nav.disputes",        icon: AlertTriangle,color: "bg-yellow-950 text-yellow-400"   },
  { href: "/standing-orders",labelKey: "nav.standingOrders", icon: Repeat2,      color: "bg-violet-950 text-violet-400"   },
  { href: "/notifications",  labelKey: "nav.notifications",  icon: Bell,         color: "bg-red-950    text-red-400"      },
  { href: "/support",        labelKey: "support.title",       icon: HelpCircle,   color: "bg-red-950    text-red-400"      },
  { href: "/profile",        labelKey: "nav.profileSettings", icon: Settings,     color: "bg-zinc-900   text-zinc-300"     },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: moreOpen, openSheet, closeSheet } = useMoreSheet();
  const { t } = useLanguage();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const moreActive = moreItems.some((i) => isActive(i.href));

  function navigate(href: string) {
    closeSheet();
    router.push(href);
    router.refresh();
  }

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D14] border-t border-[#1A1A28] h-16 safe-area-bottom">
        <div className="flex h-full">
          {mainNav.map(({ href, labelKey, icon: Icon }) => {
            const active = isActive(href);
            const label = t(labelKey as TranslationKey);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150",
                  active ? "text-white" : "text-[#55556A]"
                )}
                aria-label={label}
              >
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150",
                  active ? "bg-[#DB0011] shadow-md shadow-red-900/40" : "bg-transparent"
                )}>
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={cn(
                  "text-[9px] font-medium leading-none tracking-wide",
                  active ? "text-white" : "text-[#44445A]"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={openSheet}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150",
              moreActive ? "text-white" : "text-[#55556A]"
            )}
            aria-label="More"
          >
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150",
              moreActive ? "bg-[#DB0011] shadow-md shadow-red-900/40" : "bg-transparent"
            )}>
              <LayoutGrid size={17} strokeWidth={moreActive ? 2.5 : 1.8} />
            </div>
            <span className={cn(
              "text-[9px] font-medium leading-none tracking-wide",
              moreActive ? "text-white" : "text-[#44445A]"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSheet} />

          <div className="relative w-full bg-[#0D0D14] rounded-t-2xl shadow-2xl pb-safe border-t border-[#1A1A28]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#2A2A3A]" />
            </div>

            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h2 className="text-[13px] font-bold text-white tracking-wide uppercase">All features</h2>
              <button
                onClick={closeSheet}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-[#1A1A28] text-[#7A7A8E]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5 px-4 pb-8">
              {moreItems.map(({ href, labelKey, icon: Icon, color }) => {
                const active = isActive(href);
                return (
                  <button
                    key={href}
                    onClick={() => navigate(href)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-3.5 rounded-xl border transition-all active:scale-95",
                      active
                        ? "bg-[#1A0A0C] border-[#DB0011]/30"
                        : "bg-[#13131F] border-[#1E1E2E] hover:bg-[#1A1A28]"
                    )}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-medium text-[#8B8B9E] leading-tight text-center px-1">
                      {t(labelKey as TranslationKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
