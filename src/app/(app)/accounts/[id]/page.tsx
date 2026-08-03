"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Search, Filter, Copy, Check, Download } from "lucide-react";
import { accountsApi, transactionsApi, type Account, type Transaction } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
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
  const { t } = useLanguage();
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
  const [downloading, setDownloading] = useState(false);

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

  async function downloadStatement() {
    if (!account) return;
    setDownloading(true);
    try {
      const res = await accountsApi.statement(id, {
        dateFrom: startDate || undefined,
        dateTo: endDate || undefined,
      });
      const txs: Transaction[] = res.data.data;
      const dateLabel = startDate && endDate
        ? `${startDate} to ${endDate}`
        : startDate ? `from ${startDate}` : endDate ? `to ${endDate}` : "All transactions";
      const rows = txs.map((tx) => {
        const credit = tx.type === "CREDIT" ? `+${formatCurrency(Number(tx.amount), account.currency)}` : "";
        const debit  = tx.type === "DEBIT"  ? `-${formatCurrency(Number(tx.amount), account.currency)}` : "";
        return `<tr>
          <td>${new Date(tx.createdAt).toLocaleDateString("en-GB")}</td>
          <td>${tx.merchantName || tx.description || "—"}</td>
          <td style="color:#16a34a;font-weight:600">${credit}</td>
          <td style="color:#DB0011;font-weight:600">${debit}</td>
          <td>${tx.category || "—"}</td>
        </tr>`;
      }).join("");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Account Statement – Lumina Bank</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;padding:40px}
          .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #DB0011}
          .logo{display:flex;align-items:center;gap:12px}
          .diamond{width:36px;height:36px}
          .bank-name{font-size:20px;font-weight:800;color:#DB0011;letter-spacing:.5px}
          .bank-sub{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px}
          .meta p{font-size:12px;color:#555;text-align:right;margin-bottom:2px}
          .meta strong{color:#111}
          .section{margin:24px 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:1.5px}
          .account-card{background:#f8f8f8;border-left:4px solid #DB0011;padding:14px 18px;margin-bottom:24px;border-radius:4px}
          .account-card p{font-size:12px;color:#555;margin-bottom:3px}
          .account-card .balance{font-size:22px;font-weight:800;color:#111;margin-top:4px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th{background:#0D0D14;color:#fff;padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px}
          td{padding:9px 12px;border-bottom:1px solid #f0f0f0;color:#333}
          tr:nth-child(even) td{background:#fafafa}
          .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center}
          @media print{body{padding:20px}button{display:none}}
        </style>
      </head><body>
        <div class="header">
          <div class="logo">
            <svg class="diamond" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#DB0011"/>
              <path d="M12 6L18 12L12 18L6 12L12 6Z" fill="rgba(219,0,17,0.3)"/>
            </svg>
            <div>
              <div class="bank-name">Lumina Bank</div>
              <div class="bank-sub">Account Statement</div>
            </div>
          </div>
          <div class="meta">
            <p>Generated: <strong>${new Date().toLocaleDateString("en-GB", { day:"numeric",month:"long",year:"numeric" })}</strong></p>
            <p>Period: <strong>${dateLabel}</strong></p>
          </div>
        </div>
        <div class="account-card">
          <p>Account type: <strong>${account.type}</strong> &nbsp;·&nbsp; ${account.currency}</p>
          <p>Account number: <strong>${account.accountNumber}</strong>${account.sortCode ? ` &nbsp;·&nbsp; Sort code: <strong>${account.sortCode}</strong>` : ""}</p>
          <p>IBAN: <strong>${account.iban}</strong></p>
          <div class="balance">${formatCurrency(Number(account.balance), account.currency)}</div>
        </div>
        <p class="section">Transactions (${txs.length})</p>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Credit</th><th>Debit</th><th>Category</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='5' style='text-align:center;color:#aaa;padding:24px'>No transactions found</td></tr>"}</tbody>
        </table>
        <div class="footer">
          Lumina Bank · luminabank.online · This statement is auto-generated and does not require a signature.<br/>
          For queries contact support@luminabank.online
        </div>
      </body></html>`;
      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
    } catch {
      alert("Could not download statement. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

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
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-[#333333] hover:text-[#DB0011] transition-colors -ml-1"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-semibold text-[#333333]">{t("accountDetail.title")}</h1>
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
              <button
                onClick={downloadStatement}
                disabled={downloading}
                className="flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/25 transition-colors disabled:opacity-50"
              >
                <Download size={12} />
                {downloading ? "Preparing…" : "Statement"}
              </button>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(Number(account.balance), account.currency)}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {t("accountCard.available")} {formatCurrency(Number(account.availableBalance), account.currency)}
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
            {t("accountDetail.receiveMoney")}
          </p>
          <div className="space-y-2">
            <CopyRow label={t("accountDetail.accountNumber")} value={account.accountNumber} />
            {account.sortCode && (
              <CopyRow label={t("accountDetail.sortCode")} value={account.sortCode} />
            )}
            <CopyRow label={t("accountDetail.iban")} value={account.iban} mono />
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
              placeholder={t("accountDetail.search")}
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
            {t("accountDetail.filter")}
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
            title={t("accountDetail.noTransactions")}
            description={t("accountDetail.noTransactionsDesc")}
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
              {t("accountDetail.loadMore")}
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
