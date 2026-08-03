"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loansApi, type Loan, type LoanEligibility, type AmortizationEntry } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  Calendar, ChevronDown, ChevronUp, CheckCircle2,
  Clock, AlertCircle, Banknote, Percent, CreditCard,
  TrendingDown, Star, X, TableProperties,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

const LOAN_STATUS_KEYS: Record<string, TranslationKey> = {
  ACTIVE: "loans.statusActive", PAID_OFF: "loans.paidOff", DEFAULTED: "loans.defaulted",
};
const PAYMENT_STATUS_KEYS: Record<string, TranslationKey> = {
  PAID: "loans.paid", MISSED: "loans.missed", SCHEDULED: "loans.upcoming",
};

function statusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2 };
    case "PAID_OFF":  return { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   icon: Star         };
    case "DEFAULTED": return { color: "text-[#DB0011]",  bg: "bg-red-50",    border: "border-red-200",    icon: AlertCircle  };
    default:          return { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock        };
  }
}

function paymentStatusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":      return { color: "text-green-600" };
    case "MISSED":    return { color: "text-[#DB0011]" };
    case "SCHEDULED": return { color: "text-amber-600" };
    default:          return { color: "text-[#999]"    };
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

function RepayModal({ loan, onClose, onSuccess }: { loan: Loan; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(String(Number(loan.monthlyPayment).toFixed(2)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleRepay(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("Enter a valid amount."); return; }
    setError(""); setLoading(true);
    try {
      await loansApi.repay(loan.id, num);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Payment failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#333]">{t("loans.makePayment")}</h3>
          <button onClick={onClose} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-bold text-[#333]">Payment successful!</p>
            <p className="text-sm text-[#767676]">{formatCurrency(parseFloat(amount))} applied to your loan.</p>
          </div>
        ) : (
          <form onSubmit={handleRepay} className="space-y-4">
            <div className="bg-[#F8F8F8] rounded-xl p-3 flex justify-between text-sm">
              <span className="text-[#767676]">{t("loans.outstandingBalance")}</span>
              <span className="font-bold text-[#333]">{formatCurrency(Number(loan.outstandingBalance))}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Payment amount (£)</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-3 border-2 border-[#E3E3E3] rounded-xl text-lg font-bold text-center focus:outline-none focus:border-[#DB0011]" />
              <div className="flex gap-2 mt-2">
                {[Number(loan.monthlyPayment), Number(loan.outstandingBalance)].map((v) => (
                  <button key={v} type="button" onClick={() => setAmount(v.toFixed(2))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F5F5] text-[#555] hover:bg-[#EBEBEB] transition-colors">
                    {v === Number(loan.monthlyPayment) ? t("loans.monthlyPayment") : t("loans.fullSettlement")} ({formatCurrency(v)})
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-[#DB0011]">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] disabled:opacity-50 transition-colors">
              {loading ? t("loans.processing") : `${t("loans.pay")} ${formatCurrency(parseFloat(amount) || 0)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function LoanCard({ loan, onRefresh }: { loan: Loan; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [schedLoading, setSchedLoading] = useState(false);
  const [showRepay, setShowRepay] = useState(false);

  const principal    = Number(loan.principalAmount);
  const outstanding  = Number(loan.outstandingBalance);
  const paid         = principal - outstanding;
  const progress     = Math.min((paid / principal) * 100, 100);
  const rate         = Number(loan.interestRate);
  const sc           = statusConfig(loan.status);
  const StatusIcon   = sc.icon;
  const emoji        = LOAN_TYPE_ICONS[loan.type?.toUpperCase()] ?? "💳";
  const today        = new Date().toISOString().split("T")[0];

  async function loadSchedule() {
    if (schedule.length > 0) { setShowSchedule(true); return; }
    setSchedLoading(true);
    try {
      const res = await loansApi.schedule(loan.id);
      setSchedule(res.data.data.schedule);
      setShowSchedule(true);
    } catch {} finally { setSchedLoading(false); }
  }

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
            <p className="text-white/40 text-xs mt-1">{t("loans.outstandingBalance")}</p>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold ${sc.bg} ${sc.border} ${sc.color}`}>
            <StatusIcon size={11} />
            {LOAN_STATUS_KEYS[loan.status.toUpperCase()] ? t(LOAN_STATUS_KEYS[loan.status.toUpperCase()]) : loan.status}
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
          { icon: Percent,     label: t("loans.apr"),     value: `${rate.toFixed(1)}%`                         },
          { icon: Banknote,    label: t("loans.monthly"), value: formatCurrency(Number(loan.monthlyPayment))   },
          { icon: Calendar,    label: t("loans.term"),    value: `${loan.termMonths}mo`                        },
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
            <p className="text-[11px] text-[#AAAAAA] uppercase tracking-wide font-semibold">{t("loans.nextPayment")}</p>
            <p className="text-sm font-bold text-[#333]">{formatDate(loan.nextPaymentDate)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#AAAAAA]">{t("loans.amountDue")}</p>
          <p className="text-base font-bold text-[#DB0011]">{formatCurrency(Number(loan.nextPaymentAmount))}</p>
        </div>
      </div>

      {/* Repay + Schedule buttons for active loans */}
      {loan.status === "ACTIVE" && (
        <div className="flex gap-2 px-5 pb-4 pt-1">
          <button onClick={() => setShowRepay(true)}
            className="flex-1 py-2.5 rounded-xl bg-[#DB0011] text-white font-bold text-xs hover:bg-[#b0000d] transition-colors">
            {t("loans.makePayment")}
          </button>
          <button onClick={loadSchedule} disabled={schedLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-[#E8E8E8] text-[#555] font-semibold text-xs hover:border-[#DB0011] hover:text-[#DB0011] transition-colors disabled:opacity-50">
            <TableProperties size={12} />
            {schedLoading ? "Loading…" : "Schedule"}
          </button>
        </div>
      )}

      {/* Amortization schedule */}
      {showSchedule && schedule.length > 0 && (
        <div className="border-t border-[#F5F5F5]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F5F5]">
            <p className="text-xs font-bold text-[#555]">Repayment schedule ({schedule.length} payments)</p>
            <button onClick={() => setShowSchedule(false)} className="text-[#AAAAAA] hover:text-[#555]"><X size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {schedule.map((entry) => {
              const isPast  = entry.dueDate < today;
              const isCurr  = entry.dueDate.slice(0, 7) === today.slice(0, 7);
              return (
                <div key={entry.paymentNumber}
                  className={`flex items-center px-5 py-2.5 border-b border-[#F8F8F8] last:border-0 ${isCurr ? "bg-amber-50" : isPast ? "opacity-50" : ""}`}>
                  <span className="text-[11px] font-bold text-[#AAAAAA] w-6 flex-shrink-0">#{entry.paymentNumber}</span>
                  <span className="text-[11px] text-[#555] flex-1">{new Date(entry.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#333]">{formatCurrency(entry.payment)}</p>
                    <p className="text-[10px] text-[#AAAAAA]">{formatCurrency(entry.balance)} left</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payments toggle */}
      {loan.payments && loan.payments.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-[#555] hover:bg-[#FAFAFA] transition-colors border-t border-[#F5F5F5]"
          >
            <span>{t("loans.paymentHistory")} ({loan.payments.length})</span>
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
                      <span className={`text-[10px] font-semibold uppercase ${psc.color}`}>{PAYMENT_STATUS_KEYS[payment.status.toUpperCase()] ? t(PAYMENT_STATUS_KEYS[payment.status.toUpperCase()]) : payment.status}</span>
                      <p className="text-xs font-bold text-[#333]">{formatCurrency(Number(payment.amount))}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showRepay && <RepayModal loan={loan} onClose={() => setShowRepay(false)} onSuccess={onRefresh} />}
    </div>
  );
}

// ── Apply CTA ──────────────────────────────────────────────────────────────────

function ApplyCTA({ eligibility }: { eligibility: LoanEligibility | null }) {
  const router = useRouter();
  const { t } = useLanguage();
  const personalMax = eligibility?.eligibility?.PERSONAL ?? 0;
  const personalRate = eligibility?.annualRates?.PERSONAL;
  const hasEligibility = personalMax > 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] shadow-sm">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">{t("loans.needLoan")}</p>
            <p className="text-xl font-bold">
              {hasEligibility
                ? `Up to ${formatCurrency(personalMax)}`
                : t("loans.applyLoan")}
            </p>
            {hasEligibility && personalRate && (
              <p className="text-white/60 text-xs mt-1">{t("loans.personalRate")}</p>
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
            t("loans.personalRate"),
            t("loans.businessRate"),
            t("loans.decisionInstant"),
          ].map((text) => (
            <div key={text} className="bg-[#F8F8F8] rounded-xl p-2.5 text-center">
              <p className="text-xs font-bold text-[#333]">{text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/loans/apply")}
          className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
        >
          {t("loans.applyNow")}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoansPage() {
  const { t } = useLanguage();
  const [loans, setLoans]             = useState<Loan[]>([]);
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  function loadLoans() {
    Promise.all([loansApi.list(), loansApi.eligibility()])
      .then(([lRes, eRes]) => {
        setLoans(lRes.data.data);
        setEligibility(eRes.data.data);
      })
      .catch(() => setError("Could not load loan information."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadLoans(); }, []);

  const totalOutstanding = loans.reduce((s, l) => s + Number(l.outstandingBalance), 0);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("loans.title")}</h1>
        </div>
        {!loading && loans.length > 0 && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("loans.totalOutstanding")}</p>
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
            {loans.map((loan) => <LoanCard key={loan.id} loan={loan} onRefresh={loadLoans} />)}
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
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">{t("loans.totalMonthly")}</p>
              <p className="text-sm font-bold text-[#333]">
                {formatCurrency(loans.reduce((s, l) => s + Number(l.monthlyPayment), 0))}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E8E8] p-3.5 flex items-center gap-2.5">
            <Percent size={16} className="text-amber-500" />
            <div>
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">{t("loans.avgRate")}</p>
              <p className="text-sm font-bold text-[#333]">
                {loans.length
                  ? `${(loans.reduce((s, l) => s + Number(l.interestRate), 0) / loans.length).toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
