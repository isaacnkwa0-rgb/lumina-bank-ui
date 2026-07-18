"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { loansApi, type Loan, type AmortizationEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft, Home, Calendar, Percent, Banknote, CheckCircle2,
  Clock, AlertCircle, Star, ChevronDown, ChevronUp, TrendingDown,
  Landmark, X,
} from "lucide-react";

function statusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2, label: "Active"    };
    case "PAID_OFF":  return { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   icon: Star,         label: "Paid off"  };
    case "DEFAULTED": return { color: "text-[#DB0011]",  bg: "bg-red-50",    border: "border-red-200",    icon: AlertCircle,  label: "Defaulted" };
    default:          return { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock,        label: status      };
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function RepayModal({
  loan,
  onClose,
  onSuccess,
}: {
  loan: Loan;
  onClose: () => void;
  onSuccess: (remaining: number) => void;
}) {
  const monthly = Number(loan.monthlyPayment);
  const outstanding = Number(loan.outstandingBalance);
  const [amount, setAmount] = useState(monthly.toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRepay() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setError("Enter a valid amount"); return; }
    if (val > outstanding) { setError(`Cannot exceed outstanding balance of ${formatCurrency(outstanding)}`); return; }
    setError("");
    setLoading(true);
    try {
      const r = await loansApi.repay(loan.id, val);
      onSuccess(r.data.data.remainingBalance);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-base font-bold text-[#333]">Make a payment</p>
            <p className="text-xs text-[#767676] mt-0.5">Outstanding: {formatCurrency(outstanding)}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <X size={15} className="text-[#777]" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-3 gap-2">
            {[monthly, Math.round(outstanding / 2), outstanding].map((preset, i) => (
              <button
                key={i}
                onClick={() => setAmount(preset.toFixed(2))}
                className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                  parseFloat(amount) === preset
                    ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                    : "border-[#E8E8E8] text-[#555] hover:border-[#CCCCCC]"
                }`}
              >
                {i === 0 ? "Monthly" : i === 1 ? "Half" : "Full"}
                <br />
                <span className="text-[10px] font-normal">{formatCurrency(preset)}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] font-semibold text-sm">£</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs text-[#DB0011]">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border border-[#E8E8E8] text-sm font-semibold text-[#333] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRepay}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl bg-[#DB0011] text-white text-sm font-semibold hover:bg-[#b8000e] transition-colors disabled:opacity-60"
          >
            {loading ? "Processing…" : "Confirm payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MortgageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleLimit, setScheduleLimit] = useState(12);
  const [showRepay, setShowRepay] = useState(false);
  const [repaySuccess, setRepaySuccess] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      loansApi.get(id),
      loansApi.schedule(id),
    ])
      .then(([loanRes, schedRes]) => {
        setLoan(loanRes.data.data);
        setSchedule(schedRes.data.data.schedule);
      })
      .catch(() => setError("Could not load mortgage details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRepaySuccess = useCallback((remaining: number) => {
    setRepaySuccess(remaining);
    setShowRepay(false);
    if (loan) setLoan({ ...loan, outstandingBalance: String(remaining) });
  }, [loan]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-2xl px-4 pt-6 space-y-4">
        <SkeletonBlock className="h-48 rounded-2xl" />
        <SkeletonBlock className="h-24 rounded-2xl" />
        <SkeletonBlock className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
          <p className="text-sm text-[#DB0011]">{error || "Mortgage not found."}</p>
        </div>
      </div>
    );
  }

  const principal   = Number(loan.principalAmount);
  const outstanding = Number(loan.outstandingBalance);
  const paid        = principal - outstanding;
  const progress    = Math.min((paid / principal) * 100, 100);
  const rate        = Number(loan.interestRate) * 100;
  const sc          = statusConfig(loan.status);
  const StatusIcon  = sc.icon;
  const isActive    = loan.status === "ACTIVE";
  const visibleSchedule = schedule.slice(0, scheduleLimit);
  const paidPayments = (loan.payments ?? []).filter((p) => p.status === "PAID").length;

  return (
    <div className="max-w-lg mx-auto lg:max-w-2xl pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Home size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Mortgage</p>
            <p className="text-3xl font-bold leading-tight">{formatCurrency(outstanding)}</p>
            <p className="text-white/40 text-xs mt-0.5">Outstanding balance</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${sc.bg} ${sc.border} ${sc.color}`}>
            <StatusIcon size={11} />
            {sc.label}
          </div>
        </div>
        {/* Progress */}
        <div>
          <div className="flex justify-between text-[11px] text-white/50 mb-1.5">
            <span>{progress.toFixed(1)}% repaid</span>
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

      <div className="px-4 -mt-6 space-y-3">
        {/* Key stats */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-[#F0F0F0]">
            {[
              { icon: Percent,   label: "Rate",        value: `${rate.toFixed(1)}%`                        },
              { icon: Banknote,  label: "Monthly",     value: formatCurrency(Number(loan.monthlyPayment))  },
              { icon: Calendar,  label: "Term",        value: `${Math.round(loan.termMonths / 12)}yr`      },
              { icon: TrendingDown, label: "Payments", value: `${paidPayments}/${loan.termMonths}`         },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 px-1">
                <Icon size={13} className="text-[#BBBBBB] mb-1" />
                <p className="text-[9px] text-[#AAAAAA] uppercase tracking-wide text-center leading-tight">{label}</p>
                <p className="text-xs font-bold text-[#333] mt-0.5 text-center">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Repay success banner */}
        {repaySuccess !== null && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Payment processed. Remaining balance: {formatCurrency(repaySuccess)}
            </p>
          </div>
        )}

        {/* Next payment */}
        {isActive && loan.nextPaymentDate && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-[#DB0011]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#AAAAAA] uppercase tracking-wide font-semibold">Next payment</p>
                  <p className="text-sm font-bold text-[#333]">{formatDate(loan.nextPaymentDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#AAAAAA]">Amount due</p>
                <p className="text-lg font-bold text-[#DB0011]">{formatCurrency(Number(loan.nextPaymentAmount ?? loan.monthlyPayment))}</p>
              </div>
            </div>
            <button
              onClick={() => setShowRepay(true)}
              className="mt-3 w-full h-11 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] transition-colors"
            >
              Make a payment
            </button>
          </div>
        )}

        {/* PENDING state */}
        {loan.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
            <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Application under review</p>
              <p className="text-xs text-amber-600 mt-0.5">A mortgage advisor will be in touch within 2 business days.</p>
            </div>
          </div>
        )}

        {/* Payment history */}
        {loan.payments && loan.payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#F5F5F5]">
              <p className="text-sm font-bold text-[#333]">Payment history</p>
            </div>
            <div>
              {loan.payments.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < loan.payments!.length - 1 ? "border-b border-[#F8F8F8]" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      p.status === "PAID" ? "bg-green-500" :
                      p.status === "MISSED" ? "bg-[#DB0011]" : "bg-amber-400"
                    }`} />
                    <div>
                      <p className="text-xs text-[#555] font-medium">{formatDate(p.paymentDate)}</p>
                      {p.principalPortion && p.interestPortion && (
                        <p className="text-[10px] text-[#AAAAAA]">
                          P: {formatCurrency(Number(p.principalPortion))} · I: {formatCurrency(Number(p.interestPortion))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase ${
                      p.status === "PAID" ? "text-green-600" :
                      p.status === "MISSED" ? "text-[#DB0011]" : "text-amber-600"
                    }`}>{p.status}</span>
                    <p className="text-xs font-bold text-[#333]">{formatCurrency(Number(p.amount))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amortization schedule */}
        {schedule.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <button
              onClick={() => setShowSchedule((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#FAFAFA] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <Landmark size={15} className="text-[#767676]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#333]">Amortization schedule</p>
                  <p className="text-xs text-[#AAAAAA]">{schedule.length} payments · {Math.round(loan.termMonths / 12)} year term</p>
                </div>
              </div>
              {showSchedule ? <ChevronUp size={16} className="text-[#CCCCCC]" /> : <ChevronDown size={16} className="text-[#CCCCCC]" />}
            </button>

            {showSchedule && (
              <div className="border-t border-[#F5F5F5]">
                {/* Header row */}
                <div className="grid grid-cols-5 px-4 py-2 bg-[#FAFAFA] border-b border-[#F0F0F0]">
                  {["#", "Date", "Payment", "Principal", "Balance"].map((h) => (
                    <p key={h} className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wide text-center">{h}</p>
                  ))}
                </div>
                {visibleSchedule.map((entry, i) => {
                  const isPast = new Date(entry.dueDate) < new Date();
                  return (
                    <div
                      key={entry.paymentNumber}
                      className={`grid grid-cols-5 px-4 py-2.5 text-center ${i < visibleSchedule.length - 1 ? "border-b border-[#F8F8F8]" : ""} ${isPast ? "opacity-50" : ""}`}
                    >
                      <p className="text-[11px] text-[#AAAAAA]">{entry.paymentNumber}</p>
                      <p className="text-[11px] text-[#555]">{new Date(entry.dueDate).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</p>
                      <p className="text-[11px] font-semibold text-[#333]">£{entry.payment.toFixed(0)}</p>
                      <p className="text-[11px] text-green-600">£{entry.principal.toFixed(0)}</p>
                      <p className="text-[11px] text-[#555]">£{Math.max(0, entry.balance).toFixed(0)}</p>
                    </div>
                  );
                })}
                {scheduleLimit < schedule.length && (
                  <button
                    onClick={() => setScheduleLimit((l) => Math.min(l + 24, schedule.length))}
                    className="w-full py-3 text-xs font-semibold text-[#DB0011] hover:bg-red-50 transition-colors border-t border-[#F5F5F5]"
                  >
                    Show more ({schedule.length - scheduleLimit} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mortgage details summary */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-[#333]">Loan summary</p>
          {[
            { label: "Original amount",    value: formatCurrency(principal)                      },
            { label: "Outstanding",        value: formatCurrency(outstanding)                    },
            { label: "Amount repaid",      value: formatCurrency(paid)                           },
            { label: "Interest rate",      value: `${rate.toFixed(2)}% p.a.`                    },
            { label: "Monthly payment",    value: formatCurrency(Number(loan.monthlyPayment))    },
            { label: "Term",               value: `${loan.termMonths} months (${Math.round(loan.termMonths / 12)} years)` },
            ...(loan.disbursedAt ? [{ label: "Disbursed", value: formatDate(loan.disbursedAt) }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-[#767676]">{label}</span>
              <span className="font-semibold text-[#333]">{value}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-center text-[#CCCCCC] pb-2">
          Your home may be repossessed if you do not keep up repayments. Lumina Bank is authorised and regulated by the FCA.
        </p>
      </div>

      {showRepay && loan && (
        <RepayModal
          loan={loan}
          onClose={() => setShowRepay(false)}
          onSuccess={handleRepaySuccess}
        />
      )}
    </div>
  );
}
