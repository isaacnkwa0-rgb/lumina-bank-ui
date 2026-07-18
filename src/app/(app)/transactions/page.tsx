"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Filter, X, ArrowLeftRight, Download } from "lucide-react";
import { transactionsApi, type Transaction } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = [
  "All",
  "SHOPPING",
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "TRAVEL",
  "OTHER",
];

const PAGE_SIZE = 25;

export default function TransactionsPage() {
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
      if (reset) {
        setLoading(true);
        setOffset(0);
      }
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
        setError("Could not load transactions. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, type, startDate, endDate, offset]
  );

  useEffect(() => {
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type, startDate, endDate]);

  function handleRefresh() {
    setRefreshing(true);
    fetchTransactions(true);
  }

  async function handleExport() {
    try {
      const res = await transactionsApi.export({
        dateFrom: startDate || undefined,
        dateTo: endDate || undefined,
      });
      const blob = new Blob([res.data as unknown as string], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumina-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  // Group by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = formatDate(tx.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const hasActiveFilters =
    category !== "All" || type !== "all" || startDate || endDate;

  const creditCount = transactions.filter((t) => t.type === "CREDIT").length;
  const debitCount = transactions.filter((t) => t.type === "DEBIT").length;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">Transactions</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white/25 transition-colors"
            >
              <Download size={12} />
              CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
        {!loading && transactions.length > 0 && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold">{transactions.length}</p>
              <p className="text-white/40 text-xs">Loaded</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-green-400">{creditCount}</p>
              <p className="text-white/40 text-xs">Credits</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-white">{debitCount}</p>
              <p className="text-white/40 text-xs">Debits</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter bar floating over header */}
      <div className="mx-4 -mt-8 relative z-10 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex gap-1.5">
            {(["all", "debit", "credit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  type === t
                    ? "bg-[#1a1a2e] text-white shadow-sm"
                    : "bg-[#F5F5F5] text-[#777]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              showFilters || hasActiveFilters
                ? "bg-[#DB0011] text-white"
                : "bg-[#F5F5F5] text-[#777]"
            }`}
          >
            <Filter size={12} />
            Filters
            {hasActiveFilters && (
              <span className="h-4 w-4 bg-white text-[#DB0011] text-[9px] rounded-full flex items-center justify-center font-black">!</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#F0F0F0] pt-3">
            <div>
              <p className="text-[10px] font-bold text-[#AAAAAA] mb-2 uppercase tracking-widest">Category</p>
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
                <p className="text-[10px] font-bold text-[#AAAAAA] mb-1 uppercase tracking-widest">From</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#DB0011]"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#AAAAAA] mb-1 uppercase tracking-widest">To</p>
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
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}

        {loading ? (
          <SkeletonList count={10} />
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            title="No transactions"
            description="No transactions match the selected filters."
          />
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#EFEFEF]">
                <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">
                  {date}
                </p>
              </div>
              {txs.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))
        )}

        {hasMore && transactions.length > 0 && (
          <div className="p-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => fetchTransactions(false)}
              isLoading={loading && offset > 0}
            >
              Load more transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
