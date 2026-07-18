"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wifi, SnowflakeIcon, AlertCircle, CreditCard, ChevronRight } from "lucide-react";
import { cardsApi, type Card, type CardControls } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string>("");

  useEffect(() => {
    cardsApi
      .list()
      .then((r) => setCards(r.data.data))
      .catch(() => setError("Could not load cards."))
      .finally(() => setLoading(false));
  }, []);

  async function toggleFreeze(card: Card) {
    setActionLoading(card.id);
    setActionError("");
    try {
      const fn = card.status === "FROZEN" ? cardsApi.unfreeze : cardsApi.freeze;
      const res = await fn(card.id);
      setCards((prev) => prev.map((c) => (c.id === card.id ? res.data.data : c)));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e?.response?.data?.message || "Could not update card status. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function updateControl(card: Card, key: keyof CardControls, value: boolean) {
    setActionError("");
    try {
      const res = await cardsApi.updateControls(card.id, { [key]: value });
      setCards((prev) => prev.map((c) => (c.id === card.id ? res.data.data : c)));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e?.response?.data?.message || "Could not update card settings. Please try again.");
    }
  }

  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;
  const frozenCount = cards.filter((c) => c.status === "FROZEN").length;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">My Cards</h1>
        </div>
        {!loading && cards.length > 0 && (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold">{cards.length}</p>
              <p className="text-white/40 text-xs">Total cards</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-green-400">{activeCount}</p>
              <p className="text-white/40 text-xs">Active</p>
            </div>
            {frozenCount > 0 && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-xl font-bold text-blue-400">{frozenCount}</p>
                  <p className="text-white/40 text-xs">Frozen</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {(error || actionError) && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error || actionError}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<span className="text-4xl">💳</span>}
            title="No cards found"
            description="Your debit and credit cards will appear here."
          />
        ) : (
          cards.map((card) => (
            <CardSection
              key={card.id}
              card={card}
              onToggleFreeze={() => toggleFreeze(card)}
              onUpdateControl={(key, value) => updateControl(card, key, value)}
              onViewDetails={() => router.push(`/cards/${card.id}`)}
              freezeLoading={actionLoading === card.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CardSection({
  card,
  onToggleFreeze,
  onUpdateControl,
  onViewDetails,
  freezeLoading,
}: {
  card: Card;
  onToggleFreeze: () => void;
  onUpdateControl: (key: keyof CardControls, value: boolean) => void;
  onViewDetails: () => void;
  freezeLoading: boolean;
}) {
  const statusConfig = {
    ACTIVE: { label: "Active", variant: "success" as const },
    FROZEN: { label: "Frozen", variant: "info" as const },
    BLOCKED: { label: "Blocked", variant: "danger" as const },
  };

  const status = statusConfig[card.status];
  const isFrozen = card.status === "FROZEN";
  const isBlocked = card.status === "BLOCKED";

  const controls: { key: keyof CardControls; label: string; icon: React.ReactNode }[] = [
    { key: "online", label: "Online payments", icon: <Wifi size={16} /> },
    { key: "contactless", label: "Contactless", icon: <span className="text-sm">📱</span> },
    { key: "international", label: "International", icon: <span className="text-sm">🌍</span> },
    { key: "atm", label: "ATM withdrawals", icon: <span className="text-sm">🏧</span> },
  ];

  return (
    <div className="space-y-4">
      {/* Card visual */}
      <div
        className={`relative rounded-lg p-5 aspect-[1.586/1] flex flex-col justify-between shadow-md overflow-hidden ${
          isFrozen
            ? "bg-gradient-to-br from-blue-400 to-blue-600"
            : isBlocked
            ? "bg-gradient-to-br from-gray-400 to-gray-600"
            : "bg-gradient-to-br from-[#DB0011] to-[#8B000A]"
        }`}
      >
        {/* Network logo */}
        <div className="flex justify-between items-start">
          <div className="text-white/80 text-xs font-medium uppercase tracking-widest">
            Lumina Bank
          </div>
          <div className="text-white font-bold text-lg">
            {card.type === "VIRTUAL" ? "VISA" : "VISA"}
          </div>
        </div>

        {/* Chip */}
        <div className="w-10 h-7 bg-yellow-300/80 rounded-sm" />

        {/* PAN */}
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
              <p className="text-white text-sm font-medium">{String(card.expiryMonth).padStart(2,"0")}/{card.expiryYear}</p>
            </div>
          </div>
        </div>

        {/* Frozen overlay */}
        {isFrozen && (
          <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
            <SnowflakeIcon size={48} className="text-white/60" />
          </div>
        )}
      </div>

      {/* Status & actions */}
      <div className="bg-white border border-[#E3E3E3] rounded-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={status.variant}>{status.label}</Badge>
          <div className="flex items-center gap-2">
            {!isBlocked && (
              <Button
                variant={isFrozen ? "secondary" : "danger"}
                size="sm"
                onClick={onToggleFreeze}
                isLoading={freezeLoading}
              >
                {isFrozen ? (
                  <>
                    <span className="mr-1">☀️</span> Unfreeze
                  </>
                ) : (
                  <>
                    <SnowflakeIcon size={13} className="mr-1" /> Freeze
                  </>
                )}
              </Button>
            )}
            <button
              onClick={onViewDetails}
              className="flex items-center gap-0.5 text-xs font-medium text-[#DB0011] hover:underline"
            >
              Details <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Limits */}
        <div className="space-y-2 mb-4 pb-4 border-b border-[#E3E3E3]">
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">
            Spending limits
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Daily", value: card.spendingLimits.daily },
              { label: "Monthly", value: card.spendingLimits.monthly },
              { label: "Per txn", value: card.spendingLimits.perTransaction },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-[#F8F8F8] rounded-sm p-2">
                <p className="text-xs text-[#767676] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#333333]">
                  {formatCurrency(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div>
          <p className="text-xs font-medium text-[#767676] uppercase tracking-wide mb-3">
            Card controls
          </p>
          <div className="space-y-3">
            {controls.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#333333]">
                  <span className="text-[#767676]">{icon}</span>
                  {label}
                </div>
                <Toggle
                  checked={card.controls[key]}
                  onChange={(v) => onUpdateControl(key, v)}
                  disabled={isBlocked}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isBlocked && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm flex gap-2">
          <AlertCircle size={16} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#DB0011]">
            This card is blocked. Please contact customer support.
          </p>
        </div>
      )}
    </div>
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
