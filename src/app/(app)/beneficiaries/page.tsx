"use client";

import { useEffect, useState } from "react";
import { beneficiariesApi, type Beneficiary } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import {
  Users, Trash2, PlusCircle, Globe, Building2,
  Search, X, Send, AlertCircle, Star, CheckCircle2,
  ChevronRight, RefreshCw,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

const UK_BANKS: Record<string, string> = {
  LMN:  "Lumina Bank",
  BARC: "Barclays",
  HSBC: "HSBC UK",
  LOYD: "Lloyds Bank",
  NWBK: "NatWest",
  SCBL: "Standard Chartered",
  MONZ: "Monzo",
  RVLT: "Revolut",
  STRL: "Starling Bank",
  SANT: "Santander UK",
};

const AVATAR_COLORS = ["#DB0011", "#1a56db", "#0e9f6e", "#7e3af2", "#e3a008", "#F7931A"];

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "?";
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const idx = Math.abs([...name].reduce((h, c) => h * 31 + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white"
      style={{ width: size, height: size, backgroundColor: AVATAR_COLORS[idx], fontSize: size * 0.33 }}>
      {getInitials(name)}
    </div>
  );
}

// ── Add payee sheet ────────────────────────────────────────────────────────────
function AddPayeeSheet({ onClose, onAdded }: { onClose: () => void; onAdded: (b: Beneficiary) => void }) {
  const { t } = useLanguage();
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("LMN");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{ accountName: string; bankName: string } | null>(null);
  const [nickname, setNickname] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    if (!accountNumber || !bankCode) return;
    setError(""); setVerifying(true); setVerified(null);
    try {
      const r = await beneficiariesApi.verify({ accountNumber, bankCode });
      const d = r.data.data;
      setVerified({ accountName: d.accountName, bankName: d.bankName });
      setNickname(d.accountName);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Account not found. Check the details and try again.");
    } finally { setVerifying(false); }
  }

  async function save() {
    if (!verified || !nickname) return;
    setError(""); setSaving(true);
    try {
      const r = await beneficiariesApi.create({
        nickname,
        accountName: verified.accountName,
        accountNumber,
        bankName: verified.bankName,
        bankCode,
        country: "GB",
        currency: "GBP",
        isFavorite,
      });
      onAdded(r.data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not save payee.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-bold text-[#333]">{t("beneficiaries.addNew")}</h2>
          <button onClick={onClose} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("beneficiaries.sortCode")}</label>
            <select
              value={bankCode}
              onChange={(e) => { setBankCode(e.target.value); setVerified(null); }}
              className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
            >
              {Object.entries(UK_BANKS).map(([code, name]) => (
                <option key={code} value={code}>{code} - {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("beneficiaries.accountNumber")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "")); setVerified(null); }}
                placeholder="12345678"
                maxLength={12}
                className="flex-1 px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011] font-mono"
              />
              <button
                onClick={verify}
                disabled={verifying || accountNumber.length < 6}
                className="px-4 py-2.5 bg-[#DB0011] text-white text-sm font-bold rounded-xl hover:bg-[#b8000e] disabled:opacity-50 transition-colors"
              >
                {verifying ? <RefreshCw size={14} className="animate-spin" /> : t("beneficiaries.verify")}
              </button>
            </div>
          </div>

          {verified && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">{verified.accountName}</p>
                <p className="text-xs text-green-700">{verified.bankName}</p>
              </div>
            </div>
          )}

          {verified && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{t("beneficiaries.nickname")}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Mum, Landlord"
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                />
              </div>
              <button
                onClick={() => setIsFavorite((p) => !p)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isFavorite ? "text-amber-500" : "text-[#AAAAAA]"}`}
              >
                <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? t("beneficiaries.addedFavourite") : t("beneficiaries.addFavourite")}
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-[#DB0011]">{error}</p>
            </div>
          )}

          {verified && (
            <button
              onClick={save}
              disabled={saving || !nickname}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b8000e] disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : t("beneficiaries.addPayee")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Beneficiary card ───────────────────────────────────────────────────────────
function BeneficiaryCard({
  beneficiary, onDelete, onSend, onToggleFav,
}: {
  beneficiary: Beneficiary;
  onDelete: () => void;
  onSend: () => void;
  onToggleFav: () => void;
}) {
  const { t } = useLanguage();
  const acct = beneficiary.accountNumber ?? "";
  const isIntl = beneficiary.country !== "GB";

  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3.5 px-4 py-4">
        <Avatar name={beneficiary.nickname} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-[#222] truncate">{beneficiary.nickname}</p>
            {beneficiary.isFavorite && <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
            {isIntl ? <Globe size={12} className="text-blue-500 flex-shrink-0" /> : <Building2 size={12} className="text-[#AAAAAA] flex-shrink-0" />}
          </div>
          <p className="text-xs text-[#999] mt-0.5 truncate">{beneficiary.accountName} · {beneficiary.bankName}</p>
          <p className="text-xs text-[#BBBBBB] font-mono mt-0.5">
            {acct.length > 4 ? `••••${acct.slice(-4)}` : acct} · {beneficiary.bankCode}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onToggleFav} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors">
            <Star size={14} className={beneficiary.isFavorite ? "text-amber-400 fill-amber-400" : "text-[#CCCCCC]"} />
          </button>
          <button onClick={onSend} className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#DB0011] hover:bg-[#b0000d] transition-colors">
            <Send size={13} className="text-white" />
          </button>
          <button onClick={onDelete} className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors">
            <Trash2 size={13} className="text-[#AAAAAA]" />
          </button>
        </div>
      </div>
      <div className={`px-4 py-2 ${isIntl ? "bg-blue-50" : "bg-[#FAFAFA]"} border-t border-[#F5F5F5] flex items-center gap-1.5`}>
        {isIntl ? <Globe size={11} className="text-blue-500" /> : <Building2 size={11} className="text-[#BBBBBB]" />}
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isIntl ? "text-blue-500" : "text-[#BBBBBB]"}`}>
          {isIntl ? t("beneficiaries.international") : t("beneficiaries.ukDomestic")}
        </span>
        <span className="text-[#DDD] text-[10px]">·</span>
        <span className="text-[10px] text-[#CCCCCC] font-mono">{beneficiary.bankCode}</span>
        <ChevronRight size={10} className="text-[#DDDDDD] ml-auto" />
      </div>
    </div>
  );
}

// ── Delete confirm sheet ────────────────────────────────────────────────────────
function DeleteSheet({ beneficiary, onCancel, onConfirm }: { beneficiary: Beneficiary; onCancel: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function doDelete() {
    setLoading(true); setErr("");
    try {
      await beneficiariesApi.delete(beneficiary.id);
      onConfirm();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErr(msg || "Could not remove payee.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl px-5 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} className="text-[#DB0011]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#333]">Remove payee?</p>
            <p className="text-xs text-[#777]">{beneficiary.nickname} · {beneficiary.bankName}</p>
          </div>
        </div>
        <p className="text-xs text-[#999] mb-5 leading-relaxed">
          This payee will be removed from your saved list. You can still send money by entering their details manually.
        </p>
        {err && <p className="text-xs text-[#DB0011] bg-red-50 rounded-lg px-3 py-2 mb-3">{err}</p>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555]">Cancel</button>
          <button onClick={doDelete} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#DB0011] text-white text-sm font-semibold disabled:opacity-60">
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───���────────────────────────────────��──────────────────────────────────
export default function BeneficiariesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "favourites">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);

  function load() {
    setLoading(true);
    beneficiariesApi.list()
      .then((r) => setBeneficiaries(r.data.data ?? []))
      .catch(() => setError("Could not load saved payees."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggleFav(b: Beneficiary) {
    try {
      const updated = await beneficiariesApi.update(b.id, { isFavorite: !b.isFavorite });
      setBeneficiaries((prev) => prev.map((x) => x.id === b.id ? updated.data.data : x));
    } catch {}
  }

  const filtered = beneficiaries.filter((b) => {
    const matchTab = tab === "all" || (tab === "favourites" && b.isFavorite);
    const q = search.toLowerCase();
    return matchTab && (!q ||
      b.nickname.toLowerCase().includes(q) ||
      b.accountName.toLowerCase().includes(q) ||
      b.bankName.toLowerCase().includes(q) ||
      b.accountNumber.includes(q)
    );
  });

  const favourites = beneficiaries.filter((b) => b.isFavorite);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("beneficiaries.title")}</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <PlusCircle size={13} />
            {t("beneficiaries.addPayee")}
          </button>
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold">{beneficiaries.length}</p>
              <p className="text-white/40 text-xs">{t("beneficiaries.total")}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold">{favourites.length}</p>
              <p className="text-white/40 text-xs">{t("beneficiaries.favourites")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search + tabs */}
      <div className="mx-4 -mt-8 space-y-3 relative z-10">
        <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] px-4 h-12">
          <Search size={15} className="text-[#AAAAAA] flex-shrink-0" />
          <input
            type="text"
            placeholder={t("beneficiaries.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#333] outline-none placeholder:text-[#BBBBBB] bg-transparent"
          />
          {search && <button onClick={() => setSearch("")} className="text-[#BBBBBB]"><X size={14} /></button>}
        </div>
        <div className="flex gap-2">
          {([["all", `${t("beneficiaries.all")} (${beneficiaries.length})`], ["favourites", `${t("beneficiaries.favourites")} (${favourites.length})`]] as [typeof tab, string][]).map(([tabKey, label]) => (
            <button key={tabKey} onClick={() => setTab(tabKey as typeof tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${tab === tabKey ? "bg-[#1a1a2e] text-white shadow-sm" : "bg-white text-[#777] border border-[#E8E8E8]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-[100px] w-full rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={36} className="text-[#E0E0E0]" />}
            title={t("beneficiaries.none")}
            description={t("beneficiaries.search")}
          />
        ) : (
          filtered.map((b) => (
            <BeneficiaryCard
              key={b.id}
              beneficiary={b}
              onToggleFav={() => toggleFav(b)}
              onDelete={() => setDeleteTarget(b)}
              onSend={() => router.push(`/transfer?tab=domestic&accNumber=${encodeURIComponent(b.accountNumber)}&bankCode=${encodeURIComponent(b.bankCode)}&name=${encodeURIComponent(b.nickname)}`)}
            />
          ))
        )}
      </div>

      {showAdd && (
        <AddPayeeSheet
          onClose={() => setShowAdd(false)}
          onAdded={(b) => { setBeneficiaries((p) => [b, ...p]); setShowAdd(false); }}
        />
      )}
      {deleteTarget && (
        <DeleteSheet
          beneficiary={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { setBeneficiaries((p) => p.filter((x) => x.id !== deleteTarget.id)); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
