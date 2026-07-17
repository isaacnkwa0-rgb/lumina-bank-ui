"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminApi,
  type AdminTransfer,
  type AdminUser,
  type AdminLoan,
  type AdminDispute,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, Users, ArrowLeftRight,
  Landmark, AlertCircle, ChevronRight, Search, RefreshCw, FileCheck,
} from "lucide-react";

type Tab = "transfers" | "loans" | "disputes" | "users";

// ── helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  const s = status?.toUpperCase();
  if (s === "COMPLETED" || s === "ACTIVE" || s === "RESOLVED" || s === "VERIFIED") return "text-green-700 bg-green-100";
  if (s === "PENDING" || s === "OPEN" || s === "UNDER_REVIEW") return "text-amber-700 bg-amber-100";
  if (s === "FAILED" || s === "REJECTED" || s === "SUSPENDED") return "text-red-700 bg-red-100";
  return "text-[#767676] bg-[#F0F0F0]";
}

function Pill({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(status)}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function ActButton({ label, variant, onClick, loading }: {
  label: string; variant: "approve" | "reject" | "resolve"; onClick: () => void; loading?: boolean;
}) {
  const cls = variant === "approve" || variant === "resolve"
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-[#DB0011] hover:bg-[#b8000e] text-white";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${cls}`}
    >
      {loading ? "…" : label}
    </button>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const [stats, setStats] = useState<{ totalUsers: number; totalTransfers: number; totalTransactions: number; totalTransactionVolume: number } | null>(null);

  useEffect(() => {
    adminApi.stats().then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-0 border-b border-[#1a1a2e]/20">
      {[
        { label: "Users", value: stats.totalUsers },
        { label: "Transfers", value: stats.totalTransfers },
        { label: "Txns", value: stats.totalTransactions },
        { label: "Volume", value: formatCurrency(stats.totalTransactionVolume) },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white/10 px-3 py-2.5 border-r border-[#1a1a2e]/20 last:border-r-0">
          <p className="text-[9px] text-white/50 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-bold text-white leading-tight mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Transfers tab ─────────────────────────────────────────────────────────────

function TransfersTab() {
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [transfers, setTransfers] = useState<AdminTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.transfers({ status: filter === "PENDING" ? "PENDING" : undefined, limit: 50 });
      setTransfers(r.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setActionId(id);
    try {
      await adminApi.approveTransfer(id);
      setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "COMPLETED" } : t));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection (optional):") ?? null;
    if (reason === null) return;
    setActionId(id);
    try {
      await adminApi.rejectTransfer(id, reason || undefined);
      setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "FAILED" } : t));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  return (
    <div>
      <div className="flex border-b border-[#E8E8E8] bg-white">
        {(["PENDING", "ALL"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${filter === f ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#767676]"}`}>
            {f === "PENDING" ? "Pending" : "All"}
          </button>
        ))}
      </div>
      {loading ? <LoadingRows /> : transfers.length === 0 ? (
        <Empty icon={CheckCircle2} label="No transfers" />
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {transfers.map((t) => (
            <div key={t.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#333] uppercase">{t.type}</span>
                    <Pill status={t.status} />
                  </div>
                  {t.fromAccount?.user && (
                    <p className="text-xs text-[#767676]">
                      {t.fromAccount.user.firstName} {t.fromAccount.user.lastName}
                      <span className="font-mono"> · ••{t.fromAccount.accountNumber.slice(-4)}</span>
                    </p>
                  )}
                  {t.toAccountNumber && <p className="text-xs text-[#AAAAAA] font-mono truncate">→ {t.toBank || ""} {t.toAccountNumber}</p>}
                  <p className="text-xs text-[#AAAAAA] truncate mt-0.5">{t.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-[#333]">{formatCurrency(Number(t.amount), t.currency)}</p>
                  <p className="text-[10px] text-[#AAAAAA]">{formatDate(t.createdAt)}</p>
                </div>
              </div>
              {t.status === "PENDING" && (
                <div className="flex gap-2 mt-3">
                  <ActButton label="Approve" variant="approve" onClick={() => approve(t.id)} loading={actionId === t.id} />
                  <ActButton label="Reject" variant="reject" onClick={() => reject(t.id)} loading={actionId === t.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Loans tab ─────────────────────────────────────────────────────────────────

function LoansTab() {
  const [filter, setFilter] = useState<"PENDING" | "ACTIVE" | "ALL">("PENDING");
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === "ALL" ? undefined : filter;
      const r = await adminApi.loans(status);
      setLoans(r.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    if (!confirm("Approve this loan? An amortization schedule will be created.")) return;
    setActionId(id);
    try {
      await adminApi.approveLoan(id);
      setLoans((prev) => prev.map((l) => l.id === id ? { ...l, status: "ACTIVE" } : l));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection (optional):") ?? null;
    if (reason === null) return;
    setActionId(id);
    try {
      await adminApi.rejectLoan(id, reason || undefined);
      setLoans((prev) => prev.map((l) => l.id === id ? { ...l, status: "REJECTED" } : l));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  const pendingCount = loans.filter((l) => l.status === "PENDING").length;

  return (
    <div>
      <div className="flex border-b border-[#E8E8E8] bg-white">
        {(["PENDING", "ACTIVE", "ALL"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${filter === f ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#767676]"}`}>
            {f === "ALL" ? "All" : f === "PENDING" ? `Pending${pendingCount > 0 && filter !== "PENDING" ? ` (${pendingCount})` : ""}` : "Active"}
          </button>
        ))}
      </div>
      {loading ? <LoadingRows /> : loans.length === 0 ? (
        <Empty icon={Landmark} label={`No ${filter.toLowerCase()} loans`} />
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {loans.map((l) => (
            <div key={l.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#333] uppercase">{l.type}</span>
                    <Pill status={l.status} />
                  </div>
                  <p className="text-xs text-[#767676]">{l.user.firstName} {l.user.lastName} · {l.user.email}</p>
                  <p className="text-xs text-[#AAAAAA] mt-0.5">{l.termMonths} months · {(Number(l.interestRate) * 100).toFixed(1)}% p.a.</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-[#333]">{formatCurrency(Number(l.principalAmount))}</p>
                  <p className="text-[10px] text-[#AAAAAA]">{formatCurrency(Number(l.monthlyPayment))}/mo</p>
                  <p className="text-[10px] text-[#AAAAAA]">{formatDate(l.createdAt)}</p>
                </div>
              </div>
              {l.status === "PENDING" && (
                <div className="flex gap-2 mt-3">
                  <ActButton label="Approve" variant="approve" onClick={() => approve(l.id)} loading={actionId === l.id} />
                  <ActButton label="Reject" variant="reject" onClick={() => reject(l.id)} loading={actionId === l.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Disputes tab ──────────────────────────────────────────────────────────────

function DisputesTab() {
  const [filter, setFilter] = useState<"OPEN" | "ALL">("OPEN");
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [expanded, setExpanded] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.disputes(filter === "ALL" ? undefined : filter);
      setDisputes(r.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: string) {
    const resolution = prompt("Enter resolution / response to customer:");
    if (!resolution?.trim()) return;
    setActionId(id);
    try {
      await adminApi.resolveDispute(id, resolution.trim());
      setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "RESOLVED" as const, resolution } : d));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  return (
    <div>
      <div className="flex border-b border-[#E8E8E8] bg-white">
        {(["OPEN", "ALL"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${filter === f ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#767676]"}`}>
            {f === "OPEN" ? "Open" : "All"}
          </button>
        ))}
      </div>
      {loading ? <LoadingRows /> : disputes.length === 0 ? (
        <Empty icon={CheckCircle2} label={`No ${filter === "OPEN" ? "open " : ""}disputes`} />
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white px-4 py-4">
              <button
                onClick={() => setExpanded((prev) => prev === d.id ? "" : d.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Pill status={d.status} />
                    </div>
                    <p className="text-sm font-semibold text-[#333] mt-1">{d.subject}</p>
                    <p className="text-xs text-[#767676]">{d.user.firstName} {d.user.lastName} · {d.user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[10px] text-[#AAAAAA]">{formatDate(d.createdAt)}</p>
                    <ChevronRight size={14} className={`text-[#CCCCCC] mt-1 ml-auto transition-transform ${expanded === d.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </button>

              {expanded === d.id && (
                <div className="mt-3 space-y-3">
                  <div className="bg-[#F8F8F8] rounded-xl px-4 py-3">
                    <p className="text-xs text-[#AAAAAA] mb-1">Customer description</p>
                    <p className="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">{d.description}</p>
                  </div>
                  {d.transactionId && (
                    <p className="text-xs text-[#AAAAAA]">Transaction ID: <span className="font-mono">{d.transactionId}</span></p>
                  )}
                  {d.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-green-700 font-semibold mb-0.5">Resolution</p>
                      <p className="text-sm text-green-800">{d.resolution}</p>
                    </div>
                  )}
                  {(d.status === "OPEN" || d.status === "UNDER_REVIEW") && (
                    <div className="flex gap-2">
                      <ActButton label="Resolve" variant="resolve" onClick={() => resolve(d.id)} loading={actionId === d.id} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.users({ search: query || undefined, limit: 30 });
      setUsers(r.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search);
  }

  async function suspend(id: string) {
    if (!confirm("Suspend this user?")) return;
    setActionId(id);
    try {
      await adminApi.suspendUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "SUSPENDED" } : u));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  async function activate(id: string) {
    setActionId(id);
    try {
      await adminApi.activateUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "ACTIVE" } : u));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  async function approveKyc(userId: string) {
    if (!confirm("Approve KYC for this user?")) return;
    setActionId(userId);
    try {
      await adminApi.approveKyc(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: "VERIFIED" } : u));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  async function rejectKyc(userId: string) {
    const reason = prompt("Reason for KYC rejection:");
    if (!reason?.trim()) return;
    setActionId(userId);
    try {
      await adminApi.rejectKyc(userId, reason.trim());
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: "REJECTED" } : u));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Action failed");
    } finally { setActionId(""); }
  }

  return (
    <div>
      <form onSubmit={onSearch} className="bg-white border-b border-[#E8E8E8] px-4 py-2.5 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
          <Search size={14} className="text-[#AAAAAA] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#AAAAAA] outline-none"
          />
        </div>
        <button type="submit" className="bg-[#DB0011] text-white text-xs font-bold px-3 rounded-lg">
          Search
        </button>
      </form>

      {loading ? <LoadingRows /> : users.length === 0 ? (
        <Empty icon={Users} label="No users found" />
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {users.map((u) => (
            <div key={u.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#333]">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-[#767676] truncate">{u.email}</p>
                  {u.phone && <p className="text-xs text-[#AAAAAA]">{u.phone}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Pill status={u.status} />
                    <Pill status={u.kycStatus} />
                    <span className="text-[10px] text-[#AAAAAA] bg-[#F0F0F0] px-2 py-0.5 rounded-full uppercase font-bold">{u.tier}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-[10px] text-[#AAAAAA]">{u._count.accounts} acct{u._count.accounts !== 1 ? "s" : ""}</p>
                  <p className="text-[10px] text-[#AAAAAA] mt-0.5">{formatDate(u.createdAt)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {u.status === "ACTIVE" ? (
                  <button
                    onClick={() => suspend(u.id)}
                    disabled={actionId === u.id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-[#DB0011] text-[#DB0011] hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => activate(u.id)}
                    disabled={actionId === u.id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    Activate
                  </button>
                )}
                {u.kycStatus === "PENDING" && (
                  <>
                    <button
                      onClick={() => approveKyc(u.id)}
                      disabled={actionId === u.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Verify KYC
                    </button>
                    <button
                      onClick={() => rejectKyc(u.id)}
                      disabled={actionId === u.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#DB0011] text-white hover:bg-[#b8000e] disabled:opacity-50 transition-colors"
                    >
                      Reject KYC
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function LoadingRows() {
  return (
    <div className="divide-y divide-[#F0F0F0]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white px-4 py-4 space-y-2 animate-pulse">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-[#F0F0F0] rounded-full" />
            <div className="h-4 w-20 bg-[#F0F0F0] rounded-full" />
          </div>
          <div className="h-3 w-3/4 bg-[#F0F0F0] rounded" />
          <div className="h-3 w-1/2 bg-[#F0F0F0] rounded" />
        </div>
      ))}
    </div>
  );
}

function Empty({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="py-14 text-center">
      <Icon size={36} className="text-[#E3E3E3] mx-auto mb-2" />
      <p className="text-sm text-[#AAAAAA]">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
  { id: "loans",     label: "Loans",     icon: Landmark       },
  { id: "disputes",  label: "Disputes",  icon: AlertCircle    },
  { id: "users",     label: "Users",     icon: Users          },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("transfers");
  const [error, setError] = useState("");

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white">
        <div className="px-4 py-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#DB0011]" />
          <h1 className="text-base font-semibold">Admin Console</h1>
          <span className="ml-auto text-[9px] uppercase tracking-widest text-white/30 font-bold">Internal</span>
        </div>
        <StatsBar />
      </div>

      {error && (
        <div className="mx-4 mt-3 bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm">
          <p className="text-xs text-[#DB0011]">{error}</p>
        </div>
      )}

      {/* Tab nav */}
      <div className="bg-white border-b border-[#E8E8E8] flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 border-b-2 transition-colors ${
              activeTab === id ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#AAAAAA]"
            }`}
          >
            <Icon size={15} />
            <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[#F8F8F8] min-h-screen">
        {activeTab === "transfers" && <TransfersTab />}
        {activeTab === "loans"     && <LoansTab />}
        {activeTab === "disputes"  && <DisputesTab />}
        {activeTab === "users"     && <UsersTab />}
      </div>
    </div>
  );
}
