"use client";

import { useEffect, useState } from "react";
import { standingOrdersApi, accountsApi, type StandingOrder, type Account } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshCw, Plus, X, Pause, Play, XCircle, Calendar } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: "Weekly", BIWEEKLY: "Fortnightly", MONTHLY: "Monthly", QUARTERLY: "Quarterly",
};
const FREQ_COLORS: Record<string, string> = {
  WEEKLY: "text-purple-700 bg-purple-50 border-purple-200",
  BIWEEKLY: "text-blue-700 bg-blue-50 border-blue-200",
  MONTHLY: "text-[#DB0011] bg-red-50 border-red-200",
  QUARTERLY: "text-amber-700 bg-amber-50 border-amber-200",
};

function statusBadge(status: string) {
  if (status === "ACTIVE")    return "text-green-700 bg-green-50 border-green-200";
  if (status === "PAUSED")    return "text-amber-700 bg-amber-50 border-amber-200";
  if (status === "CANCELLED") return "text-[#999] bg-[#F5F5F5] border-[#E8E8E8]";
  return "text-[#767676] bg-[#F5F5F5] border-[#E8E8E8]";
}

export default function StandingOrdersPage() {
  const [orders, setOrders] = useState<StandingOrder[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountName, setToAccountName] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [toBankCode, setToBankCode] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"WEEKLY"|"BIWEEKLY"|"MONTHLY"|"QUARTERLY">("MONTHLY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([standingOrdersApi.list(), accountsApi.list()])
      .then(([so, acc]) => {
        setOrders(so.data.data);
        const active = acc.data.data.filter((a) => a.status === "ACTIVE");
        setAccounts(active);
        if (active.length > 0 && !fromAccountId) {
          setFromAccountId(active.find((a) => a.isDefault)?.id ?? active[0].id);
        }
      })
      .catch(() => setError("Could not load standing orders."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: string, action: "cancel" | "pause" | "resume") {
    setActionError("");
    try {
      if (action === "cancel")  await standingOrdersApi.cancel(id);
      if (action === "pause")   await standingOrdersApi.pause(id);
      if (action === "resume")  await standingOrdersApi.resume(id);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setActionError(msg || "Action failed. Please try again.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!fromAccountId || !toAccountName || !toAccountNumber || !toBankCode || !amount || !description || !startDate) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setCreateError("");
    setCreating(true);
    try {
      await standingOrdersApi.create({
        fromAccountId,
        toAccountNumber,
        toBankCode,
        toAccountName,
        amount: parseFloat(amount),
        description,
        frequency,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setShowCreate(false);
      setToAccountName(""); setToAccountNumber(""); setToBankCode("");
      setAmount(""); setDescription(""); setStartDate(""); setEndDate("");
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || "Failed to create standing order.");
    } finally {
      setCreating(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">Standing Orders</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <Plus size={13} />
            Set up
          </button>
        </div>
        <p className="text-white/60 text-sm">Automatic recurring payments on your schedule.</p>
      </div>

      {(error || actionError) && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error || actionError}</p>
        </div>
      )}

      <div className="px-4 -mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonBlock key={i} className="h-36 w-full rounded-2xl" />)
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<RefreshCw size={40} className="text-[#E3E3E3]" />}
            title="No standing orders"
            description="Set up a recurring payment and it will run automatically — weekly, fortnightly, monthly or quarterly."
          />
        ) : (
          orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#333] truncate">{o.toAccountName}</p>
                  <p className="text-xs text-[#AAAAAA] font-mono mt-0.5">•••• {o.toAccountNumber.slice(-4)} · {o.toBankCode}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-base font-bold text-[#DB0011]">{formatCurrency(Number(o.amount), o.currency)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${FREQ_COLORS[o.frequency] ?? "text-[#767676] bg-[#F5F5F5] border-[#E8E8E8]"}`}>
                    {FREQ_LABELS[o.frequency] ?? o.frequency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#767676] mb-3 truncate">{o.description}</p>

              <div className="flex items-center gap-2 mb-3 text-[11px] text-[#AAAAAA]">
                <Calendar size={11} />
                <span>Next: <span className="font-semibold text-[#555]">{formatDate(o.nextExecutionDate)}</span></span>
                {o.endDate && <span>· Ends {formatDate(o.endDate)}</span>}
                <span className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge(o.status)}`}>
                  {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                </span>
              </div>

              {o.status !== "CANCELLED" && (
                <div className="flex gap-2 pt-3 border-t border-[#F5F5F5]">
                  {o.status === "ACTIVE" ? (
                    <button
                      onClick={() => handleAction(o.id, "pause")}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors"
                    >
                      <Pause size={12} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(o.id, "resume")}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-semibold transition-colors"
                    >
                      <Play size={12} /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(o.id, "cancel")}
                    className="flex items-center gap-1 text-xs text-[#DB0011] hover:text-[#900] font-semibold transition-colors ml-auto"
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="text-base font-bold text-[#333]">New standing order</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="overflow-y-auto px-5 pb-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">From account</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type.replace("_", " ")} •••• {a.accountNumber.slice(-4)} ({formatCurrency(Number(a.balance), a.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {[
                { label: "Payee name", value: toAccountName, set: setToAccountName, placeholder: "John Smith" },
                { label: "Account number", value: toAccountNumber, set: setToAccountNumber, placeholder: "12345678" },
                { label: "Sort code", value: toBankCode, set: setToBankCode, placeholder: "20-00-00" },
                { label: "Reference / description", value: description, set: setDescription, placeholder: "Rent payment" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Amount (£)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["WEEKLY","BIWEEKLY","MONTHLY","QUARTERLY"] as const).map((f) => (
                    <button
                      key={f} type="button" onClick={() => setFrequency(f)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${frequency === f ? "border-[#DB0011] bg-red-50 text-[#DB0011]" : "border-[#E8E8E8] text-[#555] hover:border-[#CCC]"}`}
                    >
                      {FREQ_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Start date</label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">End date <span className="text-[#AAAAAA] normal-case font-normal">(optional)</span></label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  />
                </div>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-[#DB0011]">{createError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
              >
                {creating ? "Setting up…" : "Set up standing order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
