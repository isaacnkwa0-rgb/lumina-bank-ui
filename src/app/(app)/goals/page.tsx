"use client";

import { useEffect, useState } from "react";
import { goalsApi, accountsApi, type Goal, type Account } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import {
  Plus, X, Target, ChevronDown, CheckCircle2,
  Calendar, Sparkles, PiggyBank, AlertCircle,
} from "lucide-react";

// ── Progress ring ──────────────────────────────────────────────────────────────

function Ring({ pct, size = 56, stroke = 5, color = "#DB0011" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round" style={{ transition: "stroke-dasharray .6s ease" }} />
    </svg>
  );
}

// ── Contribute / Add-goal modal ────────────────────────────────────────────────

function ContributeSheet({
  goal, accounts, onClose, onDone,
}: {
  goal: Goal; accounts: Account[]; onClose: () => void; onDone: (updated: Goal) => void;
}) {
  const [amount, setAmount]   = useState("");
  const [accId, setAccId]     = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const num       = parseFloat(amount) || 0;
  const remaining = Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0);
  const selAcc    = accounts.find((a) => a.id === accId);
  const hasFunds  = selAcc ? Number(selAcc.availableBalance) >= num : false;
  const canSave   = num > 0 && hasFunds && !loading;

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await goalsApi.contribute(goal.id, num, accId);
      setDone(true);
      setTimeout(() => {
        onDone(res.data.data.goal);
      }, 1200);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: { message?: string } } } };
      setError(
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Could not add contribution. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>

        {done ? (
          <div className="flex flex-col items-center py-12 px-6">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-[#222]">Added!</p>
            <p className="text-sm text-[#999] mt-1">{formatCurrency(num)} added to {goal.name}</p>
          </div>
        ) : (
          <div className="px-5 pt-3 pb-8 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#F5F5F5] pb-4">
              <span className="text-3xl">{goal.emoji || "🎯"}</span>
              <div>
                <p className="text-sm font-bold text-[#222]">{goal.name}</p>
                <p className="text-xs text-[#AAAAAA]">
                  {formatCurrency(Number(goal.currentAmount))} saved · {formatCurrency(remaining)} remaining
                </p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">
                Amount to add
              </label>
              <div className="flex items-center border-2 border-[#E3E3E3] rounded-2xl px-4 h-14 focus-within:border-[#DB0011] transition-colors">
                <span className="text-xl font-bold text-[#BBBBBB] mr-1">£</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-2xl font-bold text-[#222] outline-none bg-transparent placeholder:text-[#DDDDDD]"
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, Math.ceil(remaining)].filter((v, i, a) => a.indexOf(v) === i && v > 0).slice(0, 4).map((v) => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    num === v ? "bg-[#DB0011] text-white" : "bg-[#F5F5F5] text-[#444] hover:bg-[#EBEBEB]"
                  }`}>
                  £{v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                </button>
              ))}
            </div>

            {/* Account picker */}
            <div>
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">
                Debit from
              </label>
              <div className="relative">
                <select value={accId} onChange={(e) => setAccId(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 border-2 border-[#E3E3E3] rounded-2xl text-sm text-[#222] font-medium appearance-none bg-white focus:border-[#DB0011] outline-none">
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type} ••{a.accountNumber.slice(-4)} — {formatCurrency(Number(a.availableBalance), a.currency)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
              </div>
              {num > 0 && !hasFunds && (
                <p className="text-xs text-[#DB0011] mt-1.5">Insufficient funds in selected account.</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <AlertCircle size={14} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#DB0011]">{error}</p>
              </div>
            )}

            <button onClick={submit} disabled={!canSave}
              className="w-full py-4 rounded-2xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-40">
              {loading ? "Saving…" : `Add ${num > 0 ? formatCurrency(num) : "funds"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add goal sheet ─────────────────────────────────────────────────────────────

function AddGoalSheet({ onClose, onCreated }: {
  onClose: () => void; onCreated: (g: Goal) => void;
}) {
  const [name, setName]         = useState("");
  const [emoji, setEmoji]       = useState("");
  const [target, setTarget]     = useState("");
  const [date, setDate]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function submit() {
    if (!name.trim() || !target) return;
    setLoading(true);
    setError("");
    try {
      const res = await goalsApi.create({
        name: name.trim(),
        emoji: emoji || undefined,
        targetAmount: parseFloat(target),
        targetDate: date || undefined,
      });
      onCreated(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || "Could not create goal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-[#F5F5F5]">
          <p className="text-sm font-bold text-[#222]">New savings goal</p>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F5F5F5]">
            <X size={15} className="text-[#555]" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4 pb-8">
          {/* Emoji + name row */}
          <div className="flex gap-3">
            <div className="w-16">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">Icon</label>
              <input type="text" maxLength={2} placeholder="🎯" value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full h-12 text-center text-xl border-2 border-[#E3E3E3] rounded-2xl outline-none focus:border-[#DB0011]" />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">Goal name</label>
              <input type="text" placeholder="e.g. Dream holiday" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border-2 border-[#E3E3E3] rounded-2xl text-sm text-[#222] font-medium outline-none focus:border-[#DB0011]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">Target amount (£)</label>
            <div className="flex items-center border-2 border-[#E3E3E3] rounded-2xl px-4 h-12 focus-within:border-[#DB0011] transition-colors">
              <span className="text-base font-bold text-[#BBBBBB] mr-1">£</span>
              <input type="number" placeholder="5,000" value={target} onChange={(e) => setTarget(e.target.value)}
                className="flex-1 text-base font-bold text-[#222] outline-none bg-transparent placeholder:text-[#DDDDDD]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest block mb-2">Target date (optional)</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 border-2 border-[#E3E3E3] rounded-2xl text-sm text-[#222] outline-none focus:border-[#DB0011]" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-[#DB0011]">{error}</p>
            </div>
          )}

          <button onClick={submit} disabled={!name.trim() || !target || loading}
            className="w-full py-4 rounded-2xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-40">
            {loading ? "Creating…" : "Create goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Goal card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal, onContribute }: { goal: Goal; onContribute: () => void }) {
  const current   = Number(goal.currentAmount);
  const target    = Number(goal.targetAmount);
  const pct       = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  const done      = current >= target;
  const color     = done ? "#22c55e" : "#DB0011";

  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Ring + emoji */}
        <div className="relative flex-shrink-0">
          <Ring pct={pct} size={60} stroke={5} color={color} />
          <span className="absolute inset-0 flex items-center justify-center text-xl">
            {goal.emoji || "🎯"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-[#222] truncate">{goal.name}</p>
            {done && <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-[#AAAAAA] mt-0.5">
            <span className="font-semibold text-[#555]">{formatCurrency(current)}</span>
            {" of "}
            <span>{formatCurrency(target)}</span>
          </p>
          {goal.targetDate && !done && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar size={10} className="text-[#BBBBBB]" />
              <p className="text-[10px] text-[#BBBBBB]">{formatDate(goal.targetDate)}</p>
            </div>
          )}
        </div>

        {/* % + button */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-sm font-bold" style={{ color }}>{pct.toFixed(0)}%</p>
          {!done && (
            <button onClick={onContribute}
              className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#DB0011] rounded-full px-3 py-1.5 hover:bg-[#b0000d] transition-colors">
              <Plus size={10} /> Add
            </button>
          )}
          {done && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Done!</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#F5F5F5]">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>

      {/* Remaining */}
      {!done && (
        <div className="px-5 py-2.5 bg-[#FAFAFA] flex items-center justify-between">
          <p className="text-[11px] text-[#AAAAAA]">
            <span className="font-semibold text-[#555]">{formatCurrency(remaining)}</span> still to go
          </p>
          <p className="text-[10px] text-[#CCCCCC]">
            {goal.status === "ACHIEVED" ? "Achieved" : goal.status}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [accounts, setAccounts]   = useState<Account[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  useEffect(() => {
    Promise.all([
      goalsApi.list(),
      accountsApi.list(),
    ])
      .then(([gRes, aRes]) => {
        setGoals(gRes.data.data);
        setAccounts(aRes.data.data);
      })
      .catch(() => setError("Could not load goals."))
      .finally(() => setLoading(false));
  }, []);

  const totalSaved  = goals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const achieved    = goals.filter((g) => g.status === "ACHIEVED").length;

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-16 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">Savings Goals</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-white/25 transition-colors">
            <Plus size={13} /> New goal
          </button>
        </div>
        {!loading && goals.length > 0 && (
          <div className="flex items-end gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total saved</p>
              <p className="text-4xl font-bold">{formatCurrency(totalSaved)}</p>
              <p className="text-white/40 text-xs mt-1">of {formatCurrency(totalTarget)} across {goals.length} goal{goals.length !== 1 ? "s" : ""}</p>
            </div>
            {achieved > 0 && (
              <div className="mb-1">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Achieved</p>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  <p className="text-xl font-bold text-yellow-400">{achieved}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {loading && <SkeletonBlock className="h-12 w-48 bg-white/10" />}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      {/* Cards */}
      <div className="px-4 -mt-8 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28 w-full rounded-2xl" />
          ))
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm p-8 text-center mt-4">
            <PiggyBank size={40} className="text-[#E0E0E0] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#333]">No savings goals yet</p>
            <p className="text-xs text-[#AAAAAA] mt-1 mb-4">Set a goal and track your progress</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 bg-[#DB0011] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#b0000d] transition-colors">
              <Plus size={14} /> Create first goal
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onContribute={() => setActiveGoal(goal)} />
          ))
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddGoalSheet
          onClose={() => setShowAdd(false)}
          onCreated={(g) => { setGoals((prev) => [g, ...prev]); setShowAdd(false); }}
        />
      )}

      {activeGoal && (
        <ContributeSheet
          goal={activeGoal}
          accounts={accounts}
          onClose={() => setActiveGoal(null)}
          onDone={(updated) => {
            setGoals((prev) => prev.map((g) => g.id === updated.id ? updated : g));
            setActiveGoal(null);
          }}
        />
      )}
    </div>
  );
}
