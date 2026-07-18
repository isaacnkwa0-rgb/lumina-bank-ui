"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  investmentsApi,
  type Portfolio,
  type WatchlistItem,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/LoadingSpinner";
import { TrendingUp, TrendingDown, LineChart } from "lucide-react";

const ALLOC_COLORS = ["#DB0011", "#1a56db", "#e3a008", "#0e9f6e", "#7e3af2"];

export default function InvestmentsPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([investmentsApi.portfolio(), investmentsApi.watchlist()])
      .then(([pRes, wRes]) => {
        setPortfolio(pRes.data.data);
        setWatchlist(wRes.data.data);
      })
      .catch(() => setError("Could not load investment data."))
      .finally(() => setLoading(false));
  }, []);

  const pnlPositive = (portfolio?.totalGainLoss ?? 0) >= 0;
  const allocation = portfolio
    ? Object.entries(portfolio.allocationByType).map(([type, v]) => ({ type, value: v.value, percent: v.percent }))
    : [];

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center gap-2 mb-4">
          <LineChart size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Investments</h1>
        </div>
        {!loading && portfolio && (
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Portfolio value</p>
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
        {/* Allocation chart */}
        {(loading || portfolio) && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#F0F0F0]">
              <h2 className="text-sm font-bold text-[#222]">Asset Allocation</h2>
            </div>
            {loading ? (
              <div className="p-4"><SkeletonBlock className="h-44 w-full rounded-xl" /></div>
            ) : portfolio && allocation.length > 0 ? (
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
            ) : null}
          </div>
        )}

        {/* Holdings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0F0F0]">
            <h2 className="text-sm font-bold text-[#222]">Holdings</h2>
          </div>
          {loading ? (
            <div className="p-4"><SkeletonCard /></div>
          ) : portfolio?.holdings.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#AAAAAA]">No holdings found</div>
          ) : (
            <div className="divide-y divide-[#F5F5F5]">
              {portfolio?.holdings.map((holding) => {
                const positive = holding.gainLoss >= 0;
                return (
                  <div key={holding.ticker} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-[#F5F5F5] border border-[#EFEFEF] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#555]">{holding.ticker.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#222] truncate">{holding.assetName}</p>
                      <p className="text-xs text-[#AAAAAA]">{holding.ticker} · {holding.quantity} units</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#222]">{formatCurrency(holding.currentValue)}</p>
                      <p className={`text-xs font-semibold ${positive ? "text-green-600" : "text-[#DB0011]"}`}>
                        {positive ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%
                      </p>
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
            <h2 className="text-sm font-bold text-[#222]">Watchlist</h2>
          </div>
          {loading ? (
            <div className="p-4"><SkeletonBlock className="h-24 w-full rounded-xl" /></div>
          ) : watchlist.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#AAAAAA]">No items in watchlist</div>
          ) : (
            <div className="divide-y divide-[#F5F5F5]">
              {watchlist.map((item) => {
                const positive = item.change >= 0;
                return (
                  <div key={item.ticker} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#222]">{item.ticker}</p>
                      <p className="text-xs text-[#AAAAAA] truncate">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#222]">{formatCurrency(item.price)}</p>
                      <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${positive ? "text-green-600" : "text-[#DB0011]"}`}>
                        {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {positive ? "+" : ""}{item.changePercent.toFixed(2)}%
                      </p>
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
