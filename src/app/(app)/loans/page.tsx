"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loansApi, type Loan, type LoanEligibility } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  Calendar, ChevronDown, ChevronUp, CheckCircle2,
  Clock, AlertCircle, Banknote, Percent, CreditCard,
  TrendingDown, Star,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2, label: "Active"    };
    case "PAID_OFF":  return { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   icon: Star,         label: "Paid off"  };
    case "DEFAULTED": return { color: "text-[#DB0011]",  bg: "bg-red-50",    border: "border-red-200",    icon: AlertCircle,  label: "Defaulted" };
    default:          return { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock,        label: status      };
  }
}

function paymentStatusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":      return { color: "text-green-600", label: "Paid"      };
    case "MISSED":    return { color: "text-[#DB0011]", label: "Missed"    };
    case "SCHEDULED": return { color: "text-amber-600", label: "Upcoming"  };
    default:          return { color: "text-[#999]",    label: status       };
  }
}

const LOAN_TYPE_ICONS: Record<string, string> = {
  PERSONAL:  "👤",
  MORTGAGE:  "🏠",
  AUTO:      "🚗",
  BUSINESS:  "💼",
  OVERDRAFT: "🔄",
};

// ── Loan card ──────────────────────────────────────────────────────────────────

function LoanCard({ loan }: { loan: Loan }) {
  const [expanded, setExpanded] = useState(false);

  const principal    = Number(loan.principalAmount);
  const outstanding  = Number(loan.outstandingBalance);
  const paid         = principal - outstanding;
  const progress     = Math.min((paid / principal) * 100, 100);
  const rate         = Number(loan.interestRate);
  const sc           = statusConfig(loan.status);
  const StatusIcon   = sc.icon;
  const emoji        = LOAN_TYPE_ICONS[loan.type?.toUpperCase()] ?? "💳";

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-5 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{emoji}</span>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                {loan.type} Loan
              </p>
            </div>
            <p className="text-3xl font-bold leading-none">
              {formatCurrency(outstanding)}
            </p>
            <p className="text-white/40 text-xs mt-1">Outstanding balance</p>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold ${sc.bg} ${sc.border} ${sc.color}`}>
            <StatusIcon size={11} />
            {sc.label}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] text-white/50 mb-1.5">
            <span>{progress.toFixed(0)}% repaid</span>
            <span>{formatCurrency(paid)} of {formatCurrency(principal)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-[#F0F0F0] border-b border-[#F0F0F0]">
        {[
          { icon: Percent,     label: "APR",          value: `${rate.toFixed(1)}%`                         },
          { icon: Banknote,    label: "Monthly",       value: formatCurrency(Number(loan.monthlyPayment))   },
          { icon: Calendar,    label: "Term",          value: `${loan.termMonths}mo`                        },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-3.5 px-2">
            <Icon size={13} className="text-[#BBBBBB] mb-1" />
            <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-[#333]">{value}</p>
          </div>
        ))}
      </div>

      {/* Next payment */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F5]">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Calendar size={15} className="text-[#DB0011]" />
          </div>
          <div>
            <p className="text-[11px] text-[#AAAAAA] uppercase tracking-wide font-semibold">Next payment</p>
            <p className="text-sm font-bold text-[#333]">{formatDate(loan.nextPaymentDate)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#AAAAAA]">Amount due</p>
          <p className="text-base font-bold text-[#DB0011]">{formatCurrency(Number(loan.nextPaymentAmount))}</p>
        </div>
      </div>

      {/* Payments toggle */}
      {loan.payments && loan.payments.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-[#555] hover:bg-[#FAFAFA] transition-colors"
          >
            <span>Payment history ({loan.payments.length})</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="border-t border-[#F5F5F5]">
              {loan.payments.slice(0, 6).map((payment, i) => {
                const psc = paymentStatusConfig(payment.status);
                return (
                  <div key={payment.id}
                    className={`flex items-center justify-between px-5 py-3 ${i < loan.payments!.length - 1 ? "border-b border-[#F8F8F8]" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2 w-2 rounded-full ${
                        payment.status === "PAID" ? "bg-green-500" :
                        payment.status === "MISSED" ? "bg-[#DB0011]" : "bg-amber-400"
                      }`} />
                      <p className="text-xs text-[#555]">{formatDate(payment.paymentDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold uppercase ${psc.color}`}>{psc.label}</span>
                      <p className="text-xs font-bold text-[#333]">{formatCurrency(Number(payment.amount))}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Apply CTA ──────────────────────────────────────────────────────────────────

function ApplyCTA({ eligibility }: { eligibility: LoanEligibility | null }) {
  const router = useRouter();
  const personalMax = eligibility?.eligibility?.PERSONAL ?? 0;
  const personalRate = eligibility?.annualRates?.PERSONAL;
  const hasEligibility = personalMax > 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] shadow-sm">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Need a loan?</p>
            <p className="text-xl font-bold">
              {hasEligibility
                ? `Up to ${formatCurrency(personalMax)}`
                : "Apply for a loan"}
            </p>
            {hasEligibility && personalRate && (
              <p className="text-white/60 text-xs mt-1">Personal from {personalRate}% APR</p>
            )}
          </div>
          {hasEligibility && (
            <span className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 text-green-300 text-[10px] font-bold px-2 py-1 rounded-full">
              <Star size={9} className="fill-green-300" /> Pre-approved
            </span>
          )}
        </div>
      </div>

      <div className="bg-white px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Personal", value: "from 12% APR" },
            { label: "Business", value: "from 10% APR" },
            { label: "Decision", value: "Instant" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F8F8F8] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">{label}</p>
              <p className="text-xs font-bold text-[#333] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/loans/apply")}
          className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
        >
          Apply now — takes 2 minutes
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoansPage() {
  const [loans, setLoans]             = useState<Loan[]>([]);
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    Promise.all([loansApi.list(), loansApi.eligibility()])
      .then(([lRes, eRes]) => {
        setLoans(lRes.data.data);
        setEligibility(eRes.data.data);
      })
      .catch(() => setError("Could not load loan information."))
      .finally(() => setLoading(false));
  }, []);

  const totalOutstanding = loans.reduce((s, l) => s + Number(l.outstandingBalance), 0);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Loans</h1>
        </div>
        {!loading && loans.length > 0 && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Total outstanding</p>
            <p className="text-4xl font-bold">{formatCurrency(totalOutstanding)}</p>
            <p className="text-white/40 text-xs mt-1">
              {loans.length} active loan{loans.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-xl">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-64 w-full rounded-2xl" />
          ))
        ) : (
          <>
            {loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
            <ApplyCTA eligibility={eligibility} />
          </>
        )}
      </div>

      {/* Quick info */}
      {!loading && (
        <div className="mx-4 mt-4 flex gap-2">
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E8E8] p-3.5 flex items-center gap-2.5">
            <TrendingDown size={16} className="text-[#DB0011]" />
            <div>
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">Total monthly</p>
              <p className="text-sm font-bold text-[#333]">
                {formatCurrency(loans.reduce((s, l) => s + Number(l.monthlyPayment), 0))}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E8E8] p-3.5 flex items-center gap-2.5">
            <Percent size={16} className="text-amber-500" />
            <div>
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">Avg rate</p>
              <p className="text-sm font-bold text-[#333]">
                {loans.length
                  ? `${(loans.reduce((s, l) => s + Number(l.interestRate), 0) / loans.length).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
