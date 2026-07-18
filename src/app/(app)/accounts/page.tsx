"use client";

import { useEffect, useState } from "react";
import { accountsApi, type Account } from "@/lib/api";
import { AccountCard } from "@/components/accounts/AccountCard";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCard, SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Landmark } from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    accountsApi
      .list()
      .then((res) => setAccounts(res.data.data))
      .catch(() => setError("Could not load accounts."))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalAvailable = accounts.reduce((s, a) => s + Number(a.availableBalance), 0);
  const primaryCurrency = accounts[0]?.currency || "GBP";

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">My Accounts</h1>
        </div>
        {!loading && accounts.length > 0 && (
          <div className="flex items-end gap-6">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Total balance</p>
              <p className="text-4xl font-bold">{formatCurrency(totalBalance, primaryCurrency)}</p>
              <p className="text-white/40 text-xs mt-1">
                {formatCurrency(totalAvailable, primaryCurrency)} available · {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div>
            <SkeletonBlock className="h-3 w-28 mb-2 bg-white/10 rounded" />
            <SkeletonBlock className="h-10 w-48 bg-white/10 rounded" />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={<Landmark size={40} className="text-[#E3E3E3]" />}
            title="No accounts found"
            description="Your accounts will appear here once set up."
          />
        ) : (
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))
        )}
      </div>
    </div>
  );
}
