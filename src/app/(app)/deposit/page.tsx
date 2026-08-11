"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownToLine, Copy, CheckCircle2, Clock, XCircle,
  BadgeCheck, ChevronDown, RefreshCw, Building2, Bitcoin,
  AlertCircle,
} from "lucide-react";
import {
  accountsApi, depositsApi, ratesApi,
  type Account, type Deposit, type BankReceivingDetails,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";

// ── Coin configs ───────────────────────────────────────────────────────────────

interface CoinOption {
  coin: string;
  network: string;
  label: string;
  color: string;
  bg: string;
}

const COIN_OPTIONS: CoinOption[] = [
  { coin: "BTC",  network: "Bitcoin Network",    label: "Bitcoin (BTC)",       color: "#F7931A", bg: "#FEF3E2" },
  { coin: "ETH",  network: "Ethereum (ERC-20)",  label: "Ethereum (ETH)",      color: "#627EEA", bg: "#EEF1FD" },
  { coin: "USDT", network: "Ethereum (ERC-20)",  label: "Tether USDT (ERC-20)",color: "#26A17B", bg: "#E8F5F0" },
  { coin: "USDT", network: "TRON (TRC-20)",      label: "Tether USDT (TRC-20)",color: "#26A17B", bg: "#E8F5F0" },
  { coin: "BNB",  network: "BNB Chain (BEP-20)", label: "BNB (BEP-20)",        color: "#F3BA2F", bg: "#FEF8E1" },
  { coin: "SOL",  network: "Solana",             label: "Solana (SOL)",        color: "#9945FF", bg: "#F3ECFF" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const ACCOUNT_COLORS: Record<string, string> = {
  CURRENT: "#DB0011", SAVINGS: "#1a56db", BUSINESS: "#374151",
  ISA: "#059669", CREDIT: "#7c3aed",
};

function accountLabel(a: Account) {
  const map: Record<string, string> = {
    CURRENT: "Current Account", SAVINGS: "Savings Account",
    BUSINESS: "Business Account", ISA: "Cash ISA", CREDIT: "Credit Account",
  };
  return map[a.type] ?? a.type;
}

function StatusBadge({ status }: { status: Deposit["status"] }) {
  const cfg = {
    PENDING:   { icon: Clock,         label: "Pending",   cls: "bg-amber-50 text-amber-600 border-amber-200" },
    APPROVED:  { icon: BadgeCheck,    label: "Approved",  cls: "bg-blue-50 text-blue-600 border-blue-200" },
    REJECTED:  { icon: XCircle,       label: "Rejected",  cls: "bg-red-50 text-[#DB0011] border-red-200" },
    COMPLETED: { icon: CheckCircle2,  label: "Completed", cls: "bg-green-50 text-green-700 border-green-200" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="ml-1.5 text-[#DB0011] hover:text-[#b0000d] transition-colors">
      {copied ? <CheckCircle2 size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F0F0] last:border-0">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className="flex items-center text-[13px] font-semibold text-[#222222]">
        {value}
        <CopyButton text={value} />
      </span>
    </div>
  );
}

// ── Schemas ────────────────────────────────────────────────────────────────────

const bankSchema = z.object({
  accountId:  z.string().min(1, "Select an account"),
  amount:     z.string().min(1, "Enter amount").refine((v) => !isNaN(Number(v)) && Number(v) >= 10, "Minimum £10"),
  senderName: z.string().optional(),
  senderBank: z.string().optional(),
});

const cryptoSchema = z.object({
  accountId:  z.string().min(1, "Select an account"),
  coinIndex:  z.string().min(1, "Select a coin"),
  amountGbp:  z.string().min(1, "Enter amount").refine((v) => !isNaN(Number(v)) && Number(v) >= 10, "Minimum £10"),
});

type BankForm   = z.infer<typeof bankSchema>;
type CryptoForm = z.infer<typeof cryptoSchema>;

// ── Bank Transfer Tab ──────────────────────────────────────────────────────────

function BankTransferTab({ accounts }: { accounts: Account[] }) {
  const [bankDetails, setBankDetails] = useState<BankReceivingDetails | null>(null);
  const [depositRef, setDepositRef]   = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { accountId: accounts[0]?.id ?? "" },
  });

  async function onSubmit(data: BankForm) {
    setSubmitting(true);
    setError("");
    try {
      const res = await depositsApi.initiateBankTransfer({
        accountId:  data.accountId,
        amount:     Number(data.amount),
        senderName: data.senderName || undefined,
        senderBank: data.senderBank || undefined,
      });
      setBankDetails(res.data.data.bankDetails);
      setDepositRef(res.data.data.deposit.reference);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (bankDetails) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 size={18} strokeWidth={2} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-green-800">Deposit request submitted</p>
            <p className="text-[11px] text-green-700 mt-0.5">Transfer to the account below. Your deposit will be credited within 1–3 business days.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] px-4 py-1">
          <DetailRow label="Account Name"   value={bankDetails.accountName} />
          <DetailRow label="Sort Code"      value={bankDetails.sortCode} />
          <DetailRow label="Account Number" value={bankDetails.accountNumber} />
          <DetailRow label="IBAN"           value={bankDetails.iban} />
          <DetailRow label="Reference"      value={depositRef} />
        </div>

        <p className="text-[11px] text-[#999999] text-center">Always include the reference number when making your transfer.</p>

        <button
          onClick={() => { setBankDetails(null); setDepositRef(""); }}
          className="w-full text-[13px] text-[#DB0011] font-medium underline underline-offset-2"
        >
          Make another deposit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Account */}
      <div>
        <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
          Credit to account
        </label>
        <div className="relative">
          <select
            {...register("accountId")}
            className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-[13px] bg-white border border-[#E0E0E0] rounded-xl text-[#222222] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountLabel(a)} — {formatCurrency(Number(a.balance))}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
        </div>
        {errors.accountId && <p className="text-[11px] text-[#DB0011] mt-1">{errors.accountId.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
          Amount (GBP)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#AAAAAA]">£</span>
          <Input
            {...register("amount")}
            type="number"
            min="10"
            step="0.01"
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        {errors.amount && <p className="text-[11px] text-[#DB0011] mt-1">{errors.amount.message}</p>}
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
            Sender Name <span className="text-[#BBBBBB] normal-case font-normal">(optional)</span>
          </label>
          <Input {...register("senderName")} placeholder="Your name" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
            Sending Bank <span className="text-[#BBBBBB] normal-case font-normal">(optional)</span>
          </label>
          <Input {...register("senderBank")} placeholder="e.g. Barclays" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[#DB0011] text-[12px]">
          <AlertCircle size={14} strokeWidth={2} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "Get Bank Details"}
      </Button>
    </form>
  );
}

// ── Crypto Tab ─────────────────────────────────────────────────────────────────

function CryptoTab({ accounts }: { accounts: Account[] }) {
  const [walletInfo, setWalletInfo] = useState<{
    address: string; coin: string; network: string; coinAmount: string; amountGbp: number;
  } | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const [prices, setPrices]             = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    ratesApi.cryptoPrices()
      .then(res => setPrices(res.data.data ?? {}))
      .catch(() => {})
      .finally(() => setPricesLoading(false));
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CryptoForm>({
    resolver: zodResolver(cryptoSchema),
    defaultValues: { accountId: accounts[0]?.id ?? "", coinIndex: "0" },
  });

  const coinIndex    = Number(watch("coinIndex") ?? 0);
  const amountGbp    = watch("amountGbp");
  const selectedCoin = COIN_OPTIONS[coinIndex] ?? COIN_OPTIONS[0];
  const priceGbp     = prices[selectedCoin.coin] ?? 0;
  const coinEquiv    = amountGbp && !isNaN(Number(amountGbp)) && Number(amountGbp) > 0 && priceGbp > 0
    ? Number(amountGbp) / priceGbp
    : 0;

  async function onSubmit(data: CryptoForm) {
    setSubmitting(true);
    setError("");
    const coin = COIN_OPTIONS[Number(data.coinIndex)] ?? COIN_OPTIONS[0];
    try {
      const res = await depositsApi.initiateCrypto({
        accountId: data.accountId,
        coin:      coin.coin,
        amountGbp: Number(data.amountGbp),
        priceGbp:  prices[coin.coin] ?? 0,
      });
      setWalletInfo({
        address:   res.data.data.walletAddress,
        coin:      res.data.data.coin,
        network:   res.data.data.network,
        coinAmount: res.data.data.coinAmount,
        amountGbp: res.data.data.amountGbp,
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (walletInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 size={18} strokeWidth={2} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-green-800">Crypto deposit initiated</p>
            <p className="text-[11px] text-green-700 mt-0.5">Send exactly {walletInfo.coinAmount} {walletInfo.coin} to the wallet below.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] px-4 py-1">
          <DetailRow label="Coin"           value={walletInfo.coin} />
          <DetailRow label="Network"        value={walletInfo.network} />
          <DetailRow label="Amount to send" value={`${walletInfo.coinAmount} ${walletInfo.coin}`} />
          <DetailRow label="GBP value"      value={`£${walletInfo.amountGbp.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <DetailRow label="Wallet address" value={walletInfo.address} />
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
          Only send {walletInfo.coin} on the <strong>{walletInfo.network}</strong> network. Sending on the wrong network will result in permanent loss.
        </div>

        <button
          onClick={() => setWalletInfo(null)}
          className="w-full text-[13px] text-[#DB0011] font-medium underline underline-offset-2"
        >
          Make another deposit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Account */}
      <div>
        <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
          Credit to account
        </label>
        <div className="relative">
          <select
            {...register("accountId")}
            className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-[13px] bg-white border border-[#E0E0E0] rounded-xl text-[#222222] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountLabel(a)} — {formatCurrency(Number(a.balance))}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
        </div>
      </div>

      {/* Coin */}
      <div>
        <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
          Cryptocurrency
        </label>
        <div className="relative">
          <select
            {...register("coinIndex")}
            className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-[13px] bg-white border border-[#E0E0E0] rounded-xl text-[#222222] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
          >
            {COIN_OPTIONS.map((c, i) => (
              <option key={i} value={i}>{c.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
        </div>
        {errors.coinIndex && <p className="text-[11px] text-[#DB0011] mt-1">{errors.coinIndex.message}</p>}
      </div>

      {/* GBP Amount */}
      <div>
        <label className="block text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-1.5">
          Amount (GBP)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#AAAAAA]">£</span>
          <Input
            {...register("amountGbp")}
            type="number"
            min="10"
            step="0.01"
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        {pricesLoading ? (
          <p className="text-[11px] text-[#AAAAAA] mt-1">Loading live rates…</p>
        ) : priceGbp > 0 && coinEquiv > 0 ? (
          <p className="text-[11px] text-[#888888] mt-1">
            ≈ {coinEquiv.toFixed(8)} {selectedCoin.coin}
            <span className="ml-2 text-[#AAAAAA]">(1 {selectedCoin.coin} = £{priceGbp.toLocaleString("en-GB", { maximumFractionDigits: 2 })})</span>
          </p>
        ) : null}
        {errors.amountGbp && <p className="text-[11px] text-[#DB0011] mt-1">{errors.amountGbp.message}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[#DB0011] text-[12px]">
          <AlertCircle size={14} strokeWidth={2} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting || pricesLoading} className="w-full">
        {submitting ? "Submitting…" : "Get Wallet Address"}
      </Button>
    </form>
  );
}

// ── History ────────────────────────────────────────────────────────────────────

function DepositHistory({ deposits, loading }: { deposits: Deposit[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2 mt-6">
        {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }
  if (!deposits.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-[11px] font-bold text-[#BBBBBB] uppercase tracking-[0.18em] mb-3">Deposit History</h3>
      <div className="space-y-2">
        {deposits.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-[#E8E8E8] px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${d.method === "CRYPTO" ? "bg-orange-50" : "bg-blue-50"}`}>
                {d.method === "CRYPTO"
                  ? <Bitcoin size={15} strokeWidth={1.8} className="text-orange-500" />
                  : <Building2 size={15} strokeWidth={1.8} className="text-blue-600" />}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#222222] truncate">
                  {d.method === "CRYPTO" ? `${d.coin} Crypto` : "Bank Transfer"}
                </p>
                <p className="text-[11px] text-[#AAAAAA] truncate">
                  {new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[14px] font-bold text-[#222222]">
                £{Number(d.amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <StatusBadge status={d.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Tab = "bank" | "crypto";

export default function DepositPage() {
  const [tab, setTab]           = useState<Tab>("bank");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loadingAccts, setLoadingAccts] = useState(true);
  const [loadingDeps, setLoadingDeps]   = useState(true);

  useEffect(() => {
    accountsApi.list().then((r) => setAccounts(r.data.data)).finally(() => setLoadingAccts(false));
    depositsApi.list().then((r) => setDeposits(r.data.data)).finally(() => setLoadingDeps(false));
  }, []);

  const creditAccounts = accounts.filter((a) => a.type !== "CREDIT");

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 pt-10 pb-8 lg:pt-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDownToLine size={18} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-white leading-tight">Deposit Funds</h1>
              <p className="text-white/70 text-[12px]">Add money to your Lumina account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#E8E8E8]">
            {(["bank", "crypto"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-semibold transition-colors ${
                  tab === t
                    ? "text-[#DB0011] border-b-2 border-[#DB0011]"
                    : "text-[#AAAAAA] hover:text-[#666666]"
                }`}
              >
                {t === "bank"
                  ? <><Building2 size={14} strokeWidth={2} /> Bank Transfer</>
                  : <><Bitcoin size={14} strokeWidth={2} /> Crypto</>}
              </button>
            ))}
          </div>

          <div className="p-5">
            {loadingAccts ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-10 rounded-xl" />
                <SkeletonBlock className="h-10 rounded-xl" />
                <SkeletonBlock className="h-10 rounded-xl" />
              </div>
            ) : creditAccounts.length === 0 ? (
              <div className="text-center py-8 text-[#AAAAAA] text-[13px]">
                No accounts available. Please open an account first.
              </div>
            ) : tab === "bank" ? (
              <BankTransferTab accounts={creditAccounts} />
            ) : (
              <CryptoTab accounts={creditAccounts} />
            )}
          </div>
        </div>

        {/* History */}
        <DepositHistory deposits={deposits} loading={loadingDeps} />
      </div>
    </div>
  );
}
