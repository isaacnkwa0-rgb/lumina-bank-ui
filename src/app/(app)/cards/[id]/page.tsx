"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Wifi,
  SnowflakeIcon,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  cardsApi,
  type Card,
  type CardControls,
  type CardLimits,
  type Transaction,
} from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<string>("");
  const [actionError, setActionError] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(true);

  // Limit editing state
  const [editingLimits, setEditingLimits] = useState(false);
  const [limitDraft, setLimitDraft] = useState<CardLimits>({ daily: 0, monthly: 0, perTransaction: 0 });
  const [limitsLoading, setLimitsLoading] = useState(false);

  useEffect(() => {
    cardsApi
      .get(id)
      .then((res) => {
        setCard(res.data.data);
        setLimitDraft(res.data.data.spendingLimits);
      })
      .catch(() => setError("Could not load card."))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchTransactions = useCallback(
    async (page: number) => {
      setTxLoading(true);
      try {
        const res = await cardsApi.getTransactions(id, { page, limit: 10 });
        const newTxs = res.data.data;
        setTransactions((prev) => (page === 1 ? newTxs : [...prev, ...newTxs]));
        setTxHasMore(newTxs.length === 10);
      } catch {
        // silent
      } finally {
        setTxLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  async function handleFreeze() {
    if (!card) return;
    setActionLoading("freeze");
    setActionError("");
    try {
      const fn = card.status === "FROZEN" ? cardsApi.unfreeze : cardsApi.freeze;
      const res = await fn(card.id);
      setCard(res.data.data);
    } catch {
      setActionError("Action failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleReportLost() {
    if (!card || !confirm("Report this card as lost or stolen? It will be permanently blocked.")) return;
    setActionLoading("report");
    setActionError("");
    try {
      const res = await cardsApi.reportLost(card.id);
      setCard(res.data.data);
    } catch {
      setActionError("Could not report card. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleReplace() {
    if (!card || !confirm("Replace this card? A new card will be issued and this one will be cancelled.")) return;
    setActionLoading("replace");
    setActionError("");
    try {
      const res = await cardsApi.replace(card.id);
      router.replace(`/cards/${res.data.data.id}`);
    } catch {
      setActionError("Could not replace card. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleUpdateControl(key: keyof CardControls, value: boolean) {
    if (!card) return;
    try {
      const res = await cardsApi.updateControls(card.id, { [key]: value });
      setCard(res.data.data);
    } catch {
      // silent — revert visually by re-fetching
    }
  }

  async function handleSaveLimits() {
    if (!card) return;
    setLimitsLoading(true);
    try {
      const res = await cardsApi.updateLimits(card.id, limitDraft);
      setCard(res.data.data);
      setEditingLimits(false);
    } catch {
      setActionError("Could not update limits. Please try again.");
    } finally {
      setLimitsLoading(false);
    }
  }

  function loadMore() {
    const next = txPage + 1;
    setTxPage(next);
    fetchTransactions(next);
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border-b border-[#E3E3E3] flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="text-[#333333]">
            <ChevronLeft size={24} />
          </button>
          <div className="skeleton h-4 w-24 rounded-sm" />
        </div>
        <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] aspect-[1.586/1] mx-4 mt-4 rounded-lg skeleton" />
        <div className="mt-4 px-4 space-y-3">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => router.back()} className="mb-4 text-[#DB0011] flex items-center gap-1 text-sm">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
          <p className="text-sm text-[#DB0011]">{error || "Card not found."}</p>
        </div>
      </div>
    );
  }

  const isFrozen = card.status === "FROZEN";
  const isBlocked = card.status === "BLOCKED";

  const statusConfig: Record<string, { label: string; variant: "success" | "info" | "danger" | "warning" | "default" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    FROZEN: { label: "Frozen", variant: "info" },
    BLOCKED: { label: "Blocked", variant: "danger" },
    CANCELLED: { label: "Cancelled", variant: "default" },
  };

  const status = statusConfig[card.status] ?? { label: card.status, variant: "default" as const };

  const controls: { key: keyof CardControls; label: string; icon: React.ReactNode }[] = [
    { key: "online", label: "Online payments", icon: <Wifi size={16} /> },
    { key: "contactless", label: "Contactless", icon: <span className="text-sm">📱</span> },
    { key: "international", label: "International", icon: <span className="text-sm">🌍</span> },
    { key: "atm", label: "ATM withdrawals", icon: <span className="text-sm">🏧</span> },
  ];

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = formatDate(tx.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3] flex items-center gap-3 px-4 py-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-[#333333] hover:text-[#DB0011] transition-colors -ml-1"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-semibold text-[#333333]">Card details</h1>
        <div className="ml-auto">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      {/* Card Visual */}
      <div className="px-4 pt-5 pb-1">
        <div
          className={`relative rounded-lg p-5 aspect-[1.586/1] flex flex-col justify-between shadow-lg overflow-hidden ${
            isFrozen
              ? "bg-gradient-to-br from-blue-400 to-blue-600"
              : isBlocked
              ? "bg-gradient-to-br from-gray-400 to-gray-600"
              : "bg-gradient-to-br from-[#DB0011] to-[#8B000A]"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="text-white/80 text-xs font-medium uppercase tracking-widest">
              Lumina Bank
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-white font-bold text-lg leading-none">VISA</span>
              <span className="text-white/60 text-[9px] uppercase tracking-wide">
                {card.isVirtual ? "Virtual" : card.type === "CREDIT" ? "Credit" : "Debit"} · {card.tier}
              </span>
            </div>
          </div>

          <div className="w-10 h-7 bg-yellow-300/80 rounded-sm" />

          <div>
            <p className="text-white text-base tracking-[0.2em] font-mono mb-2">
              •••• •••• •••• {card.maskedPan}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/50 text-[10px] uppercase">Card holder</p>
                <p className="text-white text-sm font-medium">{card.cardholderName}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase">Expires</p>
                <p className="text-white text-sm font-medium">
                  {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
                </p>
              </div>
            </div>
          </div>

          {isFrozen && (
            <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
              <SnowflakeIcon size={56} className="text-white/60" />
            </div>
          )}
          {isBlocked && (
            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
              <AlertCircle size={56} className="text-white/60" />
            </div>
          )}
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mx-4 mt-3 bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm">
          <p className="text-sm text-[#DB0011]">{actionError}</p>
        </div>
      )}

      {/* Quick actions */}
      {!isBlocked && (
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={handleFreeze}
            disabled={actionLoading === "freeze"}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-sm border text-xs font-medium transition-colors ${
              isFrozen
                ? "bg-orange-50 border-orange-200 text-orange-500 hover:bg-orange-100"
                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            } ${actionLoading === "freeze" ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {actionLoading === "freeze" ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : isFrozen ? (
              <span className="text-lg leading-none">☀️</span>
            ) : (
              <SnowflakeIcon size={20} strokeWidth={2} />
            )}
            {isFrozen ? "Unfreeze" : "Freeze"}
          </button>
          <ActionButton
            onClick={handleReportLost}
            loading={actionLoading === "report"}
            icon={<AlertTriangle size={18} />}
            label="Report lost"
            color="text-[#DB0011]"
            disabled={isBlocked}
          />
          <ActionButton
            onClick={handleReplace}
            loading={actionLoading === "replace"}
            icon={<RefreshCw size={18} />}
            label="Replace"
            color="text-[#333333]"
          />
        </div>
      )}

      {isBlocked && (
        <div className="mx-4 mt-3 bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm flex gap-2">
          <AlertCircle size={16} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#DB0011]">Card blocked</p>
            <p className="text-xs text-[#DB0011]/80">
              This card has been reported as lost or stolen. Contact support or replace the card.
            </p>
          </div>
        </div>
      )}

      {/* Spending limits */}
      <section className="mx-4 mt-4 bg-white border border-[#E3E3E3] rounded-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#E3E3E3]">
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">
            Spending limits
          </p>
          {!isBlocked && !editingLimits && (
            <button
              onClick={() => { setLimitDraft(card.spendingLimits); setEditingLimits(true); }}
              className="flex items-center gap-1 text-xs text-[#DB0011] font-medium"
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
          {editingLimits && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingLimits(false)}
                className="text-[#767676] p-1"
                disabled={limitsLoading}
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSaveLimits}
                className="text-green-600 p-1"
                disabled={limitsLoading}
              >
                {limitsLoading ? (
                  <span className="text-xs">Saving…</span>
                ) : (
                  <Check size={16} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 grid grid-cols-3 gap-3">
          {(["daily", "monthly", "perTransaction"] as const).map((key) => {
            const labels: Record<string, string> = {
              daily: "Daily",
              monthly: "Monthly",
              perTransaction: "Per txn",
            };
            return (
              <div key={key} className="text-center bg-[#F8F8F8] rounded-sm p-3">
                <p className="text-[10px] text-[#767676] mb-1">{labels[key]}</p>
                {editingLimits ? (
                  <input
                    type="number"
                    min={1}
                    value={limitDraft[key]}
                    onChange={(e) =>
                      setLimitDraft((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="w-full text-sm font-semibold text-center bg-white border border-[#E3E3E3] rounded-sm py-0.5 focus:outline-none focus:border-[#DB0011]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#333333]">
                    {formatCurrency(card.spendingLimits[key], card.currency)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Card controls */}
      <section className="mx-4 mt-4 bg-white border border-[#E3E3E3] rounded-sm">
        <div className="px-4 pt-4 pb-3 border-b border-[#E3E3E3]">
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">
            Card controls
          </p>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {controls.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5 text-sm text-[#333333]">
                <span className="text-[#767676]">{icon}</span>
                {label}
              </div>
              <Toggle
                checked={card.controls[key]}
                onChange={(v) => handleUpdateControl(key, v)}
                disabled={isBlocked}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Card transactions */}
      <section className="mx-4 mt-4 bg-white border border-[#E3E3E3] rounded-sm">
        <div className="px-4 pt-4 pb-3 border-b border-[#E3E3E3]">
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">
            Card transactions
          </p>
        </div>

        {txLoading && transactions.length === 0 ? (
          <SkeletonList count={5} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions"
            description="Card payments will appear here."
          />
        ) : (
          <>
            {Object.entries(grouped).map(([date, txs]) => (
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
            ))}
            {txHasMore && (
              <div className="p-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={loadMore}
                  isLoading={txLoading}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function ActionButton({
  onClick,
  loading,
  icon,
  label,
  color,
  disabled = false,
}: {
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 bg-white border border-[#E3E3E3] rounded-sm text-xs font-medium transition-colors hover:bg-[#F8F8F8] active:bg-[#F0F0F0] ${color} ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#DB0011]" : "bg-[#E3E3E3]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
