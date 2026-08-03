"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMoreSheet } from "@/lib/more-sheet-context";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  Home, CreditCard, ArrowLeftRight, LayoutGrid, Landmark,
  BarChart3, Percent, Target, Bell, Settings,
  TrendingUp, X, Bitcoin, ShieldCheck, Building2, Receipt,
  HelpCircle, Repeat2, Users, Banknote, AlertTriangle, ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", labelKey: "nav.home",     icon: Home },
  { href: "/accounts",  labelKey: "nav.accounts", icon: Landmark },
  { href: "/transfer",  labelKey: "nav.transfer", icon: ArrowLeftRight },
  { href: "/cards",     labelKey: "nav.cards",    icon: CreditCard },
] as const;

const moreItems = [
  { href: "/transactions",   labelKey: "nav.transactions",    icon: Receipt,        color: "bg-slate-100  text-slate-600"    },
  { href: "/deposit",        labelKey: "nav.deposit",         icon: ArrowDownToLine,color: "bg-green-50   text-green-600"    },
  { href: "/analytics",      labelKey: "nav.analytics",       icon: BarChart3,     color: "bg-blue-50    text-blue-600"     },
  { href: "/crypto",         labelKey: "nav.crypto",          icon: Bitcoin,       color: "bg-orange-50  text-orange-500"   },
  { href: "/investments",    labelKey: "nav.investments",     icon: TrendingUp,    color: "bg-emerald-50 text-emerald-600"  },
  { href: "/loans",          labelKey: "nav.loans",           icon: Banknote,      color: "bg-purple-50  text-purple-600"   },
  { href: "/mortgage",       labelKey: "nav.mortgage",        icon: Building2,     color: "bg-indigo-50  text-indigo-600"   },
  { href: "/insurance",      labelKey: "nav.insurance",       icon: ShieldCheck,   color: "bg-rose-50    text-rose-600"     },
  { href: "/goals",          labelKey: "nav.savingsGoals",    icon: Target,        color: "bg-amber-50   text-amber-600"    },
  { href: "/rates",          labelKey: "nav.rates",           icon: Percent,       color: "bg-sky-50     text-sky-600"      },
  { href: "/beneficiaries",  labelKey: "nav.beneficiaries",  icon: Users,         color: "bg-teal-50    text-teal-600"     },
  { href: "/disputes",       labelKey: "nav.disputes",        icon: AlertTriangle, color: "bg-yellow-50  text-yellow-600"   },
  { href: "/standing-orders",labelKey: "nav.standingOrders", icon: Repeat2,       color: "bg-violet-50  text-violet-600"   },
  { href: "/notifications",  labelKey: "nav.notifications",  icon: Bell,          color: "bg-red-50     text-[#DB0011]"    },
  { href: "/support",        labelKey: "support.title",       icon: HelpCircle,    color: "bg-red-50     text-[#DB0011]"    },
  { href: "/profile",        labelKey: "nav.profileSettings", icon: Settings,      color: "bg-[#F2F2F2]  text-[#555555]"   },
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8E8] h-16 safe-area-bottom">
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
                  active ? "text-[#DB0011]" : "text-[#AAAAAA]"
                )}
                aria-label={label}
              >
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150",
                  active ? "bg-red-50" : "bg-transparent"
                )}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={openSheet}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150",
              moreActive ? "text-[#DB0011]" : "text-[#AAAAAA]"
            )}
            aria-label="More"
          >
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150",
              moreActive ? "bg-red-50" : "bg-transparent"
            )}>
              <LayoutGrid size={18} strokeWidth={moreActive ? 2.5 : 1.8} />
            </div>
            <span className="text-[9px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSheet} />

          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl pb-safe border-t border-[#E8E8E8]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
            </div>

            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h2 className="text-[13px] font-bold text-[#333333] tracking-wide uppercase">All features</h2>
              <button
                onClick={closeSheet}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F2F2F2] text-[#666666]"
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
                        ? "bg-red-50 border-[#DB0011]/20"
                        : "bg-[#FAFAFA] border-[#F0F0F0] hover:bg-[#F5F5F5]"
                    )}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-medium text-[#555555] leading-tight text-center px-1">
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
