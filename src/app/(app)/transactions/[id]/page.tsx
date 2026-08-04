"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, CheckCircle2,
  Clock, XCircle, RotateCcw, Copy, ChevronRight,
  ShoppingBag, Coffee, Utensils, Car, Home, Zap, Heart,
  Plane, Gamepad2, ArrowLeftRight, CreditCard, Banknote,
  Globe, Minus, TrendingUp, BarChart2, MoreHorizontal,
  Download, Share2,
} from "lucide-react";
import { transactionsApi, type Transaction } from "@/lib/api";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; labelKey: TranslationKey; labelEn: string }> = {
  SHOPPING:      { icon: ShoppingBag,    color: "text-purple-600",  bg: "bg-purple-100",  labelKey: "tx.catShopping",      labelEn: "Shopping"       },
  FOOD:          { icon: Utensils,       color: "text-orange-600",  bg: "bg-orange-100",  labelKey: "tx.catFood",          labelEn: "Food & Drink"   },
  COFFEE:        { icon: Coffee,         color: "text-amber-700",   bg: "bg-amber-100",   labelKey: "tx.catCoffee",        labelEn: "Coffee"         },
  TRANSPORT:     { icon: Car,            color: "text-blue-600",    bg: "bg-blue-100",    labelKey: "tx.catTransport",     labelEn: "Transport"      },
  HOUSING:       { icon: Home,           color: "text-teal-600",    bg: "bg-teal-100",    labelKey: "tx.catHousing",       labelEn: "Housing"        },
  UTILITIES:     { icon: Zap,            color: "text-yellow-600",  bg: "bg-yellow-100",  labelKey: "tx.catUtilities",     labelEn: "Utilities"      },
  HEALTH:        { icon: Heart,          color: "text-rose-500",    bg: "bg-rose-100",    labelKey: "tx.catHealth",        labelEn: "Health"         },
  TRAVEL:        { icon: Plane,          color: "text-sky-600",     bg: "bg-sky-100",     labelKey: "tx.catTravel",        labelEn: "Travel"         },
  ENTERTAINMENT: { icon: Gamepad2,       color: "text-indigo-600",  bg: "bg-indigo-100",  labelKey: "tx.catEntertainment", labelEn: "Entertainment"  },
  CARD_PAYMENT:  { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100",  labelKey: "tx.catCardPayment",   labelEn: "Card Payment"   },
  TRANSFER:      { icon: ArrowLeftRight, color: "text-blue-600",    bg: "bg-blue-100",    labelKey: "tx.catTransfer",      labelEn: "Transfer"       },
  PAYMENT:       { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100",  labelKey: "tx.catPayment",       labelEn: "Payment"        },
  SALARY:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100",   labelKey: "tx.catSalary",        labelEn: "Salary"         },
  INCOME:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100",   labelKey: "tx.catIncome",        labelEn: "Income"         },
  DEPOSIT:       { icon: ArrowDownLeft,  color: "text-green-600",   bg: "bg-green-100",   labelKey: "tx.catDeposit",       labelEn: "Deposit"        },
  WITHDRAWAL:    { icon: ArrowUpRight,   color: "text-rose-600",    bg: "bg-rose-100",    labelKey: "tx.catWithdrawal",    labelEn: "Withdrawal"     },
  REFUND:        { icon: RotateCcw,      color: "text-teal-600",    bg: "bg-teal-100",    labelKey: "tx.catRefund",        labelEn: "Refund"         },
  FX:            { icon: Globe,          color: "text-blue-600",    bg: "bg-blue-100",    labelKey: "tx.catFx",            labelEn: "FX Transfer"    },
  FEE:           { icon: Minus,          color: "text-[#767676]",   bg: "bg-[#F0F0F0]",  labelKey: "tx.catFee",           labelEn: "Fee"            },
  INTEREST:      { icon: TrendingUp,     color: "text-emerald-600", bg: "bg-emerald-100", labelKey: "tx.catInterest",      labelEn: "Interest"       },
  INVESTMENT:    { icon: BarChart2,      color: "text-sky-600",     bg: "bg-sky-100",     labelKey: "tx.catInvestment",    labelEn: "Investment"     },
  OTHER:         { icon: MoreHorizontal, color: "text-[#767676]",   bg: "bg-[#F0F0F0]",  labelKey: "tx.catOther",         labelEn: "Other"          },
};

function getCategoryConfig(category: string) {
  return categoryConfig[category?.toUpperCase()] ?? categoryConfig["OTHER"];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; labelKey: TranslationKey }> = {
  COMPLETED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", labelKey: "tx.statusCompleted" },
  PENDING:   { icon: Clock,        color: "text-amber-600", bg: "bg-amber-100", labelKey: "tx.statusPending"   },
  FAILED:    { icon: XCircle,      color: "text-red-600",   bg: "bg-red-100",   labelKey: "tx.statusFailed"    },
  REVERSED:  { icon: RotateCcw,    color: "text-blue-600",  bg: "bg-blue-100",  labelKey: "tx.statusReversed"  },
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

async function buildReceiptPdf(rows: { label: string; value: string }[], title: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const red: [number, number, number] = [219, 0, 17];
  const altRow: [number, number, number] = [248, 248, 248];

  doc.setFillColor(...red);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("◆ Lumina Bank", W / 2, 35, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(title, W / 2, 58, { align: "center" });

  let y = 100;
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...altRow);
      doc.rect(32, y - 14, W - 64, 28, "F");
    }
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(row.label, 48, y + 2);
    doc.setTextColor(34, 34, 34);
    doc.setFont("helvetica", "bold");
    doc.text(row.value, W - 48, y + 2, { align: "right" });
    y += 32;
  });

  doc.setDrawColor(230, 230, 230);
  doc.line(32, y + 8, W - 32, y + 8);
  y += 24;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("Lumina Bank plc  |  FCA Register No. 56754  |  FSCS protected up to £85,000", W / 2, y + 12, { align: "center" });
  doc.text(`Generated ${new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, W / 2, y + 26, { align: "center" });

  return doc.output("blob");
}

function TxReceiptActions({ tx, isDebit, amount, statusLabel }: {
  tx: Transaction; isDebit: boolean; amount: number; statusLabel: string;
}) {
  const [shared, setShared] = useState(false);

  const rows = [
    { label: "Reference", value: tx.reference },
    { label: "Amount", value: `${isDebit ? "-" : "+"}${formatCurrency(amount, tx.currency)}` },
    { label: "Date", value: `${formatDate(tx.createdAt)} ${formatTime(tx.createdAt)}` },
    { label: "Status", value: statusLabel },
    { label: "Description", value: tx.description },
    ...(tx.counterpartyName ? [{ label: "Recipient", value: tx.counterpartyName }] : []),
    ...(tx.counterpartyBank ? [{ label: "Bank", value: tx.counterpartyBank }] : []),
  ];
  const title = `Transaction Receipt - ${tx.reference.slice(0, 12).toUpperCase()}`;
  const filename = `lumina-receipt-${tx.reference.slice(0, 12).toLowerCase()}.pdf`;

  async function handleDownload() {
    const blob = await buildReceiptPdf(rows, title);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    const blob = await buildReceiptPdf(rows, title);
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: "Lumina Bank - " + title, files: [file] });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className="grid grid-cols-2">
      <button
        onClick={handleDownload}
        className="flex items-center justify-center gap-2 px-4 py-4 border-r border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors active:bg-[#F0F0F0]"
      >
        <Download size={15} className="text-[#DB0011]" />
        <span className="text-sm font-medium text-[#333]">Download</span>
      </button>
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 px-4 py-4 hover:bg-[#FAFAFA] transition-colors active:bg-[#F0F0F0]"
      >
        <Share2 size={15} className="text-[#DB0011]" />
        <span className="text-sm font-medium text-[#333]">{shared ? "Copied!" : "Share"}</span>
      </button>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    transactionsApi
      .get(id)
      .then((res) => setTx(res.data.data))
      .catch(() => setError(t("tx.notFound")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none">
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
      <div className="max-w-lg mx-auto lg:max-w-none px-4 pt-20 text-center">
        <XCircle size={40} className="text-[#E3E3E3] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#333]">{error || t("tx.notFound")}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-[#DB0011] font-semibold">
          {t("tx.goBack")}
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
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
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
            <span className={`text-xs font-bold ${status.color}`}>{t(status.labelKey)}</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="-mt-6 pt-0 space-y-0">
        {/* Transaction info */}
        <SectionCard title={t("tx.txDetails")}>
          <DetailRow label={t("tx.reference")} value={tx.reference} mono copyable />
          <DetailRow label={t("tx.date")} value={formatDate(tx.createdAt)} />
          <DetailRow label={t("tx.time")} value={formatTime(tx.createdAt)} />
          {tx.valueDate && tx.valueDate !== tx.createdAt && (
            <DetailRow label={t("tx.valueDate")} value={formatDate(tx.valueDate)} />
          )}
          <DetailRow label={t("tx.categoryLabel")} value={t(cat.labelKey)} />
          {tx.merchantCategory && tx.merchantCategory !== cat.labelEn && (
            <DetailRow label={t("tx.merchantCategoryLabel")} value={tx.merchantCategory} />
          )}
          <DetailRow label={t("tx.typeLabel")} value={isDebit ? t("tx.debit") : t("tx.credit")} />
        </SectionCard>

        {/* Merchant / counterparty */}
        {(hasMerchant || hasCounterparty) && (
          <SectionCard title={hasCounterparty ? t("tx.counterparty") : t("tx.merchantSection")}>
            {tx.merchantName && <DetailRow label={t("tx.merchantLabel")} value={tx.merchantName} />}
            {tx.counterpartyName && <DetailRow label={t("tx.nameLabel")} value={tx.counterpartyName} />}
            {tx.counterpartyAccountNumber && (
              <DetailRow label={t("tx.accountLabel")} value={tx.counterpartyAccountNumber} mono copyable />
            )}
            {tx.counterpartyBank && <DetailRow label={t("tx.bankLabel")} value={tx.counterpartyBank} />}
          </SectionCard>
        )}

        {/* Description */}
        <SectionCard title={t("tx.descSection")}>
          <div className="py-3">
            <p className="text-sm text-[#333] leading-relaxed">{tx.description}</p>
          </div>
        </SectionCard>

        {/* Balance impact */}
        <SectionCard title={t("tx.accountImpact")}>
          <DetailRow label={t("tx.balanceBefore")} value={formatCurrency(balanceBefore, tx.currency)} />
          <DetailRow label={t("tx.balanceAfter")} value={formatCurrency(balanceAfter, tx.currency)} />
          <div className="flex items-center justify-between py-3.5">
            <p className="text-xs text-[#AAAAAA] font-medium">{t("tx.change")}</p>
            <p className={`text-sm font-bold ${isDebit ? "text-[#DB0011]" : "text-green-600"}`}>
              {isDebit ? "−" : "+"}{formatCurrency(amount, tx.currency)}
            </p>
          </div>
        </SectionCard>

        {/* Failure reason */}
        {tx.failureReason && (
          <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">{t("tx.failureReason")}</p>
            <p className="text-sm text-red-700">{tx.failureReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mx-4 mt-1 bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <button
            onClick={() => router.push(`/disputes/new?txId=${tx.id}&txRef=${encodeURIComponent(tx.reference)}&txDesc=${encodeURIComponent(tx.description)}`)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors active:bg-[#F0F0F0]"
          >
            <span className="text-sm font-medium text-[#333]">{t("tx.reportIssue")}</span>
            <ChevronRight size={16} className="text-[#CCCCCC]" />
          </button>
          <TxReceiptActions tx={tx} isDebit={isDebit} amount={amount} statusLabel={t(status.labelKey)} />
        </div>
      </div>
    </div>
  );
}
