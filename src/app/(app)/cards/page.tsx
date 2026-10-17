"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wifi, SnowflakeIcon, AlertCircle, CreditCard, ChevronRight, Plus } from "lucide-react";
import { cardsApi, accountsApi, type Card, type CardControls, type Account } from "@/lib/api";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export default function CardsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string>("");
  const [showIssue, setShowIssue] = useState(false);

  useEffect(() => {
    Promise.all([cardsApi.list(), accountsApi.list()])
      .then(([cardsRes, accountsRes]) => {
        setCards(cardsRes.data.data);
        setAccounts(accountsRes.data.data);
      })
      .catch(() => setError(t("cards.couldNotLoad")))
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
      setActionError(e?.response?.data?.message || t("cards.couldNotUpdate"));
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
      setActionError(e?.response?.data?.message || t("cards.couldNotUpdate"));
    }
  }

  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;
  const frozenCount = cards.filter((c) => c.status === "FROZEN").length;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white lg:px-10 lg:py-8">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("cards.myCards")}</h1>
        </div>
        <div className="flex items-center gap-6">
          {!loading && cards.length > 0 && (
            <>
              <div>
                <p className="text-3xl font-bold">{cards.length}</p>
                <p className="text-white/40 text-xs">{t("cards.totalCards")}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-xl font-bold text-green-400">{activeCount}</p>
                <p className="text-white/40 text-xs">{t("cards.active")}</p>
              </div>
              {frozenCount > 0 && (
                <>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <p className="text-xl font-bold text-blue-400">{frozenCount}</p>
                    <p className="text-white/40 text-xs">{t("cards.frozen")}</p>
                  </div>
                </>
              )}
            </>
          )}
          <button
            onClick={() => setShowIssue(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ml-auto"
          >
            <Plus size={12} /> Issue card
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error || actionError}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-6 lg:max-w-5xl lg:mx-auto">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<span className="text-4xl">💳</span>}
            title={t("cards.noCards")}
            description={t("cards.noCardsDesc")}
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
              t={t}
            />
          ))
        )}
      </div>

      {showIssue && (
        <IssueCardSheet
          accounts={accounts}
          onClose={() => setShowIssue(false)}
          onIssued={(card) => {
            setCards((prev) => [...prev, card]);
            setShowIssue(false);
          }}
        />
      )}
    </div>
  );
}

function IssueCardSheet({
  accounts,
  onClose,
  onIssued,
}: {
  accounts: Account[];
  onClose: () => void;
  onIssued: (card: Card) => void;
}) {
  const [cardKind, setCardKind] = useState<"physical" | "virtual">("physical");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [cardType, setCardType] = useState("DEBIT");
  const [tier, setTier] = useState("STANDARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!accountId) {
      setError("Please select an account.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res;
      if (cardKind === "virtual") {
        res = await cardsApi.issueVirtual(accountId);
      } else {
        res = await cardsApi.issue({ accountId, type: cardType, tier });
      }
      onIssued(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Could not issue card. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-10 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#E3E3E3] rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Issue new card</h2>
        <p className="text-sm text-[#767676] mb-5">Choose a card type and link it to an account.</p>

        {/* Card kind selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["physical", "virtual"] as const).map((kind) => (
            <button
              key={kind}
              onClick={() => setCardKind(kind)}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                cardKind === kind
                  ? "border-[#DB0011] bg-[#DB0011]/5"
                  : "border-[#E3E3E3] bg-white hover:border-[#DB0011]/40"
              }`}
            >
              <div className="text-2xl mb-2">{kind === "physical" ? "💳" : "📱"}</div>
              <p className={`text-sm font-semibold capitalize ${cardKind === kind ? "text-[#DB0011]" : "text-[#1a1a1a]"}`}>
                {kind === "physical" ? "Physical card" : "Virtual card"}
              </p>
              <p className="text-xs text-[#767676] mt-0.5">
                {kind === "physical" ? "Delivered to your address" : "Instant, digital only"}
              </p>
            </button>
          ))}
        </div>

        {/* Account selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1.5">
            Link to account
          </label>
          {accounts.length === 0 ? (
            <p className="text-sm text-[#767676]">No accounts found.</p>
          ) : (
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full border border-[#E3E3E3] rounded-xl px-3 py-2.5 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:border-[#DB0011] transition-colors"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.type} — {acc.accountNumber} ({acc.currency})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Physical card extra options */}
        {cardKind === "physical" && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1.5">
                Card type
              </label>
              <div className="flex gap-2">
                {["DEBIT", "CREDIT", "PREPAID"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCardType(t)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      cardType === t
                        ? "border-[#DB0011] bg-[#DB0011] text-white"
                        : "border-[#E3E3E3] text-[#767676] hover:border-[#DB0011]/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1.5">
                Tier
              </label>
              <div className="flex gap-2">
                {["STANDARD", "GOLD", "PLATINUM"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      tier === t
                        ? "border-[#DB0011] bg-[#DB0011] text-white"
                        : "border-[#E3E3E3] text-[#767676] hover:border-[#DB0011]/40"
                    }`}
                  >
                    {t === "STANDARD" ? "Standard" : t === "GOLD" ? "Gold" : "Platinum"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !accountId}
          className="w-full bg-[#DB0011] hover:bg-[#b0000d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
        >
          {loading ? "Issuing…" : `Issue ${cardKind === "virtual" ? "virtual" : "physical"} card`}
        </button>
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
  t,
}: {
  card: Card;
  onToggleFreeze: () => void;
  onUpdateControl: (key: keyof CardControls, value: boolean) => void;
  onViewDetails: () => void;
  freezeLoading: boolean;
  t: (key: TranslationKey) => string;
}) {
  const statusConfig: Record<string, { label: string; variant: "success" | "info" | "danger" | "warning" | "default" }> = {
    PENDING:    { label: "Pending",    variant: "warning" },
    PROCESSING: { label: "Processing", variant: "warning" },
    SHIPPED:    { label: "Shipped",    variant: "info"    },
    ACTIVE:     { label: t("cards.statusActive"),  variant: "success" },
    FROZEN:     { label: t("cards.statusFrozen"),  variant: "info"    },
    BLOCKED:    { label: t("cards.statusBlocked"), variant: "danger"  },
    CANCELLED:  { label: "Cancelled",  variant: "default" },
  };

  const status = statusConfig[card.status] ?? { label: card.status, variant: "default" as const };
  const isDelivery = card.status === "PENDING" || card.status === "PROCESSING" || card.status === "SHIPPED";
  const isFrozen = card.status === "FROZEN";
  const isBlocked = card.status === "BLOCKED";

  const controls: { key: keyof CardControls; label: string; icon: React.ReactNode }[] = [
    { key: "online",        label: t("cards.online"),       icon: <Wifi size={16} /> },
    { key: "contactless",   label: t("cards.contactless"),  icon: <span className="text-sm">📱</span> },
    { key: "international", label: t("cards.international"),icon: <span className="text-sm">🌍</span> },
    { key: "atm",           label: t("cards.atm"),          icon: <span className="text-sm">🏧</span> },
  ];

  return (
    <div className="space-y-4">
      <div
        onClick={onViewDetails}
        className={`relative rounded-lg p-5 aspect-[1.586/1] flex flex-col justify-between shadow-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
          isDelivery  ? "bg-gradient-to-br from-gray-400 to-gray-600"
          : isFrozen  ? "bg-gradient-to-br from-blue-400 to-blue-600"
          : isBlocked ? "bg-gradient-to-br from-gray-400 to-gray-600"
          : "bg-gradient-to-br from-[#DB0011] to-[#8B000A]"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="text-white/80 text-xs font-medium uppercase tracking-widest">Lumina Bank</div>
          <div className="text-white font-bold text-lg">VISA</div>
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
              <p className="text-white text-sm font-medium">{String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</p>
            </div>
          </div>
        </div>
        {isFrozen && (
          <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
            <SnowflakeIcon size={48} className="text-white/60" />
          </div>
        )}
        {isDelivery && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📬</span>
            <p className="text-white text-xs font-semibold">Card on its way</p>
          </div>
        )}
      </div>

      {isDelivery && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500">📦</span>
            <p className="text-sm font-semibold text-amber-800">Card delivery in progress</p>
          </div>
          <div className="flex items-center justify-between text-xs">
            {(["PENDING", "PROCESSING", "SHIPPED"] as const).map((stage, i) => {
              const stageIndex = ["PENDING", "PROCESSING", "SHIPPED"].indexOf(card.status);
              const done = i <= stageIndex;
              return (
                <div key={stage} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-400"}`}>
                    {i + 1}
                  </div>
                  <span className={done ? "text-amber-700 font-medium" : "text-amber-300"}>
                    {stage === "PENDING" ? "Ordered" : stage === "PROCESSING" ? "Processing" : "Shipped"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isDelivery && (
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
                    <><span className="mr-1">☀️</span> {t("cards.unfreeze")}</>
                  ) : (
                    <><SnowflakeIcon size={13} className="mr-1" /> {t("cards.freeze")}</>
                  )}
                </Button>
              )}
              <button
                onClick={onViewDetails}
                className="flex items-center gap-0.5 text-xs font-medium text-[#DB0011] hover:underline"
              >
                {t("cards.details")} <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-[#E3E3E3]">
            <p className="text-xs font-medium text-[#767676] uppercase tracking-wide">{t("cards.spendingLimits")}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t("cards.daily"),   value: card.spendingLimits.daily },
                { label: t("cards.monthly"), value: card.spendingLimits.monthly },
                { label: t("cards.perTxn"), value: card.spendingLimits.perTransaction },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-[#F8F8F8] rounded-sm p-2">
                  <p className="text-xs text-[#767676] mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#333333]">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#767676] uppercase tracking-wide mb-3">{t("cards.controls")}</p>
            <div className="space-y-3">
              {controls.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#333333]">
                    <span className="text-[#767676]">{icon}</span>
                    {label}
                  </div>
                  <Toggle checked={card.controls[key]} onChange={(v) => onUpdateControl(key, v)} disabled={isBlocked} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isBlocked && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm flex gap-2">
          <AlertCircle size={16} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#DB0011]">{t("cards.blockedMessage")}</p>
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
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
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
