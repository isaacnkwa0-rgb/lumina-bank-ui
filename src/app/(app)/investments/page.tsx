"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  investmentsApi,
  type Portfolio,
  type WatchlistItem,
  type MarketQuote,
  type SearchResult,
  type PerformancePoint,
  type Holding,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/LoadingSpinner";
import {
  TrendingUp, TrendingDown, LineChart as LineChartIcon, Plus, X,
  Search, ShoppingCart, ArrowDownCircle, BookmarkPlus, BookmarkX, RefreshCw,
} from "lucide-react";

const ALLOC_COLORS = ["#DB0011", "#1a56db", "#e3a008", "#0e9f6e", "#7e3af2"];
const PERIODS = ["1W", "1M", "3M", "6M", "1Y"] as const;
type Period = (typeof PERIODS)[number];

// ── Buy/Sell modal ──────────────────────────────────────────────────────────
function TradeModal({
  mode,
  holding,
  onClose,
  onDone,
}: {
  mode: "buy" | "sell";
  holding?: Holding;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(holding?.ticker ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(
    holding
      ? { ticker: holding.ticker, name: holding.assetName, assetType: holding.assetType, price: holding.currentPrice }
      : null
  );
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [inputMode, setInputMode] = useState<"quantity" | "amount">("amount");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Fetch quote when ticker selected
  useEffect(() => {
    if (!selected) return;
    investmentsApi.quote(selected.ticker).then((r) => setQuote(r.data.data)).catch(() => {});
  }, [selected]);

  // Debounced search
  useEffect(() => {
    if (mode === "sell" || !query || query.length < 1) { setResults([]); return; }
    if (selected && query === selected.ticker) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await investmentsApi.search(query);
        setResults(r.data.data ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  }, [query, selected, mode]);

  const price = quote?.price ?? selected?.price ?? 0;
  const estimatedQty = inputMode === "amount" && amount && price ? parseFloat(amount) / price : parseFloat(quantity) || 0;
  const estimatedCost = inputMode === "quantity" && quantity && price ? parseFloat(quantity) * price : parseFloat(amount) || 0;

  async function submit() {
    if (!selected) { setError("Select an asset first."); return; }
    const qty = inputMode === "quantity" ? parseFloat(quantity) : undefined;
    const amt = inputMode === "amount" ? parseFloat(amount) : undefined;
    if (mode === "buy" && !qty && !amt) { setError("Enter a quantity or amount."); return; }
    if (mode === "sell" && (!qty || qty <= 0)) { setError("Enter a valid quantity to sell."); return; }

    setError(""); setLoading(true);
    try {
      if (mode === "buy") {
        await investmentsApi.buy({ ticker: selected.ticker, assetType: selected.assetType, assetName: selected.name, quantity: qty, amount: amt });
      } else {
        await investmentsApi.sell({ ticker: selected.ticker, quantity: qty! });
      }
      onDone();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Trade failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-bold text-[#333]">
            {mode === "buy" ? t("investments.buyAsset") : `${t("investments.sell")} ${holding?.ticker ?? ""}`}
          </h2>
          <button onClick={onClose} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 space-y-4">
          {/* Asset selector — only for buy */}
          {mode === "buy" && (
            <div className="relative">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("investments.searchAsset")}</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(null); setQuote(null); }}
                  placeholder={t("investments.searchPlaceholder")}
                  className="w-full pl-8 pr-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                />
                {searching && <RefreshCw size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] animate-spin" />}
              </div>
              {results.length > 0 && !selected && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-[#E3E3E3] rounded-xl shadow-lg overflow-hidden">
                  {results.slice(0, 6).map((r) => (
                    <button
                      key={r.ticker}
                      onClick={() => { setSelected(r); setQuery(r.ticker); setResults([]); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F8F8] text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#555]">{r.ticker.slice(0, 2)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#222] truncate">{r.ticker}</p>
                        <p className="text-xs text-[#AAAAAA] truncate">{r.name}</p>
                      </div>
                      <p className="text-sm font-bold text-[#222] flex-shrink-0">{formatCurrency(r.price)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected asset / quote */}
          {(selected || holding) && (
            <div className="bg-[#F8F8F8] rounded-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#555]">{(selected?.ticker ?? holding?.ticker ?? "").slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#222]">{selected?.ticker ?? holding?.ticker}</p>
                <p className="text-xs text-[#AAAAAA] truncate">{selected?.name ?? holding?.assetName}</p>
              </div>
              {price > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#222]">{formatCurrency(price)}</p>
                  {quote && (
                    <p className={`text-xs font-semibold ${quote.change >= 0 ? "text-green-600" : "text-[#DB0011]"}`}>
                      {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode toggle (buy only: quantity vs amount) */}
          {mode === "buy" && (
            <div className="flex gap-2">
              {(["amount", "quantity"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMode(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${inputMode === m ? "border-[#DB0011] bg-red-50 text-[#DB0011]" : "border-[#E8E8E8] text-[#777]"}`}
                >
                  {m === "amount" ? t("investments.byAmount") : t("investments.byQuantity")}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
              {mode === "sell" || inputMode === "quantity" ? t("investments.quantity") : t("investments.byAmount")}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={mode === "sell" || inputMode === "quantity" ? quantity : amount}
              onChange={(e) => mode === "sell" || inputMode === "quantity" ? setQuantity(e.target.value) : setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
            />
            {mode === "sell" && holding && (
              <p className="text-xs text-[#AAAAAA] mt-1">{t("investments.available")} {holding.quantity} units</p>
            )}
          </div>

          {/* Estimate */}
          {price > 0 && (estimatedQty > 0 || estimatedCost > 0) && (
            <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 text-xs text-[#777] space-y-1">
              {mode === "buy" && inputMode === "amount" && estimatedQty > 0 && (
                <p>≈ <span className="font-bold text-[#333]">{estimatedQty.toFixed(4)} units</span> {t("investments.at")} {formatCurrency(price)}{t("investments.perUnit")}</p>
              )}
              {mode === "buy" && inputMode === "quantity" && estimatedCost > 0 && (
                <p>≈ <span className="font-bold text-[#333]">{formatCurrency(estimatedCost)}</span> {t("investments.at")} {formatCurrency(price)}{t("investments.perUnit")}</p>
              )}
              {mode === "sell" && estimatedCost > 0 && (
                <p>{t("investments.youReceive")} <span className="font-bold text-green-700">{formatCurrency(estimatedCost)}</span></p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-[#DB0011]">{error}</p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || !selected && !holding}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
              mode === "buy"
                ? "bg-[#DB0011] text-white hover:bg-[#b8000e]"
                : "border-2 border-[#DB0011] text-[#DB0011] hover:bg-red-50"
            }`}
          >
            {loading ? (mode === "buy" ? "Buying…" : "Selling…") : mode === "buy" ? t("investments.confirmBuy") : t("investments.confirmSell")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const { t } = useLanguage();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [period, setPeriod] = useState<Period>("1M");
  const [loading, setLoading] = useState(true);
  const [perfLoading, setPerfLoading] = useState(false);
  const [error, setError] = useState("");
  const [tradeMode, setTradeMode] = useState<"buy" | "sell" | null>(null);
  const [sellHolding, setSellHolding] = useState<Holding | undefined>();
  const [watchQuery, setWatchQuery] = useState("");
  const [watchResults, setWatchResults] = useState<SearchResult[]>([]);
  const [watchSearching, setWatchSearching] = useState(false);
  const watchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, wRes] = await Promise.all([investmentsApi.portfolio(), investmentsApi.watchlist()]);
      setPortfolio(pRes.data.data);
      setWatchlist(wRes.data.data);
    } catch { setError("Could not load investment data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setPerfLoading(true);
    investmentsApi.performance(period)
      .then((r) => setPerformance(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setPerfLoading(false));
  }, [period]);

  // Watchlist search
  useEffect(() => {
    if (!watchQuery || watchQuery.length < 1) { setWatchResults([]); return; }
    clearTimeout(watchDebounce.current);
    watchDebounce.current = setTimeout(async () => {
      setWatchSearching(true);
      try {
        const r = await investmentsApi.search(watchQuery);
        setWatchResults(r.data.data ?? []);
      } catch { setWatchResults([]); }
      finally { setWatchSearching(false); }
    }, 350);
  }, [watchQuery]);

  async function addToWatchlist(item: SearchResult) {
    try {
      await investmentsApi.addToWatchlist({ ticker: item.ticker, assetName: item.name, assetType: item.assetType });
      setWatchQuery("");
      setWatchResults([]);
      const wRes = await investmentsApi.watchlist();
      setWatchlist(wRes.data.data);
    } catch {}
  }

  async function removeFromWatchlist(ticker: string) {
    try {
      await investmentsApi.removeFromWatchlist(ticker);
      setWatchlist((p) => p.filter((w) => w.ticker !== ticker));
    } catch {}
  }

  const pnlPositive = (portfolio?.totalGainLoss ?? 0) >= 0;
  const allocation = portfolio
    ? Object.entries(portfolio.allocationByType).map(([type, v]) => ({ type, value: v.value, percent: v.percent }))
    : [];

  const perfMin = Math.min(...performance.map((p) => p.value));
  const perfMax = Math.max(...performance.map((p) => p.value));
  const perfPositive = performance.length >= 2 && performance[performance.length - 1].value >= performance[0].value;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChartIcon size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("investments.title")}</h1>
          </div>
          <button
            onClick={() => { setTradeMode("buy"); setSellHolding(undefined); }}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <ShoppingCart size={13} />
            {t("investments.buyAsset")}
          </button>
        </div>
        {!loading && portfolio && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("investments.portfolio")}</p>
            <p className="text-4xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                pnlPositive ? "bg-green-500/25 text-green-300" : "bg-white/15 text-white/80"
              }`}>
                {pnlPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {pnlPositive ? "+" : ""}{formatCurrency(portfolio.totalGainLoss)} ({portfolio.totalGainLossPercent.toFixed(2)}%)
              </div>
              <span className="text-white/30 text-xs">all time</span>
            </div>
          </div>
        )}
        {loading && (
          <div>
            <SkeletonBlock className="h-3 w-32 mb-2 bg-white/10 rounded" />
            <SkeletonBlock className="h-10 w-48 bg-white/10 rounded" />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-8 space-y-4">
        {/* Performance chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F0F0F0]">
            <h2 className="text-sm font-bold text-[#222]">{t("investments.performance")}</h2>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    period === p ? "bg-[#DB0011] text-white" : "text-[#AAAAAA] hover:text-[#555]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {perfLoading || performance.length === 0 ? (
              <SkeletonBlock className="h-36 w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={performance} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={perfPositive ? "#16a34a" : "#DB0011"} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={perfPositive ? "#16a34a" : "#DB0011"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[perfMin * 0.995, perfMax * 1.005]} hide />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Value"]}
                    contentStyle={{ border: "1px solid #E8E8E8", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={perfPositive ? "#16a34a" : "#DB0011"}
                    strokeWidth={2}
                    fill="url(#perfGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Allocation chart */}
        {(loading || allocation.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#F0F0F0]">
              <h2 className="text-sm font-bold text-[#222]">{t("investments.allocation")}</h2>
            </div>
            {loading ? (
              <div className="p-4"><SkeletonBlock className="h-44 w-full rounded-xl" /></div>
            ) : (
              <div className="p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={allocation} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                      {allocation.map((_, i) => (
                        <Cell key={i} fill={ALLOC_COLORS[i % ALLOC_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={{ border: "1px solid #E8E8E8", borderRadius: "12px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                  {allocation.map((item, i) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                      <span className="text-xs text-[#777]">{item.type} ({item.percent.toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Holdings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F0F0F0]">
            <h2 className="text-sm font-bold text-[#222]">{t("investments.holdings")}</h2>
            <button
              onClick={() => { setTradeMode("buy"); setSellHolding(undefined); }}
              className="flex items-center gap-1 text-xs font-semibold text-[#DB0011] hover:text-[#900]"
            >
              <Plus size={12} /> {t("investments.buyMore")}
            </button>
          </div>
          {loading ? (
            <div className="p-4"><SkeletonCard /></div>
          ) : portfolio?.holdings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#AAAAAA] mb-3">{t("investments.noHoldings")}</p>
              <button
                onClick={() => { setTradeMode("buy"); setSellHolding(undefined); }}
                className="text-xs font-bold text-[#DB0011] hover:underline"
              >
                {t("investments.firstInvestment")}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F5]">
              {portfolio?.holdings.map((h) => {
                const positive = h.gainLoss >= 0;
                return (
                  <div key={h.ticker} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-[#F5F5F5] border border-[#EFEFEF] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#555]">{h.ticker.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#222] truncate">{h.assetName}</p>
                      <p className="text-xs text-[#AAAAAA]">{h.ticker} · {h.quantity} units @ {formatCurrency(h.currentPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#222]">{formatCurrency(h.currentValue)}</p>
                        <p className={`text-xs font-semibold ${positive ? "text-green-600" : "text-[#DB0011]"}`}>
                          {positive ? "+" : ""}{h.gainLossPercent.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => { setSellHolding(h); setTradeMode("sell"); }}
                        title={t("investments.sell")}
                        className="p-1.5 rounded-lg text-[#AAAAAA] hover:text-[#DB0011] hover:bg-red-50 transition-colors"
                      >
                        <ArrowDownCircle size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Watchlist */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0F0F0]">
            <h2 className="text-sm font-bold text-[#222] mb-3">{t("investments.watchlist")}</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
              <input
                type="text"
                value={watchQuery}
                onChange={(e) => setWatchQuery(e.target.value)}
                placeholder={t("investments.addWatchlist")}
                className="w-full pl-8 pr-3 py-2 border border-[#E8E8E8] rounded-xl text-xs focus:outline-none focus:border-[#DB0011]"
              />
              {watchSearching && <RefreshCw size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] animate-spin" />}
            </div>
            {watchResults.length > 0 && (
              <div className="mt-1 border border-[#E8E8E8] rounded-xl overflow-hidden">
                {watchResults.slice(0, 5).map((r) => (
                  <button
                    key={r.ticker}
                    onClick={() => addToWatchlist(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F8F8F8] text-left border-b border-[#F5F5F5] last:border-0"
                  >
                    <span className="text-xs font-bold text-[#222] w-12 flex-shrink-0">{r.ticker}</span>
                    <span className="text-xs text-[#AAAAAA] flex-1 truncate">{r.name}</span>
                    <span className="text-xs font-semibold text-[#333]">{formatCurrency(r.price)}</span>
                    <BookmarkPlus size={13} className="text-[#DB0011] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {loading ? (
            <div className="p-4"><SkeletonBlock className="h-24 w-full rounded-xl" /></div>
          ) : watchlist.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#AAAAAA]">{t("investments.searchAbove")}</div>
          ) : (
            <div className="divide-y divide-[#F5F5F5]">
              {watchlist.map((item) => {
                const positive = item.change >= 0;
                return (
                  <div key={item.ticker} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#555]">{item.ticker.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#222]">{item.ticker}</p>
                      <p className="text-xs text-[#AAAAAA] truncate">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#222]">{formatCurrency(item.price)}</p>
                        <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${positive ? "text-green-600" : "text-[#DB0011]"}`}>
                          {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {positive ? "+" : ""}{item.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.ticker)}
                        className="p-1.5 rounded-lg text-[#AAAAAA] hover:text-[#DB0011] hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <BookmarkX size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trade modal */}
      {tradeMode && (
        <TradeModal
          mode={tradeMode}
          holding={sellHolding}
          onClose={() => { setTradeMode(null); setSellHolding(undefined); }}
          onDone={() => { setTradeMode(null); setSellHolding(undefined); load(); }}
        />
      )}
    </div>
  );
}
