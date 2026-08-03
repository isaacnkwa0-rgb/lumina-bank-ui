"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loansApi, accountsApi, type Account } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, User, Briefcase, Car, GraduationCap,
  CheckCircle2, ChevronRight, Banknote, Percent, Calendar, CreditCard,
} from "lucide-react";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

// ── Loan type config ───────────────────────────────────────────────────────────

const LOAN_TYPES = [
  {
    type: "PERSONAL",
    labelKey: "loans.personal" as TranslationKey,
    icon: User,
    emoji: "👤",
    rate: 12,
    maxAmount: 50000,
    minAmount: 1000,
    maxTerm: 60,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    descKey: "loans.personalDesc" as TranslationKey,
  },
  {
    type: "BUSINESS",
    labelKey: "loans.businessLoan" as TranslationKey,
    icon: Briefcase,
    emoji: "💼",
    rate: 10,
    maxAmount: 250000,
    minAmount: 5000,
    maxTerm: 84,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    descKey: "loans.businessLoanDesc" as TranslationKey,
  },
  {
    type: "AUTO",
    labelKey: "loans.auto" as TranslationKey,
    icon: Car,
    emoji: "🚗",
    rate: 8,
    maxAmount: 100000,
    minAmount: 2000,
    maxTerm: 72,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    descKey: "loans.autoDesc" as TranslationKey,
  },
  {
    type: "STUDENT",
    labelKey: "loans.student" as TranslationKey,
    icon: GraduationCap,
    emoji: "🎓",
    rate: 5.5,
    maxAmount: 50000,
    minAmount: 500,
    maxTerm: 120,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    descKey: "loans.studentDesc" as TranslationKey,
  },
] as const;

const TERM_OPTIONS = [6, 12, 18, 24, 36, 48, 60, 72, 84, 120];

function calcMonthly(principal: number, annualRate: number, termMonths: number): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LoanApplyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<typeof LOAN_TYPES[number] | null>(null);
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    accountsApi.list().then((res) => {
      const active = res.data.data.filter((a) => a.status === "ACTIVE");
      setAccounts(active);
      const def = active.find((a) => a.isDefault) ?? active[0];
      if (def) setSelectedAccountId(def.id);
    }).catch(() => {});
  }, []);

  const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const monthly = useMemo(
    () => selectedType ? calcMonthly(parsedAmount, selectedType.rate, termMonths) : 0,
    [parsedAmount, selectedType, termMonths]
  );
  const totalRepayable = monthly * termMonths;
  const totalInterest = totalRepayable - parsedAmount;

  const availableTerms = TERM_OPTIONS.filter(
    (term) => !selectedType || term <= selectedType.maxTerm
  );

  function handleAmountInput(val: string) {
    const cleaned = val.replace(/[^0-9.]/g, "");
    setAmount(cleaned);
  }

  async function handleSubmit() {
    if (!selectedType) return;
    setError("");

    if (parsedAmount < selectedType.minAmount) {
      setError(`Minimum amount is ${formatCurrency(selectedType.minAmount)}`);
      return;
    }
    if (parsedAmount > selectedType.maxAmount) {
      setError(`Maximum amount is ${formatCurrency(selectedType.maxAmount)}`);
      return;
    }

    setSubmitting(true);
    try {
      await loansApi.apply({ type: selectedType.type, amount: parsedAmount, termMonths, accountId: selectedAccountId || undefined });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Application failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none px-4 py-12 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#333] mb-2">{t("loans.appSubmitted")}</h2>
        <p className="text-[#767676] text-sm mb-2">
          {t("loans.appSubmittedDesc")}
        </p>
        <p className="text-[#767676] text-sm mb-8">
          You&apos;ll receive a decision shortly. Your loan will appear in the Loans section once approved.
        </p>
        <div className="w-full bg-[#F8F8F8] rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            { label: t("loans.loanType"),        value: selectedType ? t(selectedType.labelKey) : "" },
            { label: "Amount",                    value: formatCurrency(parsedAmount)               },
            { label: t("loans.term"),             value: `${termMonths} ${t("loans.months")}`       },
            { label: t("loans.monthlyPayment"),   value: formatCurrency(monthly)                    },
            { label: t("loans.apr"),              value: `${selectedType?.rate}%`                   },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-[#767676]">{label}</span>
              <span className="font-semibold text-[#333]">{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/loans")}
          className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
        >
          Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-5 pb-10 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-2xl font-bold mb-1">{t("loans.applyTitle")}</h1>
        <p className="text-white/60 text-sm">{t("loans.applySubtitle")}</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Step 1 — type selector */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
          <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">
            1. {t("loans.chooseType")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {LOAN_TYPES.map((lt) => {
              const Icon = lt.icon;
              const selected = selectedType?.type === lt.type;
              return (
                <button
                  key={lt.type}
                  onClick={() => {
                    setSelectedType(lt);
                    setAmount("");
                    const defaultTerm = Math.min(24, lt.maxTerm);
                    setTermMonths(defaultTerm);
                    setError("");
                  }}
                  className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? `${lt.border} ${lt.bg}`
                      : "border-[#E8E8E8] hover:border-[#D0D0D0]"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                    selected ? lt.bg : "bg-[#F5F5F5]"
                  }`}>
                    <Icon size={16} className={selected ? lt.color : "text-[#AAAAAA]"} />
                  </div>
                  <p className={`text-sm font-bold mb-0.5 ${selected ? lt.color : "text-[#333]"}`}>
                    {t(lt.labelKey)}
                  </p>
                  <p className="text-[10px] text-[#AAAAAA] leading-tight">{t(lt.descKey)}</p>
                  {selected && (
                    <span className={`mt-2 text-[10px] font-bold ${lt.color}`}>
                      from {lt.rate}% APR
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — amount + term */}
        {selectedType && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-5">
            <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">
              2. {t("loans.loanDetails")}
            </p>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">
                {t("loans.howMuch")}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] font-semibold text-sm">
                  £
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={selectedType.minAmount}
                  max={selectedType.maxAmount}
                  value={amount}
                  onChange={(e) => handleAmountInput(e.target.value)}
                  placeholder={`${selectedType.minAmount.toLocaleString()} – ${selectedType.maxAmount.toLocaleString()}`}
                  className="w-full pl-8 pr-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
                />
              </div>
              <p className="text-[11px] text-[#AAAAAA] mt-1">
                {t("loans.upTo")} {formatCurrency(selectedType.maxAmount)}
              </p>
            </div>

            {/* Term */}
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">
                {t("loans.howLong")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => setTermMonths(term)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      termMonths === term
                        ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                        : "border-[#E8E8E8] text-[#555] hover:border-[#CCCCCC]"
                    }`}
                  >
                    {term >= 12 ? `${term / 12}${t("loans.years").slice(0, 2)}${term > 12 ? "s" : ""}` : `${term}${t("loans.months").slice(0, 2)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — disbursement account */}
        {selectedType && accounts.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
            <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">
              3. {t("loans.disbursement")}
            </p>
            <p className="text-xs text-[#767676] mb-3">{t("loans.disbursementDesc")}</p>
            <div className="space-y-2">
              {accounts.map((acc) => {
                const selected = selectedAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selected ? "border-[#DB0011] bg-red-50" : "border-[#E8E8E8] hover:border-[#D0D0D0]"
                    }`}
                  >
                    <CreditCard size={16} className={selected ? "text-[#DB0011]" : "text-[#AAAAAA]"} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${selected ? "text-[#DB0011]" : "text-[#333]"}`}>
                        {acc.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-[#AAAAAA] truncate">
                        •••• {acc.accountNumber.slice(-4)} · {formatCurrency(Number(acc.balance), acc.currency)}
                      </p>
                    </div>
                    {acc.isDefault && (
                      <span className="text-[10px] font-bold text-white bg-[#DB0011] px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 — summary */}
        {selectedType && parsedAmount > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F5F5F5]">
              <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">
                4. {t("loans.yourQuote")}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#AAAAAA] uppercase tracking-wide">{t("loans.monthlyPayment")}</p>
                  <p className="text-4xl font-bold text-[#DB0011]">{formatCurrency(monthly)}</p>
                </div>
                <p className="text-xs text-[#AAAAAA] pb-1">{t("loans.perMonth")}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#F0F0F0]">
              {[
                { icon: Banknote,  label: t("loans.howMuch").split("?")[0],  value: formatCurrency(parsedAmount)   },
                { icon: Percent,   label: t("loans.apr"),                    value: `${selectedType.rate}%`        },
                { icon: Calendar,  label: t("loans.totalRepayable"),         value: formatCurrency(totalRepayable) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center py-4 px-2">
                  <Icon size={13} className="text-[#BBBBBB] mb-1" />
                  <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide text-center">{label}</p>
                  <p className="text-xs font-bold text-[#333] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#F5F5F5]">
              <p className="text-[11px] text-[#AAAAAA] text-center">
                {t("loans.totalInterest")} <span className="font-semibold text-[#555]">{formatCurrency(totalInterest)}</span>
                {" · "}{t("loans.repApr")} {selectedType.rate}%
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}

        {/* Submit */}
        {selectedType && (
          <button
            onClick={handleSubmit}
            disabled={submitting || parsedAmount <= 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting application…" : (
              <>
                {t("loans.applyTitle")}: {t(selectedType.labelKey)}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}

        <p className="text-[11px] text-[#AAAAAA] text-center pb-2">
          {t("loans.creditNote")}
        </p>
      </div>
    </div>
  );
}
