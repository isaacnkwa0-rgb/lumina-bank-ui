"use client";

import { useEffect, useState } from "react";
import { ratesApi, type Rate, type ConversionResult } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeftRight, RefreshCw, TrendingUp, Globe } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";

const CURRENCIES = [
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
];

function getCurrencyMeta(code: string) {
  return CURRENCIES.find((c) => c.code === code) || { code, name: code, flag: "🌐" };
}

export default function RatesPage() {
  const { t } = useLanguage();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCurrency, setFromCurrency] = useState("GBP");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    setLoading(true);
    try {
      const r = await ratesApi.list();
      setRates(r.data.data);
      setLastRefreshed(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function convert() {
    if (!amount || Number(amount) <= 0) return;
    setConverting(true);
    try {
      const r = await ratesApi.convert({
        from: fromCurrency,
        to: toCurrency,
        amount: Number(amount),
      });
      setConversion(r.data.data);
    } catch {
      // silent
    } finally {
      setConverting(false);
    }
  }

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConversion(null);
  }

  const gbpRates = rates.filter((r) => r.from === "GBP");

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("rates.title")}</h1>
          </div>
          <button
            onClick={fetchRates}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white/25 transition-colors disabled:opacity-50"
            aria-label="Refresh rates"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {t("rates.refresh")}
          </button>
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("rates.base")}</p>
          <p className="text-3xl font-bold">{gbpRates.length} {t("rates.pairs")}</p>
          <p className="text-white/40 text-xs mt-1">{t("rates.updated")} {lastRefreshed.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Currency converter */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0F0F0] flex items-center gap-2">
            <TrendingUp size={15} className="text-[#DB0011]" />
            <h2 className="text-sm font-bold text-[#333]">{t("rates.converter")}</h2>
          </div>
          <div className="px-4 py-5 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-[10px] text-[#AAAAAA] mb-1.5 font-bold uppercase tracking-widest">
                {t("rates.amount")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setConversion(null); }}
                className="w-full border-0 border-b-2 border-[#E8E8E8] bg-transparent py-2.5 text-2xl font-bold text-[#222] focus:outline-none focus:border-[#DB0011] transition-colors"
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>

            {/* From / Swap / To */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] text-[#AAAAAA] mb-1.5 font-bold uppercase tracking-widest">
                  {t("rates.from")}
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => { setFromCurrency(e.target.value); setConversion(null); }}
                  className="w-full border-0 border-b-2 border-[#E8E8E8] bg-transparent py-2.5 text-sm font-semibold text-[#333] focus:outline-none focus:border-[#DB0011] transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={swapCurrencies}
                className="mt-4 h-10 w-10 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-red-50 hover:text-[#DB0011] transition-colors flex-shrink-0"
              >
                <ArrowLeftRight size={15} />
              </button>

              <div className="flex-1">
                <label className="block text-[10px] text-[#AAAAAA] mb-1.5 font-bold uppercase tracking-widest">
                  {t("rates.to")}
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => { setToCurrency(e.target.value); setConversion(null); }}
                  className="w-full border-0 border-b-2 border-[#E8E8E8] bg-transparent py-2.5 text-sm font-semibold text-[#333] focus:outline-none focus:border-[#DB0011] transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={convert}
              disabled={converting || !amount}
              className="w-full bg-[#DB0011] text-white text-sm font-bold py-3.5 rounded-xl hover:bg-[#b8000e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {converting ? t("rates.converting") : t("rates.convert")}
            </button>

            {conversion && (
              <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] rounded-xl p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-white/50">
                    {conversion.amount.toLocaleString()} {getCurrencyMeta(conversion.from).flag} {conversion.from}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      {conversion.converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-normal text-white/50 ml-1">
                      {getCurrencyMeta(conversion.to).flag} {conversion.to}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/40">
                  1 {conversion.from} = {conversion.rate.toFixed(4)} {conversion.to} · {t("rates.indicative")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rates table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0F0F0] flex items-center gap-2">
            <Globe size={15} className="text-[#DB0011]" />
            <h2 className="text-sm font-bold text-[#333]">{t("rates.live")}</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : gbpRates.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#AAAAAA]">
              {t("rates.unavailable")}
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F5]">
              {gbpRates.map((r) => {
                const meta = getCurrencyMeta(r.to);
                return (
                  <div
                    key={`${r.from}-${r.to}`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{meta.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-[#222]">{r.to}</p>
                        <p className="text-xs text-[#AAAAAA]">{meta.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#222]">
                        {r.rate.toFixed(4)}
                      </p>
                      <p className="text-xs text-[#AAAAAA]">{t("rates.perPound")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
