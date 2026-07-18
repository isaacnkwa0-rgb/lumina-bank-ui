"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, CheckCircle2,
  Clock, XCircle, RotateCcw, Copy, ChevronRight,
  ShoppingBag, Coffee, Utensils, Car, Home, Zap, Heart,
  Plane, Gamepad2, ArrowLeftRight, CreditCard, Banknote,
  Globe, Minus, TrendingUp, BarChart2, MoreHorizontal,
} from "lucide-react";
import { transactionsApi, type Transaction } from "@/lib/api";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  SHOPPING:      { icon: ShoppingBag,    color: "text-purple-600",  bg: "bg-purple-100",  label: "Shopping"      },
  FOOD:          { icon: Utensils,       color: "text-orange-600",  bg: "bg-orange-100",  label: "Food & Drink"  },
  COFFEE:        { icon: Coffee,         color: "text-amber-700",   bg: "bg-amber-100",   label: "Coffee"        },
  TRANSPORT:     { icon: Car,            color: "text-blue-600",    bg: "bg-blue-100",    label: "Transport"     },
  HOUSING:       { icon: Home,           color: "text-teal-600",    bg: "bg-teal-100",    label: "Housing"       },
  UTILITIES:     { icon: Zap,            color: "text-yellow-600",  bg: "bg-yellow-100",  label: "Utilities"     },
  HEALTH:        { icon: Heart,          color: "text-rose-500",    bg: "bg-rose-100",    label: "Health"        },
  TRAVEL:        { icon: Plane,          color: "text-sky-600",     bg: "bg-sky-100",     label: "Travel"        },
  ENTERTAINMENT: { icon: Gamepad2,       color: "text-indigo-600",  bg: "bg-indigo-100",  label: "Entertainment" },
  CARD_PAYMENT:  { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100",  label: "Card Payment"  },
  TRANSFER:      { icon: ArrowLeftRight, color: "text-blue-600",    bg: "bg-blue-100",    label: "Transfer"      },
  PAYMENT:       { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100",  label: "Payment"       },
  SALARY:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100",   label: "Salary"        },
  INCOME:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100",   label: "Income"        },
  DEPOSIT:       { icon: ArrowDownLeft,  color: "text-green-600",   bg: "bg-green-100",   label: "Deposit"       },
  WITHDRAWAL:    { icon: ArrowUpRight,   color: "text-rose-600",    bg: "bg-rose-100",    label: "Withdrawal"    },
  REFUND:        { icon: RotateCcw,      color: "text-teal-600",    bg: "bg-teal-100",    label: "Refund"        },
  FX:            { icon: Globe,          color: "text-blue-600",    bg: "bg-blue-100",    label: "FX Transfer"   },
  FEE:           { icon: Minus,          color: "text-[#767676]",   bg: "bg-[#F0F0F0]",  label: "Fee"           },
  INTEREST:      { icon: TrendingUp,     color: "text-emerald-600", bg: "bg-emerald-100", label: "Interest"      },
  INVESTMENT:    { icon: BarChart2,      color: "text-sky-600",     bg: "bg-sky-100",     label: "Investment"    },
  OTHER:         { icon: MoreHorizontal, color: "text-[#767676]",   bg: "bg-[#F0F0F0]",  label: "Other"         },
};

function getCategoryConfig(category: string) {
  return categoryConfig[category?.toUpperCase()] ?? categoryConfig["OTHER"];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  COMPLETED: { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-100",  label: "Completed"  },
  PENDING:   { icon: Clock,        color: "text-amber-600",  bg: "bg-amber-100",  label: "Pending"    },
  FAILED:    { icon: XCircle,      color: "text-red-600",    bg: "bg-red-100",    label: "Failed"     },
  REVERSED:  { icon: RotateCcw,    color: "text-blue-600",   bg: "bg-blue-100",   label: "Reversed"   },
};

function getStatusConfig(status: string) {
  return statusConfig[status?.toUpperCase()] ?? statusConfig["PENDING"];
}

function DetailRow({ label, value, mono = false, copyable = false }: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#F5F5F5] last:border-0">
      <p className="text-xs text-[#AAAAAA] font-medium">{label}</p>
      <div className="flex items-center gap-1.5 max-w-[60%]">
        <p className={`text-sm text-[#222] text-right ${mono ? "font-mono" : "font-medium"} truncate`}>{value}</p>
        {copyable && (
          <button onClick={copy} className="flex-shrink-0 ml-1">
            {copied
              ? <CheckCircle2 size={13} className="text-green-500" />
              : <Copy size={13} className="text-[#CCCCCC] hover:text-[#999]" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
      <div className="px-4 pt-3.5 pb-1">
        <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 pb-1">
        {children}
      </div>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    transactionsApi
      .get(id)
      .then((res) => setTx(res.data.data))
      .catch(() => setError("Transaction not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg lg:max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-16">
          <button onClick={() => router.back()} className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center mb-6">
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-white/10 animate-pulse mb-4" />
            <div className="h-8 w-36 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="mx-4 -mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-[#F0F0F0] rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 pt-20 text-center">
        <XCircle size={40} className="text-[#E3E3E3] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#333]">{error || "Transaction not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-[#DB0011] font-semibold">
          Go back
        </button>
      </div>
    );
  }

  const isDebit = tx.type === "DEBIT";
  const cat = getCategoryConfig(tx.category);
  const Icon = cat.icon;
  const status = getStatusConfig(tx.status);
  const StatusIcon = status.icon;

  const displayName = tx.merchantName || tx.counterpartyName || tx.description;
  const subtitle = (tx.merchantName || tx.counterpartyName) ? tx.description : null;

  const balanceBefore = Number(tx.balanceBefore);
  const balanceAfter = Number(tx.balanceAfter);
  const amount = Number(tx.amount);

  const hasCounterparty = tx.counterpartyName || tx.counterpartyAccountNumber || tx.counterpartyBank;
  const hasMerchant = tx.merchantName || tx.merchantCategory;

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto pb-10">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-16 text-white">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center mb-6"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>

        <div className="flex flex-col items-center">
          {/* Category icon */}
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#DB0011] flex items-center justify-center ${isDebit ? "bg-white" : "bg-green-400"}`}>
              {isDebit
                ? <ArrowUpRight size={12} className="text-[#DB0011]" />
                : <ArrowDownLeft size={12} className="text-white" />
              }
            </div>
          </div>

          {/* Amount */}
          <p className="text-4xl font-bold tracking-tight mb-1">
            {isDebit ? "−" : "+"}{formatCurrency(amount, tx.currency)}
          </p>

          {/* Merchant/description */}
          <p className="text-white/80 text-sm font-medium mb-1">{displayName}</p>
          {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}

          {/* Status pill */}
          <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
            <StatusIcon size={12} className={status.color} />
            <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="-mt-6 pt-0 space-y-0">
        {/* Transaction info */}
        <SectionCard title="Transaction details">
          <DetailRow label="Reference" value={tx.reference} mono copyable />
          <DetailRow label="Date" value={formatDate(tx.createdAt)} />
          <DetailRow label="Time" value={formatTime(tx.createdAt)} />
          {tx.valueDate && tx.valueDate !== tx.createdAt && (
            <DetailRow label="Value date" value={formatDate(tx.valueDate)} />
          )}
          <DetailRow label="Category" value={cat.label} />
          {tx.merchantCategory && tx.merchantCategory !== cat.label && (
            <DetailRow label="Merchant category" value={tx.merchantCategory} />
          )}
          <DetailRow label="Type" value={isDebit ? "Debit" : "Credit"} />
        </SectionCard>

        {/* Merchant / counterparty */}
        {(hasMerchant || hasCounterparty) && (
          <SectionCard title={hasCounterparty ? "Counterparty" : "Merchant"}>
            {tx.merchantName && <DetailRow label="Merchant" value={tx.merchantName} />}
            {tx.counterpartyName && <DetailRow label="Name" value={tx.counterpartyName} />}
            {tx.counterpartyAccountNumber && (
              <DetailRow label="Account" value={tx.counterpartyAccountNumber} mono copyable />
            )}
            {tx.counterpartyBank && <DetailRow label="Bank" value={tx.counterpartyBank} />}
          </SectionCard>
        )}

        {/* Description */}
        <SectionCard title="Description">
          <div className="py-3">
            <p className="text-sm text-[#333] leading-relaxed">{tx.description}</p>
          </div>
        </SectionCard>

        {/* Balance impact */}
        <SectionCard title="Account impact">
          <DetailRow label="Balance before" value={formatCurrency(balanceBefore, tx.currency)} />
          <DetailRow label="Balance after" value={formatCurrency(balanceAfter, tx.currency)} />
          <div className="flex items-center justify-between py-3.5">
            <p className="text-xs text-[#AAAAAA] font-medium">Change</p>
            <p className={`text-sm font-bold ${isDebit ? "text-[#DB0011]" : "text-green-600"}`}>
              {isDebit ? "−" : "+"}{formatCurrency(amount, tx.currency)}
            </p>
          </div>
        </SectionCard>

        {/* Failure reason */}
        {tx.failureReason && (
          <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Failure reason</p>
            <p className="text-sm text-red-700">{tx.failureReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mx-4 mt-1 bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <button
            onClick={() => router.push(`/disputes/new?txId=${tx.id}&txRef=${encodeURIComponent(tx.reference)}&txDesc=${encodeURIComponent(tx.description)}`)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors active:bg-[#F0F0F0]"
          >
            <span className="text-sm font-medium text-[#333]">Report an issue</span>
            <ChevronRight size={16} className="text-[#CCCCCC]" />
          </button>
          <button
            onClick={() => {
              const text = [
                `Reference: ${tx.reference}`,
                `Amount: ${isDebit ? "-" : "+"}${formatCurrency(amount, tx.currency)}`,
                `Date: ${formatDate(tx.createdAt)} ${formatTime(tx.createdAt)}`,
                `Status: ${status.label}`,
                `Description: ${tx.description}`,
              ].join("\n");
              navigator.clipboard.writeText(text);
            }}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#FAFAFA] transition-colors active:bg-[#F0F0F0]"
          >
            <span className="text-sm font-medium text-[#333]">Copy receipt</span>
            <Copy size={16} className="text-[#CCCCCC]" />
          </button>
        </div>
      </div>
    </div>
  );
}
