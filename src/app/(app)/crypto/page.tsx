"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { accountsApi, transfersApi, type Account } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  RefreshCw, Search, Bitcoin, X, ChevronDown,
  ShieldCheck, Clock, Info, AlertTriangle,
} from "lucide-react";

// ── Coin config ────────────────────────────────────────────────────────────────

interface CoinConfig {
  coingeckoId: string;
  symbol: string;
  displayName: string;
  color: string;
  bg: string;
  network: string;
  walletHint: string;
  isStable?: boolean;
  variant?: string;
}

const COIN_CONFIGS: CoinConfig[] = [
  {
    coingeckoId: "bitcoin", symbol: "BTC", displayName: "Bitcoin",
    color: "#F7931A", bg: "#FEF3E2", network: "Bitcoin Network",
    walletHint: "bc1q…   1…   3…",
  },
  {
    coingeckoId: "ethereum", symbol: "ETH", displayName: "Ethereum",
    color: "#627EEA", bg: "#EEF1FD", network: "Ethereum (ERC-20)",
    walletHint: "0x…",
  },
  {
    coingeckoId: "tether", symbol: "USDT", displayName: "Tether USD",
    color: "#26A17B", bg: "#E8F5F0", network: "Ethereum (ERC-20)",
    walletHint: "0x…", isStable: true, variant: "ERC-20",
  },
  {
    coingeckoId: "tether", symbol: "USDT", displayName: "Tether USD",
    color: "#26A17B", bg: "#E8F5F0", network: "TRON (TRC-20)",
    walletHint: "T…", isStable: true, variant: "TRC-20",
  },
  {
    coingeckoId: "solana", symbol: "SOL", displayName: "Solana",
    color: "#9945FF", bg: "#F3ECFF", network: "Solana",
    walletHint: "Solana wallet address",
  },
  {
    coingeckoId: "binancecoin", symbol: "BNB", displayName: "BNB",
    color: "#F3BA2F", bg: "#FEF8E1", network: "BNB Chain (BEP-20)",
    walletHint: "0x…",
  },
  {
    coingeckoId: "cardano", symbol: "ADA", displayName: "Cardano",
    color: "#0033AD", bg: "#E5E9F7", network: "Cardano",
    walletHint: "addr1…",
  },
  {
    coingeckoId: "ripple", symbol: "XRP", displayName: "XRP",
    color: "#346AA9", bg: "#EBF0F7", network: "XRP Ledger",
    walletHint: "r…",
  },
];

interface CoinMarket {
  config: CoinConfig;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtBig(n: number): string {
  if (n >= 1e12) return `£${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `£${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `£${(n / 1e6).toFixed(0)}M`;
  return `£${n.toFixed(0)}`;
}

function fmtPrice(p: number): string {
  if (p >= 1000) return formatCurrency(p);
  if (p >= 1)    return `£${p.toFixed(2)}`;
  return `£${p.toFixed(4)}`;
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────────

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length < 2) return <div className="w-[72px] h-9" />;
  const step  = Math.max(1, Math.floor(prices.length / 28));
  const pts   = prices.filter((_, i) => i % step === 0).slice(-28);
  const min   = Math.min(...pts);
  const max   = Math.max(...pts);
  const range = max - min || 1;
  const W = 72, H = 36;
  const points = pts
    .map((p, i) => `${(i / (pts.length - 1)) * W},${H - ((p - min) / range) * (H - 6) - 3}`)
    .join(" ");
  const stroke = positive ? "#16a34a" : "#DC2626";
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline fill="none" stroke={stroke} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ── Coin icon ──────────────────────────────────────────────────────────────────

function CoinIcon({ config, size = 44 }: { config: CoinConfig; size?: number }) {
  const label = config.variant ? config.symbol : config.symbol.slice(0, 3);
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm"
      style={{ width: size, height: size, backgroundColor: config.bg, color: config.color, fontSize: size * 0.28 }}
    >
      {label}
    </div>
  );
}

// ── Buy modal ──────────────────────────────────────────────────────────────────

function BuyModal({
  coin,
  accounts,
  onClose,
  onDone,
}: {
  coin: CoinMarket;
  accounts: Account[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const num      = parseFloat(amount) || 0;
  const fee      = num > 0 ? 1.5 : 0;
  const total    = num + fee;
  const qty      = coin.price > 0 ? num / coin.price : 0;
  const selAcc   = accounts.find((a) => a.id === accountId);
  const hasFunds = selAcc ? Number(selAcc.availableBalance) >= total : false;
  const canSubmit = num > 0 && wallet.trim().length >= 8 && hasFunds && !loading;

  const label = coin.config.variant
    ? `${coin.config.symbol} (${coin.config.variant})`
    : coin.config.displayName;

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await transfersApi.domestic({
        fromAccountId: accountId,
        toAccountNumber: wallet.trim(),
        toBankCode: "CREX",
        toAccountName: `${label} Wallet`,
        amount: num,
        description: `Crypto purchase: ${qty.toFixed(6)} ${coin.config.symbol} → ${wallet.trim().slice(0, 14)}…`,
        saveBeneficiary: false,
      });
      onDone(`${label} purchase of ${formatCurrency(num)} submitted for compliance review.`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: { message?: string } } } };
      setError(
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Submission failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[94vh] overflow-y-auto">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F0F0F0]">
          <CoinIcon config={coin.config} size={40} />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#222222]">Buy {label}</p>
            <p className="text-xs text-[#999999]">{coin.config.network} · {fmtPrice(coin.price)}/coin</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#E8E8E8]">
            <X size={16} className="text-[#555]" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Info notice */}
          <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl p-3.5">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Lumina Bank does not custody crypto. Your purchase is reviewed by compliance and the asset is sent directly to your external wallet within 1–2 business days.
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">
              Amount in GBP
            </label>
            <div className={`flex items-center rounded-2xl border-2 px-4 h-[60px] transition-colors ${
              num > 0 ? "border-[#333]" : "border-[#E3E3E3]"
            } focus-within:border-[#222]`}>
              <span className="text-2xl font-bold text-[#BBBBBB] mr-1.5">£</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 text-2xl font-bold text-[#222] outline-none bg-transparent placeholder:text-[#DDDDDD]"
              />
            </div>
            {num > 0 && (
              <div className="mt-2 px-1 space-y-0.5">
                <p className="text-xs text-[#555]">
                  You receive ≈{" "}
                  <span className="font-bold text-[#222]">{qty.toFixed(6)} {coin.config.symbol}</span>
                </p>
                <p className="text-xs text-[#999]">
                  + £1.50 transfer fee = <span className="font-semibold text-[#333]">{formatCurrency(total)}</span> total debited
                </p>
              </div>
            )}
          </div>

          {/* Quick select */}
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((v) => (
              <button key={v} onClick={() => setAmount(String(v))}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  num === v
                    ? "bg-[#222] text-white"
                    : "bg-[#F5F5F5] text-[#444] hover:bg-[#EBEBEB]"
                }`}>
                £{v}
              </button>
            ))}
          </div>

          {/* Wallet address */}
          <div>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">
              External {coin.config.network} Wallet Address
            </label>
            <input
              type="text"
              placeholder={coin.config.walletHint}
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full h-12 px-4 border-2 border-[#E3E3E3] rounded-2xl text-sm text-[#222] font-mono focus:border-[#222] outline-none transition-colors placeholder:text-[#CCCCCC]"
            />
            <div className="flex items-start gap-1.5 mt-1.5 px-0.5">
              <AlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#AAAAAA] leading-relaxed">
                Verify your address carefully. Crypto sent to the wrong wallet cannot be recovered.
              </p>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">
              Debit from account
            </label>
            <div className="relative">
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
                className="w-full h-12 pl-4 pr-10 border-2 border-[#E3E3E3] rounded-2xl text-sm text-[#222] font-medium appearance-none bg-white focus:border-[#222] outline-none">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.type} ••{a.accountNumber.slice(-4)} — {formatCurrency(Number(a.availableBalance), a.currency)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
            </div>
            {num > 0 && !hasFunds && (
              <p className="text-xs text-[#DB0011] mt-1.5 px-0.5">Insufficient funds in selected account.</p>
            )}
          </div>

          {/* Compliance notice */}
          <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl p-3.5">
            <ShieldCheck size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              All crypto purchase orders are subject to Lumina Bank compliance review and AML/KYC regulations before execution.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-[#DB0011]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={!canSubmit}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : undefined,
              backgroundColor: canSubmit ? undefined : "#E0E0E0",
              color: canSubmit ? "white" : "#999",
            }}>
            {loading ? "Submitting order…" : `Submit purchase — ${formatCurrency(total)}`}
          </button>

          <p className="text-center text-[10px] text-[#CCCCCC] pb-2">
            Lumina Bank · FCA Regulated · Crypto Purchase Policy applies
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Last-updated counter ───────────────────────────────────────────────────────

function LastUpdated({ ts }: { ts: number }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const sec = Math.floor((Date.now() - ts) / 1000);
  const label = sec < 5 ? "just now" : sec < 60 ? `${sec}s ago` : `${Math.floor(sec / 60)}m ago`;
  return <span className="text-white/40 text-[11px]">Updated {label}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "all" | "stable";

export default function CryptoPage() {
  const [coins, setCoins]             = useState<CoinMarket[]>([]);
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastTs, setLastTs]           = useState(Date.now());
  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState<Tab>("all");
  const [selectedCoin, setSelectedCoin] = useState<CoinMarket | null>(null);
  const [banner, setBanner]           = useState<string>("");
  const [apiError, setApiError]       = useState(false);
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMarket = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setApiError(false);
    try {
      const uniqueIds = [...new Set(COIN_CONFIGS.map((c) => c.coingeckoId))].join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&ids=${uniqueIds}&order=market_cap_desc&per_page=10&sparkline=true&price_change_percentage=24h`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("API error");
      const data: {
        id: string;
        current_price: number;
        price_change_percentage_24h: number;
        market_cap: number;
        total_volume: number;
        high_24h: number;
        low_24h: number;
        sparkline_in_7d?: { price: number[] };
      }[] = await res.json();

      const priceMap = new Map(data.map((d) => [d.id, d]));
      const rows: CoinMarket[] = [];
      for (const config of COIN_CONFIGS) {
        const d = priceMap.get(config.coingeckoId);
        if (!d) continue;
        rows.push({
          config,
          price:     d.current_price,
          change24h: d.price_change_percentage_24h ?? 0,
          marketCap: d.market_cap ?? 0,
          volume24h: d.total_volume ?? 0,
          high24h:   d.high_24h ?? 0,
          low24h:    d.low_24h ?? 0,
          sparkline: d.sparkline_in_7d?.price ?? [],
        });
      }
      setCoins(rows);
      setLastTs(Date.now());
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchMarket(), accountsApi.list().then((r) => setAccounts(r.data.data)).catch(() => {})]);
    intervalRef.current = setInterval(() => fetchMarket(true), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchMarket]);

  const filtered = coins.filter((c) => {
    if (tab === "stable" && !c.config.isStable) return false;
    if (tab === "all"    &&  c.config.isStable && search === "") {
      // still show stables in "all"
    }
    const q = search.toLowerCase();
    return !q || c.config.displayName.toLowerCase().includes(q) || c.config.symbol.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* ── Dark header ── */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bitcoin size={20} className="text-[#F7931A]" />
            <h1 className="text-lg font-bold tracking-tight">Crypto Market</h1>
          </div>
          <button
            onClick={() => fetchMarket(true)}
            disabled={refreshing}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <RefreshCw size={14} className={`text-white/70 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* Live indicator */}
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span className="text-green-400 text-[11px] font-semibold">LIVE</span>
          </span>
          <span className="text-white/20 text-[11px]">·</span>
          <LastUpdated ts={lastTs} />
        </div>

        {apiError && (
          <div className="mt-3 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-2">
            <AlertTriangle size={12} className="text-red-400" />
            <p className="text-xs text-red-300">Live data unavailable. Retrying…</p>
          </div>
        )}
      </div>

      {/* ── Search + tabs (overlaps header) ── */}
      <div className="mx-4 -mt-10 space-y-3 relative z-10">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] px-4 h-12">
          <Search size={16} className="text-[#AAAAAA] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Bitcoin, ETH, USDT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#333] outline-none placeholder:text-[#BBBBBB] bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#BBBBBB] hover:text-[#888]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([["all", "All Assets"], ["stable", "Stablecoins"]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t
                  ? "bg-[#1a1a3e] text-white shadow-sm"
                  : "bg-white text-[#777] border border-[#E8E8E8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Success banner */}
      {banner && (
        <div className="mx-4 mt-4 flex items-start gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5">
          <Clock size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Order submitted</p>
            <p className="text-xs text-green-600 mt-0.5">{banner}</p>
          </div>
          <button onClick={() => setBanner("")} className="ml-auto text-green-400 hover:text-green-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Coin list ── */}
      <div className="px-4 mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[110px] w-full rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bitcoin size={36} className="text-[#E0E0E0] mx-auto mb-2" />
            <p className="text-sm text-[#AAAAAA]">No coins found</p>
          </div>
        ) : (
          filtered.map((coin, idx) => {
            const positive = coin.change24h >= 0;
            const key = `${coin.config.coingeckoId}-${coin.config.variant ?? idx}`;
            return (
              <div key={key}
                className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden shadow-sm">
                {/* Main row */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  <CoinIcon config={coin.config} />

                  {/* Name + network */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-[#222]">{coin.config.displayName}</p>
                      {coin.config.variant && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: coin.config.bg, color: coin.config.color }}>
                          {coin.config.variant}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#AAAAAA] mt-0.5">{coin.config.network}</p>
                  </div>

                  {/* Sparkline */}
                  <Sparkline prices={coin.sparkline} positive={positive} />

                  {/* Price + change */}
                  <div className="text-right flex-shrink-0 min-w-[80px]">
                    <p className="text-sm font-bold text-[#222]">{fmtPrice(coin.price)}</p>
                    <p className={`text-xs font-bold mt-0.5 ${positive ? "text-green-600" : "text-[#DB0011]"}`}>
                      {positive ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Stats + buy row */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FAFAFA] border-t border-[#F2F2F2]">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div>
                      <p className="text-[9px] font-bold text-[#BBBBBB] uppercase tracking-wide">Mkt Cap</p>
                      <p className="text-[11px] font-semibold text-[#444]">{fmtBig(coin.marketCap)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#BBBBBB] uppercase tracking-wide">24h Vol</p>
                      <p className="text-[11px] font-semibold text-[#444]">{fmtBig(coin.volume24h)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#BBBBBB] uppercase tracking-wide">24h H/L</p>
                      <p className="text-[11px] font-semibold text-[#444]">
                        {fmtPrice(coin.high24h)}<span className="text-[#DDD]">/</span>{fmtPrice(coin.low24h)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCoin(coin)}
                    className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${coin.config.color}dd, ${coin.config.color})` }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disclaimer */}
      <p className="mx-4 mt-6 text-[10px] text-[#CCCCCC] leading-relaxed">
        Prices sourced from CoinGecko in real time and displayed in GBP. Crypto assets are highly volatile and unregulated. Lumina Bank acts as a payment facilitator only and does not provide investment advice. All purchases subject to FCA compliance and our Crypto Purchase Policy.
      </p>

      {/* Buy modal */}
      {selectedCoin && (
        <BuyModal
          coin={selectedCoin}
          accounts={accounts}
          onClose={() => setSelectedCoin(null)}
          onDone={(msg) => {
            setSelectedCoin(null);
            setBanner(msg);
          }}
        />
      )}
    </div>
  );
}
