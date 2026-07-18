"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  Receipt,
  PlusCircle,
  MoreHorizontal,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  accountsApi,
  transactionsApi,
  goalsApi,
  type Account,
  type Transaction,
  type Goal,
} from "@/lib/api";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMoreSheet } from "@/lib/more-sheet-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { openSheet } = useMoreSheet();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [accRes, txRes, goalRes] = await Promise.all([
        accountsApi.list(),
        transactionsApi.list({ limit: 5 }),
        goalsApi.list(),
      ]);
      setAccounts(accRes.data.data);
      setTransactions(txRes.data.data);
      setGoals(goalRes.data.data);
    } catch (err: unknown) {
      const msg = (err as { message?: string; response?: { status?: number; data?: { message?: string } } });
      setError(`Error ${msg?.response?.status ?? ""}: ${msg?.response?.data?.message ?? msg?.message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const primaryCurrency = accounts[0]?.currency || "GBP";

  const quickActions = [
    { label: "Send",   icon: Send,           href: "/transfer" },
    { label: "Pay",    icon: Receipt,         href: "/pay" },
    { label: "Top Up", icon: PlusCircle,      href: "/topup" },
    { label: "More",   icon: MoreHorizontal,  href: null },
  ];

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto">
      {/* Hero balance card */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-6">
        {loading ? (
          <div>
            <SkeletonBlock className="h-3 w-32 mb-3 bg-white/30" />
            <SkeletonBlock className="h-10 w-48 mb-2 bg-white/30" />
            <SkeletonBlock className="h-3 w-24 bg-white/20" />
          </div>
        ) : (
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
              {user ? `Hello, ${user.firstName}` : "Total balance"}
            </p>
            <p className="text-white text-4xl font-bold mb-1">
              {formatCurrency(totalBalance, primaryCurrency)}
            </p>
            <p className="text-white/60 text-xs">
              Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white border-b border-[#E3E3E3] px-4 py-5">
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(({ label, icon: Icon, href }) =>
            href ? (
              <Link key={label} href={href} className="flex flex-col items-center gap-2 group">
                <div className="h-12 w-12 rounded-full bg-[#F8F8F8] border border-[#E3E3E3] flex items-center justify-center group-hover:bg-red-50 group-hover:border-[#DB0011] transition-colors">
                  <Icon size={20} className="text-[#DB0011]" />
                </div>
                <span className="text-xs text-[#333333] font-medium">{label}</span>
              </Link>
            ) : (
              <button key={label} onClick={openSheet} className="flex flex-col items-center gap-2 group">
                <div className="h-12 w-12 rounded-full bg-[#F8F8F8] border border-[#E3E3E3] flex items-center justify-center group-hover:bg-red-50 group-hover:border-[#DB0011] transition-colors">
                  <Icon size={20} className="text-[#DB0011]" />
                </div>
                <span className="text-xs text-[#333333] font-medium">{label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      {/* Your accounts */}
      <div className="bg-white mt-3 border-y border-[#E3E3E3]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E3E3]">
          <h2 className="text-sm font-semibold text-[#333333]">Your accounts</h2>
          <Link
            href="/accounts"
            className="text-xs text-[#DB0011] flex items-center gap-0.5 font-medium"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <div className="flex p-4 gap-3 w-max">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton rounded-sm w-[180px] h-[90px] flex-shrink-0"
                  />
                ))
              : accounts.map((acc) => (
                  <Link key={acc.id} href={`/accounts/${acc.id}`}>
                    <AccountMiniCard account={acc} />
                  </Link>
                ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white mt-3 border-y border-[#E3E3E3]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E3E3]">
          <h2 className="text-sm font-semibold text-[#333333]">
            Recent transactions
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="text-[#767676] hover:text-[#DB0011] transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <Link
              href="/transactions"
              className="text-xs text-[#DB0011] flex items-center gap-0.5 font-medium"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-[#E3E3E3] last:border-0">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-1/2 mb-2" />
                  <div className="skeleton h-2 w-1/3" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#767676]">
            No recent transactions
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} showDate />
            ))}
          </div>
        )}
      </div>

      {/* Savings goals */}
      {(goals.length > 0 || loading) && (
        <div className="bg-white mt-3 border-y border-[#E3E3E3] mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E3E3]">
            <h2 className="text-sm font-semibold text-[#333333]">
              Savings goals
            </h2>
            <Link
              href="/goals"
              className="text-xs text-[#DB0011] flex items-center gap-0.5 font-medium"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="px-4 py-3 space-y-4">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : goals.slice(0, 3).map((goal) => {
                  const progress = Math.min(
                    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
                    100
                  );
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-[#333333] flex items-center gap-1.5">
                          <span>{goal.emoji}</span>
                          {goal.name}
                        </span>
                        <span className="text-xs text-[#767676]">
                          {formatCurrency(Number(goal.currentAmount))} /{" "}
                          {formatCurrency(Number(goal.targetAmount))}
                        </span>
                      </div>
                      <div className="h-2 bg-[#E3E3E3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#DB0011] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {goal.targetDate && (
                        <p className="text-xs text-[#767676] mt-1">
                          Target: {new Date(goal.targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMiniCard({ account }: { account: Account }) {
  const colors: Record<string, string> = {
    CURRENT: "from-[#DB0011] to-[#8B000A]",
    SAVINGS: "from-blue-600 to-blue-800",
    BUSINESS: "from-gray-700 to-gray-900",
    ISA: "from-green-600 to-green-800",
    CREDIT: "from-purple-600 to-purple-800",
  };
  const gradient = colors[account.type] || colors["CURRENT"];

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-sm p-4 text-white w-[180px] flex-shrink-0`}
    >
      <p className="text-[10px] font-medium opacity-70 uppercase tracking-wide mb-2">
        {account.type}
      </p>
      <p className="text-lg font-bold mb-1">
        {formatCurrency(Number(account.balance), account.currency)}
      </p>
      <p className="text-[10px] opacity-60">
        ••••{account.accountNumber.slice(-4)}
      </p>
    </div>
  );
}
