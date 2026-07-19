"use client";

import { useEffect, useState } from "react";
import { directDebitsApi, accountsApi, type DirectDebit, type Account } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshCw, Plus, X, Pause, Play, XCircle, Calendar, Building } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";


const FREQ_COLORS: Record<string, string> = {
  WEEKLY:    "text-purple-700 bg-purple-50 border-purple-200",
  BIWEEKLY:  "text-blue-700 bg-blue-50 border-blue-200",
  MONTHLY:   "text-[#DB0011] bg-red-50 border-red-200",
  QUARTERLY: "text-amber-700 bg-amber-50 border-amber-200",
};

function statusBadge(status: string) {
  if (status === "ACTIVE")    return "text-green-700 bg-green-50 border-green-200";
  if (status === "SUSPENDED") return "text-amber-700 bg-amber-50 border-amber-200";
  if (status === "CANCELLED") return "text-[#999] bg-[#F5F5F5] border-[#E8E8E8]";
  return "text-[#767676] bg-[#F5F5F5] border-[#E8E8E8]";
}

// Originator initials avatar
function OrgAvatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  const colors = ["#DB0011", "#1a56db", "#0e9f6e", "#7e3af2", "#e3a008"];
  const idx = Math.abs([...name].reduce((h, c) => h * 31 + c.charCodeAt(0), 0)) % colors.length;
  return (
    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: colors[idx] }}>
      {initials || <Building size={16} />}
    </div>
  );
}

export default function DirectDebitsPage() {
  const { t } = useLanguage();
  const FREQ_LABELS: Record<string, string> = {
    WEEKLY: t("directDebits.weekly"),
    BIWEEKLY: t("directDebits.fortnightly"),
    MONTHLY: t("directDebits.monthlyFreq"),
    QUARTERLY: t("directDebits.quarterly"),
  };
  const [debits, setDebits] = useState<DirectDebit[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [accountId, setAccountId] = useState("");
  const [originatorName, setOriginatorName] = useState("");
  const [originatorRef, setOriginatorRef] = useState("");
  const [userRef, setUserRef] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY">("MONTHLY");
  const [startDate, setStartDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([directDebitsApi.list(), accountsApi.list()])
      .then(([dd, acc]) => {
        setDebits(dd.data.data);
        const active = acc.data.data.filter((a) => a.status === "ACTIVE");
        setAccounts(active);
        if (active.length > 0 && !accountId) {
          setAccountId(active.find((a) => a.isDefault)?.id ?? active[0].id);
        }
      })
      .catch(() => setError("Could not load direct debits."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: string, action: "cancel" | "suspend" | "resume") {
    setActionError("");
    try {
      if (action === "cancel")  await directDebitsApi.cancel(id);
      if (action === "suspend") await directDebitsApi.suspend(id);
      if (action === "resume")  await directDebitsApi.resume(id);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setActionError(msg || "Action failed. Please try again.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !originatorName || !originatorRef || !userRef || !startDate) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setCreateError(""); setCreating(true);
    try {
      await directDebitsApi.create({
        accountId,
        originatorName,
        originatorRef,
        userRef,
        amount: amount ? parseFloat(amount) : undefined,
        frequency,
        startDate: new Date(startDate).toISOString(),
      });
      setShowCreate(false);
      setOriginatorName(""); setOriginatorRef(""); setUserRef(""); setAmount(""); setStartDate("");
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || "Failed to set up direct debit.");
    } finally { setCreating(false); }
  }

  const today = new Date().toISOString().split("T")[0];
  const active = debits.filter((d) => d.status === "ACTIVE").length;
  const totalMonthly = debits
    .filter((d) => d.status === "ACTIVE" && d.amount && d.frequency === "MONTHLY")
    .reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("directDebits.title")}</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <Plus size={13} />
            {t("directDebits.setUp")}
          </button>
        </div>
        <p className="text-white/60 text-sm">{t("directDebits.subtitle")}</p>
        {!loading && debits.length > 0 && (
          <div className="flex items-center gap-4 mt-4">
            <div>
              <p className="text-3xl font-bold">{active}</p>
              <p className="text-white/40 text-xs">{t("directDebits.active")}</p>
            </div>
            {totalMonthly > 0 && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-xl font-bold">{formatCurrency(totalMonthly)}</p>
                  <p className="text-white/40 text-xs">{t("directDebits.monthly")}</p>
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

      <div className="px-4 -mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonBlock key={i} className="h-36 w-full rounded-2xl" />)
        ) : debits.length === 0 ? (
          <EmptyState
            icon={<Building size={40} className="text-[#E3E3E3]" />}
            title={t("directDebits.none")}
            description={t("directDebits.noneDesc")}
          />
        ) : (
          debits.map((dd) => (
            <div key={dd.id} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
              <div className="flex items-start gap-3 mb-3">
                <OrgAvatar name={dd.originatorName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#333] truncate">{dd.originatorName}</p>
                  <p className="text-xs text-[#AAAAAA] mt-0.5 truncate">Ref: {dd.userRef} · Orig: {dd.originatorRef}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className="text-base font-bold text-[#DB0011]">
                    {dd.amount ? formatCurrency(Number(dd.amount), dd.currency) : <span className="text-[#AAAAAA]">Variable</span>}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${FREQ_COLORS[dd.frequency] ?? "text-[#767676] bg-[#F5F5F5] border-[#E8E8E8]"}`}>
                    {FREQ_LABELS[dd.frequency] ?? dd.frequency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-[11px] text-[#AAAAAA]">
                <Calendar size={11} />
                <span>{t("directDebits.next")} <span className="font-semibold text-[#555]">{formatDate(dd.nextCollectionDate)}</span></span>
                {dd.lastCollectedAt && <span>· {t("directDebits.last")} {formatDate(dd.lastCollectedAt)}</span>}
                <span className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge(dd.status)}`}>
                  {dd.status.charAt(0) + dd.status.slice(1).toLowerCase()}
                </span>
              </div>

              {dd.account && (
                <p className="text-[11px] text-[#BBBBBB] mb-3">
                  {t("directDebits.from")} {dd.account.type.replace("_", " ")} ••••{dd.account.accountNumber.slice(-4)}
                </p>
              )}

              {dd.status !== "CANCELLED" && (
                <div className="flex gap-2 pt-3 border-t border-[#F5F5F5]">
                  {dd.status === "ACTIVE" ? (
                    <button
                      onClick={() => handleAction(dd.id, "suspend")}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors"
                    >
                      <Pause size={12} /> {t("directDebits.suspend")}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(dd.id, "resume")}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-semibold transition-colors"
                    >
                      <Play size={12} /> {t("directDebits.resume")}
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(dd.id, "cancel")}
                    className="flex items-center gap-1 text-xs text-[#DB0011] hover:text-[#900] font-semibold transition-colors ml-auto"
                  >
                    <XCircle size={12} /> {t("directDebits.cancel")}
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
              <h2 className="text-base font-bold text-[#333]">{t("directDebits.new")}</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreate} className="overflow-y-auto px-5 pb-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.debitAccount")}</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type.replace("_", " ")} •••• {a.accountNumber.slice(-4)} ({formatCurrency(Number(a.balance), a.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.company")}</label>
                <input
                  type="text"
                  value={originatorName}
                  onChange={(e) => setOriginatorName(e.target.value)}
                  placeholder="e.g. Netflix, Sky, HMRC"
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.originatorRef")}</label>
                  <input
                    type="text"
                    value={originatorRef}
                    onChange={(e) => setOriginatorRef(e.target.value)}
                    placeholder="DD-REF-001"
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.yourRef")}</label>
                  <input
                    type="text"
                    value={userRef}
                    onChange={(e) => setUserRef(e.target.value)}
                    placeholder="CUST-12345"
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
                  {t("directDebits.amount")} <span className="text-[#AAAAAA] normal-case font-normal">(leave blank if variable)</span>
                </label>
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
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.frequency")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"] as const).map((f) => (
                    <button
                      key={f} type="button" onClick={() => setFrequency(f)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${frequency === f ? "border-[#DB0011] bg-red-50 text-[#DB0011]" : "border-[#E8E8E8] text-[#555] hover:border-[#CCC]"}`}
                    >
                      {FREQ_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("directDebits.firstDate")}</label>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                />
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
                {creating ? "Setting up…" : t("directDebits.submit")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
