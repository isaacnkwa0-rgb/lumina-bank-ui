"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  analyticsApi, type CashflowData, type SpendingCategory,
  type Insight, type Merchant,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  TrendingUp, TrendingDown, AlertCircle, Info,
  BarChart2, ShoppingBag, Star, ArrowUpRight, ArrowDownLeft,
  Wallet,
} from "lucide-react";

// ── Colour palette ────────────────────────────────────────────────────────────

const CAT_COLORS = [
  "#DB0011", "#1a56db", "#e3a008", "#0e9f6e",
  "#7e3af2", "#f97316", "#06b6d4", "#ec4899",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtK(v: number) {
  return v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v.toFixed(0)}`;
}

function monthLabel(m: string) {
  try {
    return new Date(`${m}-01`).toLocaleDateString("en-GB", { month: "short" });
  } catch { return m; }
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function CashflowTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 shadow-xl text-white text-xs min-w-[130px]">
      <p className="font-bold text-white/60 mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-white/70">{p.name}</span>
          <span className="font-bold" style={{ color: p.fill }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Summary stat card ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={17} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{label}</p>
        <p className="text-base font-bold text-[#222] mt-0.5 leading-tight">{value}</p>
        {sub && (
          <p className={`text-[11px] mt-0.5 font-medium ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-[#DB0011]" : "text-[#AAAAAA]"
          }`}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2 border-b border-[#F5F5F5]">
        <p className="text-sm font-bold text-[#222]">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ── Insight card ───────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = {
    warning: { bg: "bg-amber-50",  border: "border-amber-200",  icon: AlertCircle, color: "text-amber-600",  badge: "bg-amber-100 text-amber-700"  },
    success: { bg: "bg-green-50",  border: "border-green-200",  icon: TrendingUp,  color: "text-green-600",  badge: "bg-green-100 text-green-700"  },
    info:    { bg: "bg-blue-50",   border: "border-blue-200",   icon: Info,        color: "text-blue-600",   badge: "bg-blue-100 text-blue-700"    },
  }[insight.severity] ?? { bg: "bg-blue-50", border: "border-blue-200", icon: Info, color: "text-blue-600", badge: "bg-blue-100 text-blue-700" };

  const Icon = cfg.icon;

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
      <div className="flex gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.badge}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#222] leading-snug">{insight.title}</p>
          <p className="text-xs text-[#666] mt-1 leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [cashflow, setCashflow]   = useState<CashflowData[]>([]);
  const [spending, setSpending]   = useState<SpendingCategory[]>([]);
  const [insights, setInsights]   = useState<Insight[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    Promise.all([
      analyticsApi.cashflow(),
      analyticsApi.spending(),
      analyticsApi.insights(),
      analyticsApi.topMerchants(),
    ])
      .then(([cf, sp, ins, merch]) => {
        setCashflow(cf.data.data);
        setSpending(sp.data.data);
        setInsights(ins.data.data);
        setMerchants(merch.data.data.slice(0, 6));
      })
      .catch(() => setError("Could not load analytics data."))
      .finally(() => setLoading(false));
  }, []);

  // Summary stats
  const totalIncome   = cashflow.reduce((s, m) => s + m.income,   0);
  const totalExpenses = cashflow.reduce((s, m) => s + m.expenses,  0);
  const netSavings    = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const totalSpend    = spending.reduce((s, c) => s + c.total, 0);

  // Chart data with short month labels
  const chartData = cashflow.map((m) => ({ ...m, month: monthLabel(m.month) }));

  // Net cashflow for line chart overlay
  const netData = chartData.map((m) => ({ month: m.month, net: m.income - m.expenses }));

  // Max for merchant bar widths
  const maxMerchant = Math.max(...merchants.map((m) => m.total), 1);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-16 text-white">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Spending Analytics</h1>
        </div>
        {!loading && cashflow.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Last 12 months · net savings</p>
            <p className={`text-4xl font-bold ${netSavings >= 0 ? "text-white" : "text-yellow-300"}`}>
              {netSavings >= 0 ? "+" : ""}{formatCurrency(netSavings)}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {savingsRate >= 0 ? "▲" : "▼"} {Math.abs(savingsRate).toFixed(1)}% savings rate
            </p>
          </div>
        )}
        {loading && <SkeletonBlock className="h-12 w-48 bg-white/10" />}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      {/* ── Summary cards (float over header) ── */}
      <div className="px-4 -mt-10 grid grid-cols-3 gap-2.5 relative z-10">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard label="Income"   value={fmtK(totalIncome)}   icon={ArrowDownLeft} iconColor="text-green-600" iconBg="bg-green-50" trend="up"      sub={`${cashflow.length}mo`} />
            <StatCard label="Expenses" value={fmtK(totalExpenses)} icon={ArrowUpRight}  iconColor="text-[#DB0011]" iconBg="bg-red-50"   trend="down"    sub={`${cashflow.length}mo`} />
            <StatCard label="Saved"    value={fmtK(netSavings)}    icon={Wallet}        iconColor="text-blue-600" iconBg="bg-blue-50"  trend="neutral" sub={`${savingsRate.toFixed(0)}%`} />
          </>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* ── Cashflow chart ── */}
        <Section title="Income vs Expenses">
          <div className="px-5 pt-4 pb-5">
            {loading ? (
              <SkeletonBlock className="h-52 w-full rounded-xl" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 4, right: 0, left: -18, bottom: 0 }} barGap={2} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#BBBBBB" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#BBBBBB" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                    <Tooltip content={<CashflowTooltip />} cursor={{ fill: "#F8F8F8" }} />
                    <Bar dataKey="income"   fill="#22c55e" radius={[3, 3, 0, 0]} name="Income"   maxBarSize={18} />
                    <Bar dataKey="expenses" fill="#DB0011" radius={[3, 3, 0, 0]} name="Expenses" maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-5 mt-3">
                  {[["#22c55e", "Income"], ["#DB0011", "Expenses"]].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-[#AAAAAA] font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>

        {/* ── Net cashflow trend ── */}
        {!loading && netData.length > 0 && (
          <Section title="Net cashflow trend">
            <div className="px-5 pt-4 pb-5">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={netData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#BBBBBB" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#BBBBBB" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E8E8E8", borderRadius: 12, fontSize: 12, padding: "6px 12px" }}
                    formatter={(v) => [formatCurrency(Number(v)), "Net"]}
                  />
                  <Line
                    type="monotone" dataKey="net" strokeWidth={2.5}
                    stroke="#1a56db" dot={{ r: 3, fill: "#1a56db", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* ── Spending by category ── */}
        {(loading || spending.length > 0) && (
          <Section title="Spending by category">
            {loading ? (
              <div className="p-5"><SkeletonBlock className="h-48 w-full rounded-xl" /></div>
            ) : (
              <>
                {/* Donut */}
                <div className="px-5 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <ResponsiveContainer width={130} height={130}>
                        <PieChart>
                          <Pie
                            data={spending}
                            dataKey="total"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={60}
                            strokeWidth={2}
                            stroke="#fff"
                          >
                            {spending.map((_, i) => (
                              <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => formatCurrency(Number(v))}
                            contentStyle={{ border: "1px solid #E8E8E8", borderRadius: 12, fontSize: 12 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-0.5">Total spent</p>
                      <p className="text-2xl font-bold text-[#222]">{formatCurrency(totalSpend)}</p>
                      <p className="text-xs text-[#AAAAAA] mt-1">{spending.length} categories</p>
                    </div>
                  </div>
                </div>

                {/* Category breakdown with progress bars */}
                <div className="px-5 pt-3 pb-4 space-y-3 border-t border-[#F8F8F8] mt-3">
                  {spending.map((cat, i) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                          <span className="text-xs font-semibold text-[#444] capitalize">
                            {cat.category.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#AAAAAA]">{cat.percentage.toFixed(0)}%</span>
                          <span className="text-xs font-bold text-[#333]">{formatCurrency(cat.total)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: CAT_COLORS[i % CAT_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        {/* ── Top merchants ── */}
        <Section title="Top merchants">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : merchants.length === 0 ? (
            <p className="text-sm text-[#AAAAAA] text-center py-8">No merchant data</p>
          ) : (
            <div className="px-5 pt-3 pb-5 space-y-3">
              {merchants.map((merchant, i) => {
                const pct = (merchant.total / maxMerchant) * 100;
                const rankColors = ["text-yellow-500", "text-[#AAAAAA]", "text-amber-700"];
                const rankBgs    = ["bg-yellow-50",    "bg-[#F5F5F5]",    "bg-amber-50"  ];
                return (
                  <div key={merchant.merchantName}>
                    <div className="flex items-center gap-3 mb-1">
                      {/* Rank badge */}
                      <div className={`h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 ${rankBgs[i] ?? "bg-[#F5F5F5]"}`}>
                        {i < 3
                          ? <Star size={12} className={`${rankColors[i]} fill-current`} />
                          : <span className="text-[10px] font-bold text-[#AAAAAA]">{i + 1}</span>}
                      </div>

                      {/* Merchant initials */}
                      <div className="h-8 w-8 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#555]">
                          {(merchant.merchantName || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#333] truncate">{merchant.merchantName}</p>
                          <p className="text-xs font-bold text-[#333] flex-shrink-0">{formatCurrency(merchant.total)}</p>
                        </div>
                        <p className="text-[10px] text-[#AAAAAA]">{merchant.count} transaction{merchant.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="ml-[60px] h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: i === 0 ? "#F7931A" : i === 1 ? "#BBBBBB" : i === 2 ? "#CD7F32" : "#DB0011",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Insights ── */}
        {(loading || insights.length > 0) && (
          <div>
            <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3 px-0.5">
              Smart insights
            </p>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Quick stats ── */}
        {!loading && spending.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={14} className="text-[#DB0011]" />
                <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">Top category</p>
              </div>
              <p className="text-sm font-bold text-[#222] capitalize">
                {(spending[0]?.category ?? "—").toLowerCase().replace(/_/g, " ")}
              </p>
              <p className="text-xs text-[#AAAAAA] mt-0.5">{formatCurrency(spending[0]?.total ?? 0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-amber-500" />
                <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">Avg monthly spend</p>
              </div>
              <p className="text-sm font-bold text-[#222]">
                {formatCurrency(cashflow.length ? totalExpenses / cashflow.length : 0)}
              </p>
              <p className="text-xs text-[#AAAAAA] mt-0.5">per month</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
