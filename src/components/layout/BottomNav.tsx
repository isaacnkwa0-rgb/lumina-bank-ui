"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMoreSheet } from "@/lib/more-sheet-context";
import {
  Home, CreditCard, ArrowLeftRight, LayoutGrid, Landmark,
  BarChart2, Globe, PiggyBank, Target, Bell, User,
  TrendingUp, X, Bitcoin, ShieldCheck, Building, Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Home",     icon: Home },
  { href: "/accounts",  label: "Accounts", icon: Landmark },
  { href: "/transfer",  label: "Transfer", icon: ArrowLeftRight },
  { href: "/cards",     label: "Cards",    icon: CreditCard },
] as const;

const moreItems = [
  { href: "/transactions",   label: "Transactions",  icon: Receipt,     color: "bg-slate-50 text-slate-600"    },
  { href: "/analytics",     label: "Analytics",     icon: BarChart2,   color: "bg-blue-50 text-blue-600"      },
  { href: "/crypto",        label: "Crypto",        icon: Bitcoin,     color: "bg-orange-50 text-orange-500"  },
  { href: "/investments",   label: "Investments",   icon: TrendingUp,  color: "bg-emerald-50 text-emerald-600"},
  { href: "/loans",         label: "Loans",         icon: CreditCard,  color: "bg-purple-50 text-purple-600"  },
  { href: "/mortgage",      label: "Mortgage",      icon: Building,    color: "bg-indigo-50 text-indigo-600"  },
  { href: "/insurance",     label: "Insurance",     icon: ShieldCheck, color: "bg-rose-50 text-rose-600"      },
  { href: "/goals",         label: "Savings Goals", icon: Target,      color: "bg-yellow-50 text-yellow-600"  },
  { href: "/rates",         label: "Exchange Rates",icon: Globe,       color: "bg-sky-50 text-sky-600"        },
  { href: "/beneficiaries", label: "Saved Payees",  icon: PiggyBank,   color: "bg-teal-50 text-teal-600"     },
  { href: "/notifications", label: "Notifications", icon: Bell,        color: "bg-red-50 text-[#DB0011]"     },
  { href: "/profile",       label: "Profile",       icon: User,        color: "bg-[#F0F0F0] text-[#555555]" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: moreOpen, openSheet, closeSheet } = useMoreSheet();

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E3E3E3] h-16 safe-area-bottom">
        <div className="flex h-full">
          {mainNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150",
                  active ? "text-[#DB0011]" : "text-[#767676]"
                )}
                aria-label={label}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={openSheet}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150",
              moreActive ? "text-[#DB0011]" : "text-[#767676]"
            )}
            aria-label="More"
          >
            <LayoutGrid size={22} strokeWidth={moreActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl pb-safe">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-semibold text-[#333333]">More</h2>
              <button
                onClick={closeSheet}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#555555]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3 px-4 pt-2 pb-8">
              {moreItems.map(({ href, label, icon: Icon, color }) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="flex flex-col items-center gap-2 py-4 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] active:scale-95 transition-transform"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[11px] font-medium text-[#444444] leading-tight text-center">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
