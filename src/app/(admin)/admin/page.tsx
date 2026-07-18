"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminApi,
  type AdminTransfer, type AdminUser, type AdminLoan, type AdminDispute,
  type AdminInsuranceQuote, type AdminCard, type AdminTransaction,
  type AdminExchangeRate, type AdminPortfolio, type AdminGoal, type AdminAccount,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldCheck, CheckCircle2, Users, ArrowLeftRight, Landmark, AlertCircle,
  ChevronRight, Search, RefreshCw, CreditCard, Receipt, Globe,
  TrendingUp, Target, Home, ShieldAlert,
} from "lucide-react";

type Tab = "transfers" | "loans" | "mortgages" | "disputes" | "insurance" | "cards" | "transactions" | "rates" | "investments" | "goals" | "users";

// ── helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  const s = status?.toUpperCase();
  if (["COMPLETED","ACTIVE","RESOLVED","VERIFIED","ACCEPTED","UNBLOCKED"].includes(s)) return "text-green-700 bg-green-100";
  if (["PENDING","OPEN","UNDER_REVIEW","REQUESTED","QUOTED"].includes(s)) return "text-amber-700 bg-amber-100";
  if (["FAILED","REJECTED","SUSPENDED","BLOCKED","DECLINED","CANCELLED"].includes(s)) return "text-red-700 bg-red-100";
  if (["FROZEN"].includes(s)) return "text-blue-700 bg-blue-100";
  if (["ACHIEVED","PAID_OFF"].includes(s)) return "text-emerald-700 bg-emerald-100";
  return "text-[#767676] bg-[#F0F0F0]";
}

function Pill({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(status)}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ActButton({ label, variant, onClick, loading }: {
  label: string; variant: "approve" | "reject" | "resolve" | "block" | "unblock"; onClick: () => void; loading?: boolean;
}) {
  const cls = ["approve","resolve","unblock"].includes(variant)
    ? "bg-green-600 hover:bg-green-700 text-white"
    : variant === "block"
    ? "bg-amber-600 hover:bg-amber-700 text-white"
    : "bg-[#DB0011] hover:bg-[#b8000e] text-white";
  return (
    <button onClick={onClick} disabled={loading}
      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${cls}`}>
      {loading ? "…" : label}
    </button>
  );
}

function UserLine({ user }: { user: { firstName: string; lastName: string; email: string } }) {
  return <p className="text-xs text-[#767676]">{user.firstName} {user.lastName} · <span className="text-[#AAAAAA]">{user.email}</span></p>;
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const [stats, setStats] = useState<{ totalUsers: number; totalTransfers: number; totalTransactions: number; totalTransactionVolume: number } | null>(null);
  useEffect(() => { adminApi.stats().then((r) => setStats(r.data.data)).catch(() => {}); }, []);
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

// ── Transfers ─────────────────────────────────────────────────────────────────

function TransfersTab() {
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [items, setItems] = useState<AdminTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.transfers({ status: filter === "PENDING" ? "PENDING" : undefined, limit: 50 });
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setActionId(id);
    try {
      await adminApi.approveTransfer(id);
      setItems((p) => p.map((t) => t.id === id ? { ...t, status: "COMPLETED" } : t));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection (optional):") ?? null;
    if (reason === null) return;
    setActionId(id);
    try {
      await adminApi.rejectTransfer(id, reason || undefined);
      setItems((p) => p.map((t) => t.id === id ? { ...t, status: "FAILED" } : t));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  return (
    <div>
      <FilterBar filters={["PENDING","ALL"]} active={filter} onSelect={(f) => setFilter(f as any)} labels={{ PENDING: "Pending", ALL: "All" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={CheckCircle2} label="No transfers" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((t) => (
            <div key={t.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#333] uppercase">{t.type}</span>
                    <Pill status={t.status} />
                  </div>
                  {t.fromAccount?.user && <UserLine user={t.fromAccount.user} />}
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

// ── Loans / Mortgages ─────────────────────────────────────────────────────────

function LoansTab({ loanType }: { loanType?: "MORTGAGE" }) {
  const [filter, setFilter] = useState<"PENDING" | "ACTIVE" | "ALL">("PENDING");
  const [items, setItems] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.loans(filter === "ALL" ? undefined : filter);
      const data = (r.data.data as AdminLoan[]).filter((l) =>
        loanType ? l.type === loanType : l.type !== "MORTGAGE"
      );
      setItems(data);
    } catch {} finally { setLoading(false); }
  }, [filter, loanType]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    if (!confirm("Approve this loan?")) return;
    setActionId(id);
    try {
      await adminApi.approveLoan(id);
      setItems((p) => p.map((l) => l.id === id ? { ...l, status: "ACTIVE" } : l));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection (optional):") ?? null;
    if (reason === null) return;
    setActionId(id);
    try {
      await adminApi.rejectLoan(id, reason || undefined);
      setItems((p) => p.map((l) => l.id === id ? { ...l, status: "REJECTED" } : l));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  const label = loanType === "MORTGAGE" ? "mortgage" : "loan";

  return (
    <div>
      <FilterBar filters={["PENDING","ACTIVE","ALL"]} active={filter} onSelect={(f) => setFilter(f as any)} labels={{ PENDING: "Pending", ACTIVE: "Active", ALL: "All" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={Landmark} label={`No ${filter.toLowerCase()} ${label}s`} /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((l) => (
            <div key={l.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#333] uppercase">{l.type}</span>
                    <Pill status={l.status} />
                  </div>
                  <UserLine user={l.user} />
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

// ── Disputes ──────────────────────────────────────────────────────────────────

function DisputesTab() {
  const [filter, setFilter] = useState<"OPEN" | "ALL">("OPEN");
  const [items, setItems] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [expanded, setExpanded] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.disputes(filter === "ALL" ? undefined : filter);
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function review(id: string) {
    setActionId(id + ":review");
    try {
      await adminApi.reviewDispute(id);
      setItems((p) => p.map((d) => d.id === id ? { ...d, status: "UNDER_REVIEW" as AdminDispute["status"] } : d));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function resolve(id: string) {
    const resolution = prompt("Enter resolution:");
    if (!resolution?.trim()) return;
    setActionId(id + ":resolve");
    try {
      await adminApi.resolveDispute(id, resolution.trim());
      setItems((p) => p.map((d) => d.id === id ? { ...d, status: "RESOLVED" as AdminDispute["status"], resolution } : d));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function rejectDispute(id: string) {
    const reason = prompt("Enter rejection reason:");
    if (!reason?.trim()) return;
    setActionId(id + ":reject");
    try {
      await adminApi.rejectDispute(id, reason.trim());
      setItems((p) => p.map((d) => d.id === id ? { ...d, status: "REJECTED" as AdminDispute["status"], resolution: reason.trim() } : d));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  return (
    <div>
      <FilterBar filters={["OPEN","ALL"]} active={filter} onSelect={(f) => setFilter(f as any)} labels={{ OPEN: "Open", ALL: "All" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={CheckCircle2} label="No disputes" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((d) => (
            <div key={d.id} className="bg-white px-4 py-4">
              <button onClick={() => setExpanded((p) => p === d.id ? "" : d.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5"><Pill status={d.status} /></div>
                    <p className="text-sm font-semibold text-[#333] mt-1">{d.subject}</p>
                    <UserLine user={d.user} />
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
                    <p className="text-xs text-[#AAAAAA] mb-1">Description</p>
                    <p className="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">{d.description}</p>
                  </div>
                  {d.transactionId && (
                    <p className="text-xs text-[#767676]">Transaction: <span className="font-mono">{d.transactionId}</span></p>
                  )}
                  {d.resolution && (
                    <div className={`${d.status === "REJECTED" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} border rounded-xl px-4 py-3`}>
                      <p className={`text-xs font-semibold mb-0.5 ${d.status === "REJECTED" ? "text-red-700" : "text-green-700"}`}>
                        {d.status === "REJECTED" ? "Rejection reason" : "Resolution"}
                      </p>
                      <p className={`text-sm ${d.status === "REJECTED" ? "text-red-800" : "text-green-800"}`}>{d.resolution}</p>
                    </div>
                  )}
                  {d.status === "OPEN" && (
                    <div className="flex gap-2">
                      <ActButton label="Review" variant="approve" onClick={() => review(d.id)} loading={actionId === d.id + ":review"} />
                      <ActButton label="Resolve" variant="resolve" onClick={() => resolve(d.id)} loading={actionId === d.id + ":resolve"} />
                      <ActButton label="Reject" variant="reject" onClick={() => rejectDispute(d.id)} loading={actionId === d.id + ":reject"} />
                    </div>
                  )}
                  {d.status === "UNDER_REVIEW" && (
                    <div className="flex gap-2">
                      <ActButton label="Resolve" variant="resolve" onClick={() => resolve(d.id)} loading={actionId === d.id + ":resolve"} />
                      <ActButton label="Reject" variant="reject" onClick={() => rejectDispute(d.id)} loading={actionId === d.id + ":reject"} />
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

// ── Insurance ─────────────────────────────────────────────────────────────────

function InsuranceTab() {
  const [filter, setFilter] = useState<"REQUESTED" | "ALL">("REQUESTED");
  const [items, setItems] = useState<AdminInsuranceQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [expanded, setExpanded] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.insuranceQuotes(filter === "ALL" ? undefined : filter);
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function process(id: string, status: "ACCEPTED" | "DECLINED") {
    let premium: number | undefined;
    if (status === "ACCEPTED") {
      const raw = prompt("Set monthly premium (£):");
      if (!raw) return;
      premium = Number(raw);
      if (isNaN(premium)) { alert("Invalid premium"); return; }
    }
    const notes = prompt(`Notes for customer (optional):`);
    if (notes === null) return;
    setActionId(id);
    try {
      await adminApi.processInsurance(id, { status, premium, notes: notes || undefined });
      setItems((p) => p.map((q) => q.id === id ? { ...q, status } : q));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  return (
    <div>
      <FilterBar filters={["REQUESTED","QUOTED","ACCEPTED","DECLINED","ALL"]} active={filter} onSelect={(f) => setFilter(f as any)}
        labels={{ REQUESTED: "Pending", QUOTED: "Quoted", ACCEPTED: "Accepted", DECLINED: "Declined", ALL: "All" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={ShieldAlert} label="No insurance quotes" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((q) => (
            <div key={q.id} className="bg-white px-4 py-4">
              <button onClick={() => setExpanded((p) => p === q.id ? "" : q.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-[#333]">{q.type} Insurance</span>
                      <Pill status={q.status} />
                    </div>
                    <UserLine user={q.user} />
                    {q.premium && <p className="text-xs text-[#AAAAAA] mt-0.5">Premium: £{Number(q.premium).toFixed(2)}/mo</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[10px] text-[#AAAAAA]">{formatDate(q.createdAt)}</p>
                    <ChevronRight size={14} className={`text-[#CCCCCC] mt-1 ml-auto transition-transform ${expanded === q.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </button>
              {expanded === q.id && (
                <div className="mt-3 space-y-3">
                  <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 text-xs text-[#555] space-y-1">
                    {Object.entries(q.details).map(([k, v]) => (
                      <p key={k}><span className="text-[#AAAAAA] capitalize">{k.replace(/_/g," ")}:</span> {String(v)}</p>
                    ))}
                  </div>
                  {q.notes && <p className="text-xs text-[#767676] italic">{q.notes}</p>}
                  {(q.status === "REQUESTED" || q.status === "QUOTED") && (
                    <div className="flex gap-2">
                      <ActButton label="Accept" variant="approve" onClick={() => process(q.id, "ACCEPTED")} loading={actionId === q.id} />
                      <ActButton label="Decline" variant="reject" onClick={() => process(q.id, "DECLINED")} loading={actionId === q.id} />
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

// ── Cards ─────────────────────────────────────────────────────────────────────

function CardsTab() {
  const [filter, setFilter] = useState<"ACTIVE" | "FROZEN" | "BLOCKED" | "ALL">("ALL");
  const [items, setItems] = useState<AdminCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.adminCards(filter !== "ALL" ? { status: filter } : undefined);
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function blockCard(id: string) {
    if (!confirm("Block this card? The user will be notified.")) return;
    setActionId(id);
    try {
      await adminApi.blockCard(id);
      setItems((p) => p.map((c) => c.id === id ? { ...c, status: "BLOCKED" } : c));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function unblockCard(id: string) {
    setActionId(id);
    try {
      await adminApi.unblockCard(id);
      setItems((p) => p.map((c) => c.id === id ? { ...c, status: "ACTIVE" } : c));
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  return (
    <div>
      <FilterBar filters={["ALL","ACTIVE","FROZEN","BLOCKED"]} active={filter} onSelect={(f) => setFilter(f as any)}
        labels={{ ALL: "All", ACTIVE: "Active", FROZEN: "Frozen", BLOCKED: "Blocked" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={CreditCard} label="No cards" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((c) => (
            <div key={c.id} className="bg-white px-4 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#333] font-mono">{c.maskedPan}</span>
                    <Pill status={c.status} />
                    <span className="text-[10px] text-[#AAAAAA] bg-[#F0F0F0] px-1.5 py-0.5 rounded font-bold">{c.type}</span>
                  </div>
                  <UserLine user={c.user} />
                  <p className="text-xs text-[#AAAAAA] mt-0.5">{c.account.type} · {c.account.accountNumber} · Exp {c.expiryMonth}/{c.expiryYear}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-3">
                  {c.status !== "BLOCKED" && c.status !== "CANCELLED" && c.status !== "EXPIRED" && (
                    <ActButton label="Block" variant="block" onClick={() => blockCard(c.id)} loading={actionId === c.id} />
                  )}
                  {c.status === "BLOCKED" && (
                    <ActButton label="Unblock" variant="unblock" onClick={() => unblockCard(c.id)} loading={actionId === c.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Transactions ──────────────────────────────────────────────────────────────

function TransactionsTab() {
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.allTransactions({ limit: 50, type: filter !== "ALL" ? filter : undefined });
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <FilterBar filters={["ALL","CREDIT","DEBIT"]} active={filter} onSelect={(f) => setFilter(f as any)}
        labels={{ ALL: "All", CREDIT: "Credits", DEBIT: "Debits" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={Receipt} label="No transactions" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((t) => (
            <div key={t.id} className="bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.type === "CREDIT" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>{t.type}</span>
                    <span className="text-[10px] text-[#AAAAAA] uppercase">{t.category}</span>
                  </div>
                  <p className="text-xs font-medium text-[#333] truncate">{t.description}</p>
                  <UserLine user={t.account.user} />
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`text-sm font-bold ${t.type === "CREDIT" ? "text-green-700" : "text-[#333]"}`}>
                    {t.type === "CREDIT" ? "+" : "-"}{formatCurrency(Number(t.amount), t.currency)}
                  </p>
                  <p className="text-[10px] text-[#AAAAAA]">{formatDate(t.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Exchange Rates ────────────────────────────────────────────────────────────

function RatesTab() {
  const [items, setItems] = useState<AdminExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.adminRates().then((r) => setItems(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const r = await adminApi.refreshRates();
      setItems(r.data.data);
    } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Refresh failed"); }
    finally { setRefreshing(false); }
  }

  const filtered = items.filter((r) => r.quoteCurrency.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="bg-white border-b border-[#E8E8E8] px-4 py-2.5 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
          <input type="text" placeholder="Filter currency…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#AAAAAA] outline-none" />
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-1.5 bg-[#DB0011] text-white text-xs font-bold px-3 rounded-lg disabled:opacity-50">
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      {loading ? <LoadingRows /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#333]">{r.baseCurrency} → {r.quoteCurrency}</p>
                <p className="text-[10px] text-[#AAAAAA]">Updated {formatDate(r.fetchedAt)}</p>
              </div>
              <p className="text-sm font-mono font-semibold text-[#333]">{Number(r.rate).toFixed(4)}</p>
            </div>
          ))}
          {filtered.length === 0 && <Empty icon={Globe} label="No matching currencies" />}
        </div>
      )}
    </div>
  );
}

// ── Investments ───────────────────────────────────────────────────────────────

function InvestmentsTab() {
  const [items, setItems] = useState<AdminPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState("");

  useEffect(() => {
    adminApi.adminInvestments().then((r) => setItems(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={TrendingUp} label="No portfolios" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((p) => (
            <div key={p.id} className="bg-white px-4 py-4">
              <button onClick={() => setExpanded((prev) => prev === p.id ? "" : p.id)} className="w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#333]">{p.name}</p>
                    <UserLine user={p.user} />
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs text-[#AAAAAA]">{p.investments.length} holdings</p>
                    <ChevronRight size={14} className={`text-[#CCCCCC] mt-1 ml-auto transition-transform ${expanded === p.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </button>
              {expanded === p.id && p.investments.length > 0 && (
                <div className="mt-3 bg-[#F8F8F8] rounded-xl divide-y divide-[#EEEEEE] overflow-hidden">
                  {p.investments.map((inv) => (
                    <div key={inv.id} className="px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#333]">{inv.ticker}</p>
                        <p className="text-[10px] text-[#AAAAAA]">{inv.name} · {inv.assetType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#333]">{Number(inv.quantity).toFixed(4)} units</p>
                        <p className="text-[10px] text-[#AAAAAA]">Avg {formatCurrency(Number(inv.avgCostBasis))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Savings Goals ─────────────────────────────────────────────────────────────

function GoalsTab() {
  const [filter, setFilter] = useState<"ACTIVE" | "ALL">("ACTIVE");
  const [items, setItems] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.adminGoals(filter === "ALL" ? undefined : filter);
      setItems(r.data.data);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <FilterBar filters={["ACTIVE","ACHIEVED","ALL"]} active={filter} onSelect={(f) => setFilter(f as any)}
        labels={{ ACTIVE: "Active", ACHIEVED: "Achieved", ALL: "All" }} />
      {loading ? <LoadingRows /> : items.length === 0 ? <Empty icon={Target} label="No savings goals" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {items.map((g) => {
            const pct = Math.min(100, (Number(g.currentAmount) / Number(g.targetAmount)) * 100);
            return (
              <div key={g.id} className="bg-white px-4 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {g.emoji && <span>{g.emoji}</span>}
                      <p className="text-sm font-semibold text-[#333]">{g.name}</p>
                      <Pill status={g.status} />
                    </div>
                    <UserLine user={g.user} />
                    {g.targetDate && <p className="text-[10px] text-[#AAAAAA] mt-0.5">Target: {formatDate(g.targetDate)}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-[#333]">{formatCurrency(Number(g.currentAmount))}</p>
                    <p className="text-[10px] text-[#AAAAAA]">of {formatCurrency(Number(g.targetAmount))}</p>
                  </div>
                </div>
                <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#DB0011] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-[#AAAAAA] mt-1">{pct.toFixed(0)}% complete</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────

const TIERS = ["STANDARD", "PREMIUM", "PRIVATE", "BUSINESS"] as const;

function UserRow({ u, onUpdate, onDelete }: {
  u: AdminUser;
  onUpdate: (id: string, patch: Partial<AdminUser>) => void;
  onDelete: (id: string) => void;
}) {
  const [actionId, setActionId] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [acctLoading, setAcctLoading] = useState(false);

  async function act(fn: () => Promise<void>) {
    setActionId("x");
    try { await fn(); } catch (e: unknown) { alert((e as any)?.response?.data?.message || "Failed"); }
    finally { setActionId(""); }
  }

  async function loadAccounts() {
    if (accounts.length > 0) { setExpanded((p) => !p); return; }
    setExpanded(true);
    setAcctLoading(true);
    try {
      const r = await adminApi.getUserAccounts(u.id);
      setAccounts(r.data.data);
    } catch {} finally { setAcctLoading(false); }
  }

  return (
    <div className="bg-white px-4 py-4">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#333]">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-[#767676] truncate">{u.email}</p>
          {u.phone && <p className="text-xs text-[#AAAAAA]">{u.phone}</p>}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Pill status={u.status} />
            <Pill status={u.kycStatus} />
            <span className="text-[10px] bg-[#1a1a2e] text-white px-2 py-0.5 rounded-full uppercase font-bold">{u.tier}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-[10px] text-[#AAAAAA]">{u._count.accounts} account{u._count.accounts !== 1 ? "s" : ""}</p>
          <p className="text-[10px] text-[#AAAAAA] mt-0.5">{formatDate(u.createdAt)}</p>
          <button onClick={loadAccounts} className="text-[10px] text-[#DB0011] font-semibold mt-1">
            {expanded ? "Hide accounts ▲" : "View accounts ▼"}
          </button>
        </div>
      </div>

      {/* Status actions */}
      <div className="mb-2">
        <p className="text-[9px] text-[#AAAAAA] uppercase font-bold mb-1.5">Account Status</p>
        <div className="flex flex-wrap gap-1.5">
          {u.status === "ACTIVE" ? (
            <Btn color="red" label="Suspend" loading={actionId === "x"} onClick={() => act(async () => { await adminApi.suspendUser(u.id); onUpdate(u.id, { status: "SUSPENDED" }); })} />
          ) : (
            <Btn color="green" label="Activate" loading={actionId === "x"} onClick={() => act(async () => { await adminApi.activateUser(u.id); onUpdate(u.id, { status: "ACTIVE" }); })} />
          )}
          <Btn color="amber" label="Reset Lockout" loading={actionId === "x"} onClick={() => act(async () => { await adminApi.resetLockout(u.id); alert("Lockout cleared"); })} />
          <Btn color="blue" label="Verify Email" loading={actionId === "x"} onClick={() => act(async () => { await adminApi.verifyUserEmail(u.id); alert("Email marked as verified"); })} />
          <Btn color="red-outline" label="Delete User" loading={actionId === "x"} onClick={() => {
            if (!confirm(`Permanently delete ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
            act(async () => { await adminApi.deleteUser(u.id); onDelete(u.id); });
          }} />
        </div>
      </div>

      {/* KYC actions */}
      {u.kycStatus === "PENDING" && (
        <div className="mb-2">
          <p className="text-[9px] text-[#AAAAAA] uppercase font-bold mb-1.5">KYC</p>
          <div className="flex flex-wrap gap-1.5">
            <Btn color="green" label="Verify KYC" loading={actionId === "x"} onClick={() => act(async () => { await adminApi.approveKyc(u.id); onUpdate(u.id, { kycStatus: "VERIFIED" }); })} />
            <Btn color="red" label="Reject KYC" loading={actionId === "x"} onClick={async () => {
              const reason = prompt("Reason for KYC rejection:");
              if (!reason?.trim()) return;
              await act(async () => { await adminApi.rejectKyc(u.id, reason.trim()); onUpdate(u.id, { kycStatus: "REJECTED" }); });
            }} />
          </div>
        </div>
      )}

      {/* Tier management */}
      <div>
        <p className="text-[9px] text-[#AAAAAA] uppercase font-bold mb-1.5">Tier</p>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.filter((t) => t !== u.tier).map((tier) => (
            <Btn key={tier} color="navy" label={`→ ${tier.charAt(0) + tier.slice(1).toLowerCase()}`} loading={actionId === "x"}
              onClick={() => act(async () => { await adminApi.changeUserTier(u.id, tier); onUpdate(u.id, { tier }); })} />
          ))}
        </div>
      </div>

      {/* Accounts panel */}
      {expanded && (
        <div className="mt-3 border-t border-[#F0F0F0] pt-3">
          <p className="text-[9px] text-[#AAAAAA] uppercase font-bold mb-2">Bank Accounts</p>
          {acctLoading ? <p className="text-xs text-[#AAAAAA]">Loading…</p> : accounts.length === 0 ? (
            <p className="text-xs text-[#AAAAAA]">No accounts</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="bg-[#F8F8F8] rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[#333]">{a.type} · {a.accountNumber}</p>
                      <Pill status={a.status} />
                    </div>
                    <p className="text-[10px] text-[#AAAAAA]">{formatCurrency(Number(a.balance), a.currency)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {a.status === "ACTIVE" && (
                      <Btn color="amber" label="Freeze" loading={false}
                        onClick={() => act(async () => { await adminApi.freezeAccount(a.id); setAccounts((p) => p.map((ac) => ac.id === a.id ? { ...ac, status: "FROZEN", isFrozen: true } : ac)); })} />
                    )}
                    {a.status === "FROZEN" && (
                      <Btn color="green" label="Unfreeze" loading={false}
                        onClick={() => act(async () => { await adminApi.unfreezeAccount(a.id); setAccounts((p) => p.map((ac) => ac.id === a.id ? { ...ac, status: "ACTIVE", isFrozen: false } : ac)); })} />
                    )}
                    {a.status !== "CLOSED" && (
                      <Btn color="red-outline" label="Close" loading={false}
                        onClick={() => {
                          if (!confirm(`Close account ${a.accountNumber}? Balance must be £0.`)) return;
                          act(async () => { await adminApi.closeAccount(a.id); setAccounts((p) => p.map((ac) => ac.id === a.id ? { ...ac, status: "CLOSED" } : ac)); });
                        }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type BtnColor = "green" | "red" | "amber" | "blue" | "navy" | "red-outline";
function Btn({ label, color, onClick, loading }: { label: string; color: BtnColor; onClick: () => void; loading: boolean }) {
  const cls: Record<BtnColor, string> = {
    green: "bg-green-600 text-white hover:bg-green-700",
    red: "bg-[#DB0011] text-white hover:bg-[#b8000e]",
    amber: "bg-amber-500 text-white hover:bg-amber-600",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    navy: "bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]",
    "red-outline": "border-2 border-[#DB0011] text-[#DB0011] hover:bg-red-50",
  };
  return (
    <button onClick={onClick} disabled={loading}
      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${cls[color]}`}>
      {label}
    </button>
  );
}

function UsersTab() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.users({ search: query || undefined, limit: 30 });
      setUsers(r.data.data.users);
    } catch {} finally { setLoading(false); }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  function updateUser(id: string, patch: Partial<AdminUser>) {
    setUsers((p) => p.map((u) => u.id === id ? { ...u, ...patch } : u));
  }

  function removeUser(id: string) {
    setUsers((p) => p.filter((u) => u.id !== id));
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); setQuery(search); }} className="bg-white border-b border-[#E8E8E8] px-4 py-2.5 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
          <Search size={14} className="text-[#AAAAAA] flex-shrink-0" />
          <input type="text" placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#333] placeholder-[#AAAAAA] outline-none" />
        </div>
        <button type="submit" className="bg-[#DB0011] text-white text-xs font-bold px-3 rounded-lg">Search</button>
      </form>
      {loading ? <LoadingRows /> : users.length === 0 ? <Empty icon={Users} label="No users found" /> : (
        <div className="divide-y divide-[#F0F0F0]">
          {users.map((u) => (
            <UserRow key={u.id} u={u} onUpdate={updateUser} onDelete={removeUser} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function FilterBar({ filters, active, onSelect, labels }: {
  filters: string[]; active: string; onSelect: (f: string) => void; labels: Record<string, string>;
}) {
  return (
    <div className="flex bg-white border-b border-[#E8E8E8] overflow-x-auto">
      {filters.map((f) => (
        <button key={f} onClick={() => onSelect(f)}
          className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${active === f ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#767676]"}`}>
          {labels[f] ?? f}
        </button>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-[#F0F0F0]">
      {[1,2,3].map((i) => (
        <div key={i} className="bg-white px-4 py-4 space-y-2 animate-pulse">
          <div className="flex gap-2"><div className="h-4 w-16 bg-[#F0F0F0] rounded-full" /><div className="h-4 w-20 bg-[#F0F0F0] rounded-full" /></div>
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
  { id: "transfers",    label: "Transfers",    icon: ArrowLeftRight },
  { id: "loans",        label: "Loans",        icon: Landmark       },
  { id: "mortgages",    label: "Mortgages",    icon: Home           },
  { id: "disputes",     label: "Disputes",     icon: AlertCircle    },
  { id: "insurance",    label: "Insurance",    icon: ShieldAlert    },
  { id: "cards",        label: "Cards",        icon: CreditCard     },
  { id: "transactions", label: "Transactions", icon: Receipt        },
  { id: "rates",        label: "Rates",        icon: Globe          },
  { id: "investments",  label: "Investments",  icon: TrendingUp     },
  { id: "goals",        label: "Goals",        icon: Target         },
  { id: "users",        label: "Users",        icon: Users          },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("transfers");

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white">
        <div className="px-4 py-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#DB0011]" />
          <h1 className="text-base font-semibold">Admin Console</h1>
          <span className="ml-auto text-[9px] uppercase tracking-widest text-white/30 font-bold">Internal</span>
        </div>
        <StatsBar />
      </div>

      {/* Scrollable tab nav */}
      <div className="bg-white border-b border-[#E8E8E8] flex overflow-x-auto scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 border-b-2 transition-colors ${activeTab === id ? "border-[#DB0011] text-[#DB0011]" : "border-transparent text-[#AAAAAA]"}`}>
            <Icon size={15} />
            <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[#F8F8F8] min-h-screen">
        {activeTab === "transfers"    && <TransfersTab />}
        {activeTab === "loans"        && <LoansTab />}
        {activeTab === "mortgages"    && <LoansTab loanType="MORTGAGE" />}
        {activeTab === "disputes"     && <DisputesTab />}
        {activeTab === "insurance"    && <InsuranceTab />}
        {activeTab === "cards"        && <CardsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "rates"        && <RatesTab />}
        {activeTab === "investments"  && <InvestmentsTab />}
        {activeTab === "goals"        && <GoalsTab />}
        {activeTab === "users"        && <UsersTab />}
      </div>
    </div>
  );
}
