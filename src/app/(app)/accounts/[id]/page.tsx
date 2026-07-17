"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Search, Filter, Copy, Check } from "lucide-react";
import { accountsApi, transactionsApi, type Account, type Transaction } from "@/lib/api";
import { formatCurrency, maskAccountNumber, formatDate } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = ["All", "SHOPPING", "FOOD", "TRANSPORT", "UTILITIES", "ENTERTAINMENT", "OTHER"];
const PAGE_SIZE = 20;

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    accountsApi
      .get(id)
      .then((res) => setAccount(res.data.data))
      .catch(() => setError("Could not load account."))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchTransactions = useCallback(
    async (reset = false) => {
      setTxLoading(true);
      const currentOffset = reset ? 0 : offset;
      try {
        const res = await transactionsApi.list({
          accountId: id,
          limit: PAGE_SIZE,
          offset: currentOffset,
          category: category !== "All" ? category : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        const newTxs = res.data.data;
        setTransactions(reset ? newTxs : (prev) => [...prev, ...newTxs]);
        setHasMore(newTxs.length === PAGE_SIZE);
        if (!reset) setOffset(currentOffset + newTxs.length);
      } catch {
        // silently fail for tx
      } finally {
        setTxLoading(false);
      }
    },
    [id, category, startDate, endDate, offset]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, category, startDate, endDate]);

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const dateKey = formatDate(tx.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  const filtered = search
    ? transactions.filter(
        (tx) =>
          (tx.merchantName || tx.description)
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : transactions;

  const filteredGrouped = search
    ? { "Search results": filtered }
    : grouped;

  const typeColors: Record<string, string> = {
    CURRENT: "bg-[#DB0011]",
    SAVINGS: "bg-blue-600",
    BUSINESS: "bg-gray-700",
    ISA: "bg-green-600",
    CREDIT: "bg-purple-600",
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-[#333333] hover:text-[#DB0011] transition-colors -ml-1"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-semibold text-[#333333]">Account details</h1>
        </div>

        {account && (
          <div
            className={`${typeColors[account.type] || "bg-[#DB0011]"} px-5 py-6 text-white`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="bg-white/20 text-white border-0 mb-2">
                  {account.type}
                </Badge>
                <p className="text-xs opacity-70">
                  {maskAccountNumber(account.accountNumber)}
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(Number(account.balance), account.currency)}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Available: {formatCurrency(Number(account.availableBalance), account.currency)}
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-[#DB0011] px-5 py-6">
            <div className="skeleton bg-white/20 h-6 w-40 mb-3 rounded-sm" />
            <div className="skeleton bg-white/20 h-10 w-48 rounded-sm" />
          </div>
        )}
      </div>

      {/* Account details for receiving payments */}
      {account && (
        <div className="bg-white border-b border-[#E3E3E3] px-4 py-4">
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide mb-3">
            Receive money
          </p>
          <div className="space-y-2">
            <CopyRow label="Account number" value={account.accountNumber} />
            {account.sortCode && (
              <CopyRow label="Sort code" value={account.sortCode} />
            )}
            <CopyRow label="IBAN" value={account.iban} mono />
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white border-b border-[#E3E3E3] px-4 py-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#767676]" />
            <input
              type="search"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F8] border border-[#E3E3E3] rounded-sm focus:outline-none focus:border-[#DB0011]"
            />
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-sm transition-colors ${
              showFilters
                ? "border-[#DB0011] text-[#DB0011] bg-red-50"
                : "border-[#E3E3E3] text-[#767676]"
            }`}
          >
            <Filter size={14} />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                    category === cat
                      ? "bg-[#DB0011] text-white border-[#DB0011]"
                      : "bg-white text-[#767676] border-[#E3E3E3]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-[#E3E3E3] rounded-sm focus:outline-none focus:border-[#DB0011]"
                placeholder="From"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-[#E3E3E3] rounded-sm focus:outline-none focus:border-[#DB0011]"
                placeholder="To"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white border-b border-[#E3E3E3]">
        {txLoading && transactions.length === 0 ? (
          <SkeletonList count={8} />
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <EmptyState
            title="No transactions"
            description="No transactions match your search or filters."
          />
        ) : (
          Object.entries(filteredGrouped).map(([date, txs]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-[#F8F8F8] border-b border-[#E3E3E3]">
                <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">
                  {date}
                </p>
              </div>
              {txs.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))
        )}

        {hasMore && !search && (
          <div className="p-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => fetchTransactions(false)}
              isLoading={txLoading}
            >
              Load more
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}
    </div>
  );
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      done();
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#E3E3E3] last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-[#767676] mb-0.5">{label}</p>
        <p className={`text-sm text-[#333333] ${mono ? "font-mono tracking-wide" : "font-medium"}`}>
          {value}
        </p>
      </div>
      <button
        onClick={copy}
        className="ml-3 flex-shrink-0 p-1.5 rounded-sm text-[#767676] hover:text-[#DB0011] hover:bg-red-50 transition-colors"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
      </button>
    </div>
  );
}
