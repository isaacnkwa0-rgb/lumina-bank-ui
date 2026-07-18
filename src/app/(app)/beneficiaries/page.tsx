"use client";

import { useEffect, useState } from "react";
import { beneficiariesApi, type Beneficiary } from "@/lib/api";
import {
  Users, Trash2, PlusCircle, Globe, Building2,
  Search, X, Send, AlertCircle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  ["#DB0011", "#fff"],
  ["#1a56db", "#fff"],
  ["#0e9f6e", "#fff"],
  ["#7e3af2", "#fff"],
  ["#e3a008", "#fff"],
  ["#F7931A", "#fff"],
];

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "?";
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const idx = Math.abs([...name].reduce((h, c) => h * 31 + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const [bg, fg] = AVATAR_COLORS[idx];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: bg, color: fg, fontSize: size * 0.33 }}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteSheet({
  beneficiary,
  onCancel,
  onConfirm,
}: {
  beneficiary: Beneficiary;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function doDelete() {
    setLoading(true);
    try {
      await beneficiariesApi.delete(beneficiary.id);
      onConfirm();
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl pb-safe">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>
        <div className="px-5 pt-3 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-[#DB0011]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#333]">Remove payee?</p>
              <p className="text-xs text-[#777]">
                {beneficiary.name} · {beneficiary.bankName}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#999] mb-5 leading-relaxed">
            This payee will be removed from your saved list. You can still send money to them by entering their details manually.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555] hover:bg-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={doDelete}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#DB0011] text-white text-sm font-semibold hover:bg-[#b0000d] transition-colors disabled:opacity-60"
            >
              {loading ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Beneficiary card ──────────────────────────────────────────────────────────

function BeneficiaryCard({
  beneficiary,
  onDelete,
  onSend,
}: {
  beneficiary: Beneficiary;
  onDelete: () => void;
  onSend: () => void;
}) {
  const isIntl = beneficiary.type === "international";
  const acct   = beneficiary.accountNumber ?? "";

  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3.5 px-4 py-4">
        <Avatar name={beneficiary.name ?? "?"} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-[#222] truncate">
              {beneficiary.name || "Unknown"}
            </p>
            {isIntl ? (
              <Globe size={12} className="text-blue-500 flex-shrink-0" />
            ) : (
              <Building2 size={12} className="text-[#AAAAAA] flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#999] mt-0.5 truncate">{beneficiary.bankName || "Unknown bank"}</p>
          <p className="text-xs text-[#BBBBBB] font-mono mt-0.5">
            {acct.length > 4 ? `••••${acct.slice(-4)}` : acct || "—"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSend}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#DB0011] hover:bg-[#b0000d] transition-colors"
            aria-label="Send"
          >
            <Send size={14} className="text-white" />
          </button>
          <button
            onClick={onDelete}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={14} className="text-[#AAAAAA]" />
          </button>
        </div>
      </div>

      {/* Type badge bottom strip */}
      <div className={`px-4 py-2 ${isIntl ? "bg-blue-50" : "bg-[#FAFAFA]"} border-t border-[#F5F5F5] flex items-center gap-1.5`}>
        {isIntl ? (
          <Globe size={11} className="text-blue-500" />
        ) : (
          <Building2 size={11} className="text-[#BBBBBB]" />
        )}
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isIntl ? "text-blue-500" : "text-[#BBBBBB]"}`}>
          {isIntl ? "International" : "UK Domestic"}
        </span>
        {beneficiary.bankCode && (
          <>
            <span className="text-[#DDD] text-[10px]">·</span>
            <span className="text-[10px] text-[#CCCCCC] font-mono">{beneficiary.bankCode}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BeneficiariesPage() {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [tab, setTab]                     = useState<"all" | "domestic" | "international">("all");
  const [deleteTarget, setDeleteTarget]   = useState<Beneficiary | null>(null);

  useEffect(() => {
    beneficiariesApi
      .list()
      .then((r) => setBeneficiaries(r.data.data ?? []))
      .catch(() => setError("Could not load saved payees."))
      .finally(() => setLoading(false));
  }, []);

  function handleDeleted(id: string) {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    setDeleteTarget(null);
  }

  const domestic      = beneficiaries.filter((b) => b.type === "domestic");
  const international = beneficiaries.filter((b) => b.type === "international");

  const filtered = beneficiaries.filter((b) => {
    const matchTab = tab === "all" || b.type === tab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.name ?? "").toLowerCase().includes(q) ||
      (b.bankName ?? "").toLowerCase().includes(q) ||
      (b.accountNumber ?? "").includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">Saved Payees</h1>
          </div>
          <button
            onClick={() => router.push("/transfer")}
            className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white/25 transition-colors"
          >
            <PlusCircle size={13} />
            Add payee
          </button>
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold">{beneficiaries.length}</p>
              <p className="text-white/40 text-xs">Total payees</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold">{domestic.length}</p>
              <p className="text-white/40 text-xs">UK</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold">{international.length}</p>
              <p className="text-white/40 text-xs">International</p>
            </div>
          </div>
        )}
      </div>

      {/* Search + tabs (float over header) */}
      <div className="mx-4 -mt-8 space-y-3 relative z-10">
        <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] px-4 h-12">
          <Search size={15} className="text-[#AAAAAA] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search name, bank or account…"
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

        <div className="flex gap-2">
          {([
            ["all",           `All (${beneficiaries.length})`            ],
            ["domestic",      `UK (${domestic.length})`                  ],
            ["international", `International (${international.length})`  ],
          ] as [typeof tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                tab === t
                  ? "bg-[#1a1a2e] text-white shadow-sm"
                  : "bg-white text-[#777] border border-[#E8E8E8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      {/* List */}
      <div className="px-4 mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[100px] w-full rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={36} className="text-[#E0E0E0]" />}
            title={search ? "No payees found" : "No saved payees"}
            description={
              search
                ? "Try a different name or account number."
                : "Save a payee during a transfer to find them here next time."
            }
          />
        ) : (
          filtered.map((b) => (
            <BeneficiaryCard
              key={b.id}
              beneficiary={b}
              onDelete={() => setDeleteTarget(b)}
              onSend={() =>
                router.push(
                  `/transfer?tab=domestic&accNumber=${encodeURIComponent(b.accountNumber ?? "")}&bankCode=${encodeURIComponent(b.bankCode ?? "")}&name=${encodeURIComponent(b.name ?? "")}`
                )
              }
            />
          ))
        )}
      </div>

      {/* Delete sheet */}
      {deleteTarget && (
        <DeleteSheet
          beneficiary={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleted(deleteTarget.id)}
        />
      )}
    </div>
  );
}
