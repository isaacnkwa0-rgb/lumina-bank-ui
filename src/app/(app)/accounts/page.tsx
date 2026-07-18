"use client";

import { useEffect, useState } from "react";
import { accountsApi, type Account } from "@/lib/api";
import { AccountCard } from "@/components/accounts/AccountCard";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCard, SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Landmark, Plus, X, ChevronRight } from "lucide-react";

const ACCOUNT_TYPES = [
  {
    type: "SAVINGS",
    label: "Savings Account",
    description: "Earn interest on your savings with easy access.",
    rate: "4.5% AER",
    emoji: "💰",
  },
  {
    type: "BUSINESS",
    label: "Business Account",
    description: "Dedicated account for business transactions.",
    rate: "No fees for 12 months",
    emoji: "💼",
  },
  {
    type: "FIXED_DEPOSIT",
    label: "Fixed Deposit",
    description: "Lock in a higher rate for a set term.",
    rate: "Up to 5.2% AER",
    emoji: "🔒",
  },
  {
    type: "CURRENT",
    label: "Current Account",
    description: "Everyday spending and direct debits.",
    rate: "No monthly fee",
    emoji: "🏦",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof ACCOUNT_TYPES[number] | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  function load() {
    setLoading(true);
    accountsApi
      .list()
      .then((res) => setAccounts(res.data.data))
      .catch(() => setError("Could not load accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleOpenAccount() {
    if (!selectedType) return;
    setCreateError("");
    setCreating(true);
    try {
      await accountsApi.create({ type: selectedType.type, currency: "GBP" });
      setCreateSuccess(true);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || "Could not open account. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function closeSheet() {
    setOpenSheet(false);
    setSelectedType(null);
    setCreateError("");
    setCreateSuccess(false);
  }

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalAvailable = accounts.reduce((s, a) => s + Number(a.availableBalance), 0);
  const primaryCurrency = accounts[0]?.currency || "GBP";

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">My Accounts</h1>
          </div>
          <button
            onClick={() => setOpenSheet(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <Plus size={13} />
            Open Account
          </button>
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

      {/* Open Account Sheet */}
      {openSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeSheet} />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#333]">Open a new account</h2>
              <button onClick={closeSheet} className="p-1 text-[#999] hover:text-[#333]">
                <X size={18} />
              </button>
            </div>

            {createSuccess ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-base font-bold text-[#333] mb-1">Account opened!</p>
                <p className="text-sm text-[#767676] mb-5">
                  Your {selectedType?.label} has been created successfully.
                </p>
                <button
                  onClick={closeSheet}
                  className="w-full py-3 rounded-xl bg-[#DB0011] text-white font-bold text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-5">
                  {ACCOUNT_TYPES.map((at) => {
                    const selected = selectedType?.type === at.type;
                    return (
                      <button
                        key={at.type}
                        onClick={() => setSelectedType(at)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? "border-[#DB0011] bg-red-50"
                            : "border-[#E8E8E8] hover:border-[#D0D0D0]"
                        }`}
                      >
                        <span className="text-2xl">{at.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${selected ? "text-[#DB0011]" : "text-[#333]"}`}>
                            {at.label}
                          </p>
                          <p className="text-xs text-[#767676] leading-tight">{at.description}</p>
                          <p className="text-[10px] font-semibold text-[#AAAAAA] mt-0.5">{at.rate}</p>
                        </div>
                        <ChevronRight size={14} className={selected ? "text-[#DB0011]" : "text-[#CCCCCC]"} />
                      </button>
                    );
                  })}
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-sm text-[#DB0011]">{createError}</p>
                  </div>
                )}

                <button
                  onClick={handleOpenAccount}
                  disabled={!selectedType || creating}
                  className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
                >
                  {creating ? "Opening account…" : "Open account"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
