"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { accountsApi, type Account } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  PlusCircle, Copy, Check, Clock,
  Landmark, CreditCard, Zap, Info, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const ACCOUNT_COLORS: Record<string, string> = {
  CURRENT:  "#DB0011",
  SAVINGS:  "#1a56db",
  BUSINESS: "#374151",
  ISA:      "#059669",
  CREDIT:   "#7c3aed",
};

function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), timeout);
    });
  }
  return { copied, copy };
}

function AccountDetailsCard({ account }: { account: Account }) {
  const { copied, copy } = useCopy();
  const { t } = useLanguage();
  const color = ACCOUNT_COLORS[account.type] ?? "#DB0011";

  const fields = [
    { label: t("topup.accountName"),   value: "Lumina Bank",         key: `name-${account.id}`   },
    { label: t("topup.accountNumber"), value: account.accountNumber, key: `accno-${account.id}`  },
    { label: t("topup.sortCode"),      value: account.sortCode,      key: `sort-${account.id}`   },
    { label: t("topup.iban"),          value: account.iban,          key: `iban-${account.id}`   },
    { label: t("topup.currency"),      value: account.currency,      key: `cur-${account.id}`    },
  ];

  function copyAll() {
    const text = fields.map((f) => `${f.label}: ${f.value}`).join("\n");
    copy(text, `all-${account.id}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
      {/* Account header strip */}
      <div
        className="px-5 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-0.5">
              {account.type} account
            </p>
            <p className="text-xl font-bold">
              {formatCurrency(Number(account.balance), account.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/50">Available</p>
            <p className="text-sm font-semibold">
              {formatCurrency(Number(account.availableBalance), account.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="px-5 divide-y divide-[#F5F5F5]">
        {fields.map(({ label, value, key }) => {
          const isCopied = copied === key;
          return (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide font-semibold mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-bold text-[#333] font-mono tracking-wide">{value}</p>
              </div>
              <button
                onClick={() => copy(value, key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ml-3 ${
                  isCopied
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-[#F5F5F5] text-[#555] hover:bg-[#EBEBEB]"
                }`}
              >
                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                {isCopied ? t("topup.copied") : t("topup.copy")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Copy all */}
      <div className="px-5 py-3.5 border-t border-[#F5F5F5]">
        <button
          onClick={copyAll}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
            copied === `all-${account.id}`
              ? "bg-green-50 text-green-600 border-green-200"
              : "border-[#E3E3E3] text-[#555] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
          }`}
        >
          {copied === `all-${account.id}` ? <Check size={13} /> : <Copy size={13} />}
          {copied === `all-${account.id}` ? t("topup.detailsCopied") : t("topup.copyAll")}
        </button>
      </div>
    </div>
  );
}

export default function TopUpPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    accountsApi.list()
      .then((res) => setAccounts(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const primaryCurrency = accounts[0]?.currency ?? "GBP";

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("topup.title")}</h1>
        </div>
        {!loading && accounts.length > 0 && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("topup.totalBalance")}</p>
            <p className="text-4xl font-bold">
              {formatCurrency(totalBalance, primaryCurrency)}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""} · share details below to receive funds
            </p>
          </div>
        )}
        {loading && (
          <>
            <SkeletonBlock className="h-3 w-28 mb-2 bg-white/10 rounded" />
            <SkeletonBlock className="h-10 w-40 bg-white/10 rounded" />
          </>
        )}
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Section label */}
        <div className="flex items-center gap-2 pt-2">
          <Landmark size={14} className="text-[#AAAAAA]" />
          <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">
            {t("topup.bankTransfer")}
          </p>
        </div>

        {/* All accounts */}
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-64 rounded-2xl" />
          ))
        ) : (
          accounts.map((acc) => <AccountDetailsCard key={acc.id} account={acc} />)
        )}

        {/* Timing */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-[#AAAAAA]" />
            <p className="text-xs font-bold text-[#555] uppercase tracking-widest">{t("topup.transferTimes")}</p>
          </div>
          <div className="space-y-3">
            {[
              { method: t("topup.fasterPayments"), time: t("topup.within2h"), icon: Zap,      color: "text-green-600"  },
              { method: t("topup.chaps"),          time: t("topup.sameDay"),  icon: Landmark, color: "text-blue-600"   },
              { method: t("topup.bacs"),           time: t("topup.3days"),    icon: Clock,    color: "text-amber-600"  },
              { method: t("topup.swift"),          time: t("topup.15days"),   icon: Landmark, color: "text-purple-600" },
            ].map(({ method, time, icon: Icon, color }) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={13} className={color} />
                  <p className="text-xs text-[#555]">{method}</p>
                </div>
                <p className="text-xs font-semibold text-[#333]">{time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card top-up — coming soon */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden opacity-70">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#333]">{t("topup.cardTopup")}</p>
                <p className="text-xs text-[#AAAAAA]">{t("topup.cardDesc")}</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
              {t("topup.comingSoon")}
            </span>
          </div>
        </div>

        {/* Loan CTA */}
        <button
          onClick={() => router.push("/loans/apply")}
          className="w-full bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💳</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#333]">{t("topup.applyLoan")}</p>
                <p className="text-xs text-[#AAAAAA]">{t("topup.loanDesc")}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#AAAAAA] flex-shrink-0" />
          </div>
        </button>

        {/* FSCS note */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            {t("topup.fscs")}
          </p>
        </div>
      </div>
    </div>
  );
}
