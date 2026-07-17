"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loansApi, type Loan } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  Home, ChevronDown, ChevronUp, CheckCircle2,
  Clock, AlertCircle, Calendar, Percent, Banknote, Star, TrendingDown,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

function statusConfig(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2, label: "Active"    };
    case "PAID_OFF":  return { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   icon: Star,         label: "Paid off"  };
    case "DEFAULTED": return { color: "text-[#DB0011]",  bg: "bg-red-50",    border: "border-red-200",    icon: AlertCircle,  label: "Defaulted" };
    default:          return { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock,        label: status      };
  }
}

function MortgageCard({ loan }: { loan: Loan }) {
  const [expanded, setExpanded] = useState(false);
  const principal   = Number(loan.principalAmount);
  const outstanding = Number(loan.outstandingBalance);
  const paid        = principal - outstanding;
  const progress    = Math.min((paid / principal) * 100, 100);
  const rate        = Number(loan.interestRate);
  const sc          = statusConfig(loan.status);
  const StatusIcon  = sc.icon;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-5 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏠</span>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Mortgage</p>
            </div>
            <p className="text-3xl font-bold leading-none">{formatCurrency(outstanding)}</p>
            <p className="text-white/40 text-xs mt-1">Outstanding balance</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold ${sc.bg} ${sc.border} ${sc.color}`}>
            <StatusIcon size={11} />
            {sc.label}
          </div>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-[#F0F0F0] border-b border-[#F0F0F0]">
        {[
          { icon: Percent,  label: "Rate",    value: `${rate.toFixed(1)}%`                       },
          { icon: Banknote, label: "Monthly", value: formatCurrency(Number(loan.monthlyPayment)) },
          { icon: Calendar, label: "Term",    value: `${loan.termMonths}mo`                      },
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

      {/* Payment history */}
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
              {loan.payments.slice(0, 6).map((payment, i) => (
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
                    <span className={`text-[10px] font-semibold uppercase ${
                      payment.status === "PAID" ? "text-green-600" :
                      payment.status === "MISSED" ? "text-[#DB0011]" : "text-amber-600"
                    }`}>{payment.status}</span>
                    <p className="text-xs font-bold text-[#333]">{formatCurrency(Number(payment.amount))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MortgagePage() {
  const router = useRouter();
  const [mortgages, setMortgages] = useState<Loan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    loansApi.list()
      .then((res) => {
        const all = res.data.data ?? [];
        setMortgages(all.filter((l) => l.type?.toUpperCase() === "MORTGAGE"));
      })
      .catch(() => setError("Could not load mortgage information."))
      .finally(() => setLoading(false));
  }, []);

  const totalOutstanding = mortgages.reduce((s, l) => s + Number(l.outstandingBalance), 0);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Home size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Mortgage</h1>
        </div>
        {!loading && mortgages.length > 0 && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Total outstanding</p>
            <p className="text-4xl font-bold">{formatCurrency(totalOutstanding)}</p>
            <p className="text-white/40 text-xs mt-1">
              {mortgages.length} mortgage{mortgages.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-4">
        {loading ? (
          Array.from({ length: 1 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-64 w-full rounded-2xl" />
          ))
        ) : mortgages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <EmptyState
              icon={<Home size={36} className="text-[#E0E0E0]" />}
              title="No active mortgages"
              description="Your mortgage products will appear here once approved."
            />
          </div>
        ) : (
          mortgages.map((loan) => <MortgageCard key={loan.id} loan={loan} />)
        )}

        {/* Apply CTA */}
        <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] shadow-sm">
          <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Home mortgage</p>
            <p className="text-xl font-bold">Buy your dream home</p>
            <p className="text-white/60 text-xs mt-1">From 3.9% fixed · Up to 30 years</p>
          </div>
          <div className="bg-white px-5 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Min rate", value: "3.9%" },
                { label: "Max term", value: "30 yrs" },
                { label: "LTV", value: "Up to 95%" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F8F8F8] rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-bold text-[#333] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/mortgage/apply")}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
            >
              Get a mortgage quote
            </button>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E8E8] p-3.5 flex items-center gap-2.5">
            <TrendingDown size={16} className="text-[#DB0011]" />
            <div>
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">Total monthly</p>
              <p className="text-sm font-bold text-[#333]">
                {formatCurrency(mortgages.reduce((s, l) => s + Number(l.monthlyPayment), 0))}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E8E8] p-3.5 flex items-center gap-2.5">
            <Percent size={16} className="text-amber-500" />
            <div>
              <p className="text-[10px] text-[#AAAAAA] uppercase tracking-wide">Avg rate</p>
              <p className="text-sm font-bold text-[#333]">
                {mortgages.length
                  ? `${(mortgages.reduce((s, l) => s + Number(l.interestRate), 0) / mortgages.length).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
