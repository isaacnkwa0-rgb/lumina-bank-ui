"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loansApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, Home, CheckCircle2, ChevronRight,
  Banknote, Percent, Calendar, AlertTriangle,
} from "lucide-react";

const MORTGAGE_RATE = 6.5;
const MAX_PROPERTY = 2_000_000;
const MIN_DEPOSIT_PCT = 5;

const TERM_YEARS = [10, 15, 20, 25, 30];

const REPAYMENT_TYPES = [
  { value: "repayment", label: "Repayment", desc: "Pay off capital + interest each month" },
  { value: "interest", label: "Interest only", desc: "Pay interest only — capital due at end" },
] as const;

function calcMonthly(principal: number, annualRate: number, termMonths: number): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

function calcInterestOnly(principal: number, annualRate: number): number {
  return (principal * annualRate) / 100 / 12;
}

export default function MortgageApplyPage() {
  const router = useRouter();
  const [propertyValue, setPropertyValue] = useState("");
  const [deposit, setDeposit] = useState("");
  const [termYears, setTermYears] = useState(25);
  const [repaymentType, setRepaymentType] = useState<"repayment" | "interest">("repayment");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const propVal  = parseFloat(propertyValue.replace(/,/g, "")) || 0;
  const depVal   = parseFloat(deposit.replace(/,/g, "")) || 0;
  const loanAmount = Math.max(0, propVal - depVal);
  const ltv = propVal > 0 ? (loanAmount / propVal) * 100 : 0;
  const termMonths = termYears * 12;

  const monthly = useMemo(() => {
    if (repaymentType === "interest") return calcInterestOnly(loanAmount, MORTGAGE_RATE);
    return calcMonthly(loanAmount, MORTGAGE_RATE, termMonths);
  }, [loanAmount, termMonths, repaymentType]);

  const totalRepayable = repaymentType === "interest"
    ? monthly * termMonths + loanAmount
    : monthly * termMonths;
  const totalInterest = totalRepayable - loanAmount;

  const depositPct = propVal > 0 ? (depVal / propVal) * 100 : 0;
  const ltvWarning = ltv > 90;
  const ltvError   = ltv > 95;

  async function handleSubmit() {
    setError("");

    if (propVal <= 0) { setError("Please enter a property value."); return; }
    if (depVal <= 0)  { setError("Please enter a deposit amount."); return; }
    if (ltvError)     { setError("Minimum deposit is 5% of the property value."); return; }
    if (loanAmount < 10000) { setError("Minimum mortgage amount is £10,000."); return; }
    if (loanAmount > 500000) { setError("Maximum mortgage amount is £500,000."); return; }

    setSubmitting(true);
    try {
      await loansApi.apply({ type: "MORTGAGE", amount: loanAmount, termMonths });
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
        <h2 className="text-2xl font-bold text-[#333] mb-2">Application submitted!</h2>
        <p className="text-[#767676] text-sm mb-2">
          Your mortgage application for{" "}
          <span className="font-semibold text-[#333]">{formatCurrency(loanAmount)}</span> has been received.
        </p>
        <p className="text-[#767676] text-sm mb-8">
          A mortgage advisor will be in touch within 2 business days to discuss your application.
        </p>
        <div className="w-full bg-[#F8F8F8] rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            { label: "Property value",   value: formatCurrency(propVal)      },
            { label: "Deposit",          value: `${formatCurrency(depVal)} (${depositPct.toFixed(1)}%)`  },
            { label: "Mortgage amount",  value: formatCurrency(loanAmount)   },
            { label: "LTV",              value: `${ltv.toFixed(1)}%`         },
            { label: "Term",             value: `${termYears} years`         },
            { label: "Monthly payment",  value: formatCurrency(monthly)      },
            { label: "Rate",             value: `${MORTGAGE_RATE}% fixed`    },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-[#767676]">{label}</span>
              <span className="font-semibold text-[#333]">{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/mortgage")}
          className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
        >
          Back to Mortgages
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
        <div className="flex items-center gap-2 mb-1">
          <Home size={20} />
          <h1 className="text-2xl font-bold">Mortgage quote</h1>
        </div>
        <p className="text-white/60 text-sm">
          {MORTGAGE_RATE}% fixed rate · Up to 30 years · Up to 95% LTV
        </p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Property details */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-4">
          <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">
            Property details
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">
              Property value
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] font-semibold text-sm">£</span>
              <input
                type="number"
                inputMode="numeric"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                placeholder="250,000"
                className="w-full pl-8 pr-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">
              Deposit amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] font-semibold text-sm">£</span>
              <input
                type="number"
                inputMode="numeric"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="25,000"
                className="w-full pl-8 pr-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
              />
            </div>
            {propVal > 0 && depVal > 0 && (
              <p className="text-[11px] text-[#AAAAAA] mt-1">
                {depositPct.toFixed(1)}% of property value
              </p>
            )}
          </div>

          {/* LTV indicator */}
          {propVal > 0 && depVal > 0 && (
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#AAAAAA]">Loan to value</span>
                <span className={`font-bold ${ltvError ? "text-[#DB0011]" : ltvWarning ? "text-amber-500" : "text-green-600"}`}>
                  {ltv.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    ltvError ? "bg-[#DB0011]" : ltvWarning ? "bg-amber-400" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(ltv, 100)}%` }}
                />
              </div>
              {ltvWarning && (
                <div className={`flex items-start gap-2 mt-2 p-2.5 rounded-lg text-xs ${
                  ltvError ? "bg-red-50 text-[#DB0011]" : "bg-amber-50 text-amber-700"
                }`}>
                  <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                  {ltvError
                    ? "LTV exceeds 95%. Please increase your deposit."
                    : "High LTV (>90%) may attract a higher rate. A larger deposit will improve your offer."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mortgage details */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-4">
          <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">
            Mortgage details
          </p>

          {/* Term */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2">
              Mortgage term
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TERM_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setTermYears(y)}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    termYears === y
                      ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                      : "border-[#E8E8E8] text-[#555] hover:border-[#CCCCCC]"
                  }`}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Repayment type */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2">
              Repayment type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REPAYMENT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setRepaymentType(rt.value)}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                    repaymentType === rt.value
                      ? "border-[#DB0011] bg-red-50"
                      : "border-[#E8E8E8] hover:border-[#CCCCCC]"
                  }`}
                >
                  <p className={`text-xs font-bold mb-0.5 ${repaymentType === rt.value ? "text-[#DB0011]" : "text-[#333]"}`}>
                    {rt.label}
                  </p>
                  <p className="text-[10px] text-[#AAAAAA] leading-tight">{rt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quote summary */}
        {propVal > 0 && depVal > 0 && loanAmount > 0 && !ltvError && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-[#DB0011]/5 to-transparent border-b border-[#F5F5F5]">
              <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">Your quote</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#AAAAAA] uppercase tracking-wide">Monthly payment</p>
                  <p className="text-4xl font-bold text-[#DB0011]">{formatCurrency(monthly)}</p>
                </div>
                <p className="text-xs text-[#AAAAAA] pb-1">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#F0F0F0]">
              {[
                { icon: Banknote,  label: "Borrowing",       value: formatCurrency(loanAmount)     },
                { icon: Percent,   label: "Rate",            value: `${MORTGAGE_RATE}% fixed`      },
                { icon: Calendar,  label: "Total repayable", value: formatCurrency(totalRepayable) },
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
                Total interest over {termYears} years: <span className="font-semibold text-[#555]">{formatCurrency(totalInterest)}</span>
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
        <button
          onClick={handleSubmit}
          disabled={submitting || ltvError || propVal <= 0 || depVal <= 0}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting application…" : (
            <>
              Apply for mortgage
              <ChevronRight size={16} />
            </>
          )}
        </button>

        <p className="text-[11px] text-[#AAAAAA] text-center pb-2">
          Your home may be repossessed if you do not keep up repayments. Lumina Bank is authorised and regulated by the FCA.
        </p>
      </div>
    </div>
  );
}
