"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Filter, X, ArrowLeftRight, Download, ChevronLeft } from "lucide-react";
import { transactionsApi, type Transaction } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = [
  "All", "SHOPPING", "FOOD", "TRANSPORT", "UTILITIES",
  "ENTERTAINMENT", "HEALTH", "TRAVEL", "OTHER",
];

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"all" | "debit" | "credit">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(
    async (reset = false) => {
      if (reset) { setLoading(true); setOffset(0); }
      setError("");
      try {
        const res = await transactionsApi.list({
          limit: PAGE_SIZE,
          offset: reset ? 0 : offset,
          category: category !== "All" ? category : undefined,
          type: type !== "all" ? type : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        const data = res.data.data;
        setTransactions(reset ? data : (prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
        if (!reset) setOffset((prev) => prev + data.length);
      } catch {
        setError(t("transactions.couldNotLoad"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, type, startDate, endDate, offset, t]
  );

  useEffect(() => {
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type, startDate, endDate]);

  function handleRefresh() { setRefreshing(true); fetchTransactions(true); }

  async function handleExport() {
    try {
      const res = await transactionsApi.export({ dateFrom: startDate || undefined, dateTo: endDate || undefined });
      const blob = new Blob([res.data as unknown as string], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumina-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = formatDate(tx.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const hasActiveFilters = category !== "All" || type !== "all" || startDate || endDate;
  const creditCount = transactions.filter((tx) => tx.type === "CREDIT").length;
  const debitCount = transactions.filter((tx) => tx.type === "DEBIT").length;

  const typeLabels: Record<"all" | "debit" | "credit", string> = {
    all: t("transactions.all"),
    debit: t("transactions.debit"),
    credit: t("transactions.credit"),
  };

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white lg:px-10 lg:py-8">
        <div className="relative flex items-center justify-center mb-4">
          <button
            onClick={() => router.back()}
            className="absolute left-0 flex items-center justify-center h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("transactions.title")}</h1>
          </div>
          <div className="absolute right-0 flex items-center gap-2">
            <button
              onClick={handleExport}
              aria-label={t("transactions.export")}
              className="flex items-center justify-center h-8 w-8 bg-white/15 border border-white/20 text-white rounded-full hover:bg-white/25 transition-colors"
            >
              <Download size={14} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label={t("transactions.refresh")}
              className="flex items-center justify-center h-8 w-8 bg-white/15 border border-white/20 text-white rounded-full hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-8 relative z-10 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden lg:mx-auto lg:max-w-5xl">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex gap-1.5">
            {(["all", "debit", "credit"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setType(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  type === tab ? "bg-[#1a1a2e] text-white shadow-sm" : "bg-[#F5F5F5] text-[#777]"
                }`}
              >
                {typeLabels[tab]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              showFilters || hasActiveFilters ? "bg-[#DB0011] text-white" : "bg-[#F5F5F5] text-[#777]"
            }`}
          >
            <Filter size={12} />
            {t("transactions.filters")}
            {hasActiveFilters && (
              <span className="h-4 w-4 bg-white text-[#DB0011] text-[9px] rounded-full flex items-center justify-center font-black">!</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#F0F0F0] pt-3">
            <div>
              <p className="text-[10px] font-bold text-[#AAAAAA] mb-2 uppercase tracking-widest">{t("transactions.category")}</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      category === cat
                        ? "bg-[#DB0011] text-white border-[#DB0011]"
                        : "bg-white text-[#777] border-[#E8E8E8]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold text-[#AAAAAA] mb-1 uppercase tracking-widest">{t("transactions.from")}</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#DB0011]"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#AAAAAA] mb-1 uppercase tracking-widest">{t("transactions.to")}</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#DB0011]"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setCategory("All"); setType("all"); setStartDate(""); setEndDate(""); }}
                className="flex items-center gap-1 text-xs font-semibold text-[#DB0011]"
              >
                <X size={12} /> {t("transactions.clearFilters")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden lg:mx-auto lg:max-w-5xl">
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}
        {loading ? (
          <SkeletonList count={10} />
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            title={t("transactions.noTransactions")}
            description={t("transactions.noTransactionsDesc")}
          />
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#EFEFEF]">
                <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{date}</p>
              </div>
              {txs.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))
        )}
        {hasMore && transactions.length > 0 && (
          <div className="p-4">
            <Button variant="secondary" fullWidth onClick={() => fetchTransactions(false)} isLoading={loading && offset > 0}>
              {t("transactions.loadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
