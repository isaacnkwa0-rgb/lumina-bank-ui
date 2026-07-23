"use client";

import { useEffect, useState, useRef, forwardRef, Suspense, type ReactNode, type SelectHTMLAttributes } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, Clock, ChevronDown, ArrowDownUp,
  RefreshCw, Send, Globe, ShieldCheck, KeyRound,
} from "lucide-react";
import {
  accountsApi, transfersApi, beneficiariesApi, authApi,
  type Account, type Beneficiary, type Transfer, type FxQuote,
} from "@/lib/api";
import { Loader2, BadgeCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n";

type Tab = "own" | "domestic" | "international";

const UK_BANKS = [
  { code: "BARC", name: "Barclays" },
  { code: "HSBC", name: "HSBC UK" },
  { code: "LOYD", name: "Lloyds Bank" },
  { code: "NWBK", name: "NatWest" },
  { code: "SCBL", name: "Standard Chartered" },
  { code: "MONZ", name: "Monzo" },
  { code: "RVLT", name: "Revolut" },
  { code: "STRL", name: "Starling Bank" },
  { code: "SANT", name: "Santander UK" },
  { code: "LMN", name: "Lumina Bank" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY", "AED", "CAD", "AUD", "NGN", "SGD"];
const COUNTRIES = [
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" },
  { code: "US", name: "United States" }, { code: "NG", name: "Nigeria" },
  { code: "AE", name: "UAE" }, { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" }, { code: "CH", name: "Switzerland" },
  { code: "IN", name: "India" }, { code: "ZA", name: "South Africa" },
];

const ACCOUNT_COLORS: Record<string, string> = {
  CURRENT: "#DB0011",
  SAVINGS: "#1a56db",
  BUSINESS: "#374151",
  ISA: "#059669",
  CREDIT: "#7c3aed",
};

const amountString = z
  .string()
  .min(1, "Enter an amount")
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid amount");

const ownSchema = z.object({
  fromAccountId: z.string().min(1, "Select a source account"),
  toAccountId: z.string().min(1, "Select a destination account"),
  amount: amountString,
  description: z.string().min(1, "Enter a reference"),
});

const domesticSchema = z.object({
  fromAccountId: z.string().min(1, "Select a source account"),
  toAccountNumber: z.string().min(6, "Enter account number"),
  toBankCode: z.string().min(2, "Select a bank"),
  toAccountName: z.string().min(2, "Enter recipient name"),
  amount: amountString,
  description: z.string().min(1, "Enter a reference"),
  saveBeneficiary: z.boolean().optional(),
});

const internationalSchema = z.object({
  fromAccountId: z.string().min(1, "Select a source account"),
  toIban: z.string().min(10, "Enter a valid IBAN"),
  swiftCode: z.string().min(8, "Enter a valid SWIFT/BIC"),
  toBankName: z.string().min(2, "Enter bank name"),
  toAccountName: z.string().min(2, "Enter recipient name"),
  toCountry: z.string().length(2, "Select a country"),
  toCurrency: z.string().min(3, "Select a currency"),
  amount: amountString,
  description: z.string().min(1, "Enter a reference"),
});

type OwnForm = z.infer<typeof ownSchema>;
type DomesticFormValues = z.infer<typeof domesticSchema>;
type InternationalFormValues = z.infer<typeof internationalSchema>;

// ── Shared sub-components ───────────────────────────────────────────────────

function AccountCardPicker({
  accounts,
  selectedId,
  registerProps,
  error,
  placeholder = "Choose account",
}: {
  accounts: Account[];
  selectedId: string;
  registerProps: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
}) {
  const selected = accounts.find((a) => a.id === selectedId);
  const color = selected ? (ACCOUNT_COLORS[selected.type] ?? "#DB0011") : "#E3E3E3";

  return (
    <div>
      <div className="relative">
        <div
          className={`flex items-center gap-3 bg-white border rounded-sm px-4 py-3.5 transition-colors ${
            error ? "border-[#DB0011]" : "border-[#E3E3E3]"
          }`}
        >
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0 min-h-[2rem]"
            style={{ backgroundColor: color }}
          />
          {selected ? (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#333333]">
                {selected.type.charAt(0) + selected.type.slice(1).toLowerCase()} Account
              </p>
              <p className="text-xs text-[#767676] mt-0.5">
                ••{selected.accountNumber.slice(-4)}
                <span className="mx-1.5 opacity-50">·</span>
                <span className="font-medium text-[#333333]">
                  {formatCurrency(Number(selected.balance), selected.currency)} available
                </span>
              </p>
            </div>
          ) : (
            <p className="flex-1 text-sm text-[#767676]">{placeholder}</p>
          )}
          <ChevronDown size={16} className="text-[#767676] flex-shrink-0" />
        </div>
        <select
          {...registerProps}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.type} · {formatCurrency(Number(a.balance), a.currency)} (••{a.accountNumber.slice(-4)})
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1.5 text-xs text-[#DB0011]">{error}</p>}
    </div>
  );
}

function BigAmountInput({
  registerProps,
  error,
}: {
  registerProps: UseFormRegisterReturn;
  error?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm px-5 py-5">
      <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide text-center mb-4">
        {t("transfer.amount")}
      </p>
      <div
        className={`flex items-baseline justify-center gap-1.5 pb-3 border-b-2 mx-6 ${
          error ? "border-[#DB0011]" : "border-[#E3E3E3]"
        }`}
      >
        <span className="text-2xl font-light text-[#AAAAAA]">£</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...registerProps}
          className="text-4xl font-bold text-[#333333] bg-transparent outline-none w-44 text-center placeholder-[#D8D8D8] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      {error && (
        <p className="text-xs text-[#DB0011] text-center mt-2">{error}</p>
      )}
    </div>
  );
}

function TransferArrow() {
  return (
    <div className="flex justify-center my-0.5">
      <div className="h-8 w-8 rounded-full bg-white border border-[#E3E3E3] shadow-sm flex items-center justify-center">
        <ArrowDownUp size={14} className="text-[#767676]" />
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E3E3E3]">
          <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide">{title}</p>
        </div>
      )}
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function FeeNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-[#F8F8F8] border border-[#E3E3E3] rounded-sm px-3 py-2.5">
      <span className="text-[#767676] mt-0.5 flex-shrink-0">ℹ</span>
      <p className="text-xs text-[#767676]">{children}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function TransferPage() {
  return (
    <Suspense>
      <TransferPageInner />
    </Suspense>
  );
}

function TransferPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const prefillAccNumber = searchParams.get("accNumber") ?? "";
  const prefillBankCode  = searchParams.get("bankCode")  ?? "";
  const prefillName      = searchParams.get("name")      ?? "";
  const queryTab         = searchParams.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>(queryTab === "domestic" ? "domestic" : "own");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [result, setResult] = useState<Transfer | null>(null);
  const [fxQuote, setFxQuote] = useState<FxQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    accountsApi.list().then((r) => setAccounts(r.data.data)).catch(() => {});
    beneficiariesApi.list().then((r) => setBeneficiaries(r.data.data)).catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string; icon: ReactNode }[] = [
    { key: "own",           label: t("transfer.own"),           icon: <ArrowDownUp size={13} /> },
    { key: "domestic",      label: t("transfer.uk"),            icon: <Send size={13} /> },
    { key: "international", label: t("transfer.international"), icon: <Globe size={13} /> },
  ];

  if (result) {
    return (
      <SuccessScreen result={result} onReset={() => { setResult(null); setError(""); }} />
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3] px-4 py-4">
        <h1 className="text-lg font-semibold text-[#333333]">{t("transfer.title")}</h1>
        <p className="text-xs text-[#767676] mt-0.5">{t("transfer.subtitle")}</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#E3E3E3] flex">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setError(""); setFxQuote(null); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wide border-b-2 transition-colors ${
              tab === key
                ? "border-[#DB0011] text-[#DB0011]"
                : "border-transparent text-[#767676] hover:text-[#333333]"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="px-4 py-5 space-y-3">
        {error && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}

        {tab === "own" && (
          <OwnAccountsForm accounts={accounts} onSuccess={setResult} onError={setError} />
        )}
        {tab === "domestic" && (
          <DomesticForm
            accounts={accounts}
            beneficiaries={beneficiaries}
            prefillAccNumber={prefillAccNumber}
            prefillBankCode={prefillBankCode}
            prefillName={prefillName}
            onSuccess={setResult}
            onError={setError}
          />
        )}
        {tab === "international" && (
          <InternationalForm
            accounts={accounts}
            fxQuote={fxQuote}
            setFxQuote={setFxQuote}
            loadingQuote={loadingQuote}
            setLoadingQuote={setLoadingQuote}
            onSuccess={setResult}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
}

// ── OTP Modal ────────────────────────────────────────────────────────────────

function OtpModal({ maskedEmail, onConfirm, onCancel, isLoading }: {
  maskedEmail: string;
  onConfirm: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <ShieldCheck size={22} className="text-[#DB0011]" />
        </div>
        <h3 className="text-base font-bold text-[#333] text-center mb-1">Security verification</h3>
        <p className="text-xs text-[#767676] text-center mb-5 leading-relaxed">
          Enter the 6-digit code sent to<br />
          <span className="font-semibold text-[#333]">{maskedEmail}</span>
        </p>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          autoFocus
          className="w-full text-center text-2xl font-bold tracking-[0.3em] border border-[#E0E0E0] rounded-xl px-4 py-3 outline-none focus:border-[#DB0011] mb-4"
        />
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-sm font-semibold text-[#767676]">
            Cancel
          </button>
          <button type="button" onClick={() => code.length === 6 && onConfirm(code)}
            disabled={code.length !== 6 || isLoading}
            className="flex-1 py-3 rounded-xl bg-[#DB0011] text-white text-sm font-bold disabled:opacity-50">
            {isLoading ? "Verifying…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Own Accounts Form ────────────────────────────────────────────────────────

function OwnAccountsForm({
  accounts,
  onSuccess,
  onError,
}: {
  accounts: Account[];
  onSuccess: (r: Transfer) => void;
  onError: (e: string) => void;
}) {
  const { t } = useLanguage();
  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<OwnForm>({ resolver: zodResolver(ownSchema) });

  const fromAccountId = watch("fromAccountId") ?? "";
  const toAccountId = watch("toAccountId") ?? "";
  const [otpStep, setOtpStep] = useState<{ formData: OwnForm; maskedEmail: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  async function onSubmit(data: OwnForm) {
    onError("");
    try {
      const r = await authApi.requestTransferOtp();
      setOtpStep({ formData: data, maskedEmail: r.data.data.maskedEmail });
    } catch (err: unknown) {
      onError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to send OTP. Try again.");
    }
  }

  async function executeTransfer(otp: string) {
    if (!otpStep) return;
    setOtpLoading(true);
    try {
      const res = await transfersApi.internal({ ...otpStep.formData, amount: Number(otpStep.formData.amount), transferOtp: otp });
      setOtpStep(null);
      onSuccess(res.data.data);
    } catch (err: unknown) {
      setOtpStep(null);
      onError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Transfer failed.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <>
    {otpStep && (
      <OtpModal maskedEmail={otpStep.maskedEmail} onConfirm={executeTransfer} onCancel={() => setOtpStep(null)} isLoading={otpLoading} />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          {t("transfer.from")}
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder={t("transfer.chooseSource")}
        />
      </div>

      <TransferArrow />

      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          {t("transfer.to")}
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={toAccountId}
          registerProps={register("toAccountId")}
          error={errors.toAccountId?.message}
          placeholder={t("transfer.chooseDest")}
        />
      </div>

      <BigAmountInput registerProps={register("amount")} error={errors.amount?.message} />

      <div className="bg-white border border-[#E3E3E3] rounded-sm px-4 py-3.5">
        <Input
          label={t("transfer.reference")}
          type="text"
          placeholder={t("transfer.referencePlaceholder")}
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        {t("transfer.transferNow")}
      </Button>
    </form>
    </>
  );
}

// ── Domestic Form ────────────────────────────────────────────────────────────

type VerifyState = "idle" | "loading" | "found" | "not-found";

const CONFIRM_THRESHOLD = 500;

function DomesticForm({
  accounts,
  beneficiaries,
  prefillAccNumber = "",
  prefillBankCode  = "",
  prefillName      = "",
  onSuccess,
  onError,
}: {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  prefillAccNumber?: string;
  prefillBankCode?: string;
  prefillName?: string;
  onSuccess: (r: Transfer) => void;
  onError: (e: string) => void;
}) {
  const { t } = useLanguage();
  const [useManual, setUseManual] = useState(beneficiaries.length === 0 || !!prefillAccNumber);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifiedName, setVerifiedName] = useState("");
  const [pendingData, setPendingData] = useState<DomesticFormValues | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [otpStep, setOtpStep] = useState<{ formData: DomesticFormValues; maskedEmail: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<DomesticFormValues>({ resolver: zodResolver(domesticSchema) });

  const fromAccountId = watch("fromAccountId") ?? "";
  const toBankCode = watch("toBankCode") ?? "";
  const toAccountNumber = watch("toAccountNumber") ?? "";

  // Pre-fill from beneficiary query params
  useEffect(() => {
    if (!prefillAccNumber) return;
    setValue("toAccountNumber", prefillAccNumber, { shouldValidate: false });
    if (prefillBankCode) setValue("toBankCode", prefillBankCode, { shouldValidate: false });
    if (prefillName)     setValue("toAccountName", prefillName, { shouldValidate: false });
    setUseManual(true);
  }, [prefillAccNumber, prefillBankCode, prefillName, setValue]);

  // Auto-lookup account name when bank + account number are both filled
  useEffect(() => {
    if (!useManual) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only auto-verify Lumina accounts — external banks require manual name entry
    if (!toBankCode || toAccountNumber.length < 6 || toBankCode !== "LMN") {
      setVerifyState("idle");
      setVerifiedName("");
      setValue("toAccountName", "", { shouldValidate: false });
      return;
    }

    setVerifyState("loading");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await beneficiariesApi.verify({ accountNumber: toAccountNumber, bankCode: toBankCode });
        const name = res.data.data.accountName;
        setVerifiedName(name);
        setValue("toAccountName", name, { shouldValidate: true });
        setVerifyState("found");
      } catch {
        setVerifiedName("");
        setValue("toAccountName", "", { shouldValidate: false });
        setVerifyState("not-found");
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [toBankCode, toAccountNumber, useManual, setValue]);

  function pickBeneficiary(b: Beneficiary) {
    setSelectedBeneficiary(b);
    setValue("toAccountNumber", b.accountNumber);
    setValue("toAccountName", b.accountName);
    if (b.bankCode) setValue("toBankCode", b.bankCode);
    setUseManual(false);
  }

  async function onSubmit(data: DomesticFormValues) {
    onError("");
    if (Number(data.amount) >= CONFIRM_THRESHOLD) {
      setPendingData(data);
      return;
    }
    await requestOtp(data);
  }

  async function requestOtp(data: DomesticFormValues) {
    setPendingData(null);
    setIsConfirming(true);
    try {
      const r = await authApi.requestTransferOtp();
      setOtpStep({ formData: data, maskedEmail: r.data.data.maskedEmail });
    } catch (err: unknown) {
      onError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to send OTP. Try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function executeTransfer(otp: string) {
    if (!otpStep) return;
    setOtpLoading(true);
    try {
      const res = await transfersApi.domestic({ ...otpStep.formData, amount: Number(otpStep.formData.amount), transferOtp: otp });
      setOtpStep(null);
      onSuccess(res.data.data);
    } catch (err: unknown) {
      setOtpStep(null);
      onError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Transfer failed.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <>
    {otpStep && (
      <OtpModal maskedEmail={otpStep.maskedEmail} onConfirm={executeTransfer} onCancel={() => setOtpStep(null)} isLoading={otpLoading} />
    )}
    {pendingData && (
      <ConfirmModal
        amount={Number(pendingData.amount)}
        currency="GBP"
        recipient={pendingData.toAccountName}
        onConfirm={() => requestOtp(pendingData)}
        onCancel={() => setPendingData(null)}
        isLoading={isConfirming}
      />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          {t("transfer.from")}
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder={t("transfer.chooseSource")}
        />
      </div>

      <TransferArrow />

      {/* Recipient section */}
      <SectionCard title={t("transfer.sendTo")}>
        {beneficiaries.length > 0 && (
          <div>
            <div className="flex border border-[#E3E3E3] rounded-sm overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => { setUseManual(false); }}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  !useManual
                    ? "bg-[#DB0011] text-white"
                    : "bg-white text-[#767676] hover:text-[#333333]"
                }`}
              >
                {t("transfer.savedPayees")}
              </button>
              <button
                type="button"
                onClick={() => { setUseManual(true); setSelectedBeneficiary(null); }}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  useManual
                    ? "bg-[#DB0011] text-white"
                    : "bg-white text-[#767676] hover:text-[#333333]"
                }`}
              >
                {t("transfer.newPayee")}
              </button>
            </div>

            {!useManual && (
              <div className="space-y-2">
                {beneficiaries.map((b) => {
                  const initials = b.nickname || b.accountName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => pickBeneficiary(b)}
                      className={`w-full flex items-center gap-3 px-3 py-3 border rounded-sm text-left transition-all ${
                        selectedBeneficiary?.id === b.id
                          ? "border-[#DB0011] bg-red-50"
                          : "border-[#E3E3E3] hover:border-[#BBBBBB]"
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-[#F8F8F8] border border-[#E3E3E3] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#767676]">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#333333] truncate">{b.nickname || b.accountName}</p>
                        <p className="text-xs text-[#767676]">
                          {b.bankName} · ••{b.accountNumber.slice(-4)}
                        </p>
                      </div>
                      {selectedBeneficiary?.id === b.id && (
                        <div className="h-4 w-4 rounded-full bg-[#DB0011] flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(useManual || beneficiaries.length === 0) && (
          <div className="space-y-4">
            <Input
              label="Account number"
              type="text"
              placeholder="e.g. 12345678"
              error={errors.toAccountNumber?.message}
              {...register("toAccountNumber")}
            />
            <SelectField
              label="Bank"
              error={errors.toBankCode?.message}
              {...register("toBankCode")}
            >
              <option value="">{t("transfer.selectBank")}</option>
              {UK_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </SelectField>

            {/* Account name — auto-populated via verify API */}
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                {t("transfer.accountName")}
              </label>

              {verifyState === "loading" && (
                <div className="flex items-center gap-2 py-2.5 border-b-2 border-[#E3E3E3] text-sm text-[#767676]">
                  <Loader2 size={14} className="animate-spin flex-shrink-0" />
                  {t("transfer.verifying")}
                </div>
              )}

              {verifyState === "found" && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 py-2.5 border-b-2 border-green-500">
                    <BadgeCheck size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-[#333333] flex-1">{verifiedName}</span>
                    <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide bg-green-50 px-1.5 py-0.5 rounded-sm">
                      {t("transfer.verified")}
                    </span>
                  </div>
                  <input type="hidden" {...register("toAccountName")} />
                </div>
              )}

              {verifyState === "not-found" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-2 text-sm text-amber-600">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {t("transfer.notFound")}
                  </div>
                  <Input
                    type="text"
                    placeholder={t("transfer.fullName")}
                    error={errors.toAccountName?.message}
                    {...register("toAccountName")}
                  />
                </div>
              )}

              {verifyState === "idle" && (
                <Input
                  type="text"
                  placeholder={toBankCode === "LMN" ? "Enter account number to auto-verify" : t("transfer.enterName")}
                  error={errors.toAccountName?.message}
                  {...register("toAccountName")}
                />
              )}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register("saveBeneficiary")}
                className="h-4 w-4 rounded border-[#E3E3E3] text-[#DB0011] accent-[#DB0011]"
              />
              <span className="text-xs text-[#767676]">{t("transfer.savePayee")}</span>
            </label>
          </div>
        )}

        {!useManual && selectedBeneficiary && (
          <>
            <input type="hidden" {...register("toAccountNumber")} />
            <input type="hidden" {...register("toBankCode")} />
            <input type="hidden" {...register("toAccountName")} />
          </>
        )}
      </SectionCard>

      <BigAmountInput registerProps={register("amount")} error={errors.amount?.message} />

      <div className="bg-white border border-[#E3E3E3] rounded-sm px-4 py-3.5">
        <Input
          label={t("transfer.reference")}
          type="text"
          placeholder="e.g. Rent July"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <FeeNotice>{t("transfer.ukFee")}</FeeNotice>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        {t("transfer.send")}
      </Button>
    </form>
    </>
  );
}

// ── International Form ───────────────────────────────────────────────────────

function InternationalForm({
  accounts,
  fxQuote,
  setFxQuote,
  loadingQuote,
  setLoadingQuote,
  onSuccess,
  onError,
}: {
  accounts: Account[];
  fxQuote: FxQuote | null;
  setFxQuote: (q: FxQuote | null) => void;
  loadingQuote: boolean;
  setLoadingQuote: (b: boolean) => void;
  onSuccess: (r: Transfer) => void;
  onError: (e: string) => void;
}) {
  const { t } = useLanguage();
  const [pendingData, setPendingData] = useState<InternationalFormValues | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [otpStep, setOtpStep] = useState<{ formData: InternationalFormValues; maskedEmail: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<InternationalFormValues>({ resolver: zodResolver(internationalSchema) });

  const fromAccountId = watch("fromAccountId") ?? "";
  const toCurrency = watch("toCurrency");
  const amount = watch("amount");

  async function getQuote() {
    if (!toCurrency || !amount || isNaN(Number(amount))) return;
    setLoadingQuote(true);
    setFxQuote(null);
    try {
      const res = await transfersApi.quote({
        fromCurrency: "GBP",
        toCurrency,
        amount: Number(amount),
      });
      setFxQuote(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingQuote(false);
    }
  }

  async function onSubmit(data: InternationalFormValues) {
    onError("");
    if (Number(data.amount) >= CONFIRM_THRESHOLD) {
      setPendingData(data);
      return;
    }
    await requestOtp(data);
  }

  async function requestOtp(data: InternationalFormValues) {
    setPendingData(null);
    setIsConfirming(true);
    try {
      const r = await authApi.requestTransferOtp();
      setOtpStep({ formData: data, maskedEmail: r.data.data.maskedEmail });
    } catch (err: unknown) {
      onError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to send OTP. Try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function executeTransfer(otp: string) {
    if (!otpStep) return;
    setOtpLoading(true);
    try {
      const res = await transfersApi.international({ ...otpStep.formData, amount: Number(otpStep.formData.amount), transferOtp: otp });
      setOtpStep(null);
      onSuccess(res.data.data);
    } catch (err: unknown) {
      setOtpStep(null);
      onError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Transfer failed.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <>
    {otpStep && (
      <OtpModal maskedEmail={otpStep.maskedEmail} onConfirm={executeTransfer} onCancel={() => setOtpStep(null)} isLoading={otpLoading} />
    )}
    {pendingData && (
      <ConfirmModal
        amount={Number(pendingData.amount)}
        currency="GBP"
        recipient={pendingData.toAccountName}
        onConfirm={() => requestOtp(pendingData)}
        onCancel={() => setPendingData(null)}
        isLoading={isConfirming}
      />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          {t("transfer.from")}
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder={t("transfer.chooseSource")}
        />
      </div>

      <TransferArrow />

      <SectionCard title={t("transfer.recipientDetails")}>
        <Input
          label="Recipient name"
          type="text"
          placeholder={t("transfer.fullName")}
          error={errors.toAccountName?.message}
          {...register("toAccountName")}
        />
        <Input
          label={t("transfer.bankName")}
          type="text"
          placeholder={t("transfer.bankNamePlaceholder")}
          error={errors.toBankName?.message}
          {...register("toBankName")}
        />
        <Input
          label="IBAN"
          type="text"
          placeholder="e.g. FR76 3000 6000 0112 3456 7890 189"
          error={errors.toIban?.message}
          {...register("toIban")}
        />
        <Input
          label={t("transfer.swift")}
          type="text"
          placeholder={t("transfer.swiftPlaceholder")}
          error={errors.swiftCode?.message}
          {...register("swiftCode")}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={t("transfer.country")}
            error={errors.toCountry?.message}
            {...register("toCountry")}
          >
            <option value="">{t("transfer.country")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </SelectField>
          <SelectField
            label={t("transfer.currency")}
            error={errors.toCurrency?.message}
            {...register("toCurrency")}
          >
            <option value="">{t("transfer.currency")}</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectField>
        </div>
      </SectionCard>

      <BigAmountInput registerProps={register("amount")} error={errors.amount?.message} />

      {/* FX quote button */}
      {toCurrency && toCurrency !== "GBP" && (
        <button
          type="button"
          onClick={getQuote}
          disabled={loadingQuote || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#DB0011] rounded-sm text-sm font-medium text-[#DB0011] hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={14} className={loadingQuote ? "animate-spin" : ""} />
          {loadingQuote ? t("transfer.gettingRate") : fxQuote ? t("transfer.refreshRate") : t("transfer.getRate")}
        </button>
      )}

      {/* FX quote box */}
      {fxQuote && (
        <div className="bg-white border border-[#E3E3E3] rounded-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E3E3E3]">
            <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide">
              {t("transfer.rateBreakdown")}
            </p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {[
              { id: "rate",           label: "Rate",                         value: `1 GBP = ${fxQuote.rate.toFixed(4)} ${fxQuote.toCurrency}` },
              { id: "you-send",       label: "You send",                     value: formatCurrency(Number(amount), "GBP") },
              { id: "recipient-gets", label: t("transfer.recipientGets"),    value: `${fxQuote.convertedAmount.toFixed(2)} ${fxQuote.toCurrency}` },
              { id: "fees",           label: "Fees",                         value: formatCurrency(fxQuote.fee, "GBP") },
            ].map(({ id, label, value }) => (
              <div key={id} className="flex justify-between items-center">
                <span className="text-xs text-[#767676]">{label}</span>
                <span className={`text-sm font-semibold ${id === "recipient-gets" ? "text-green-600" : "text-[#333333]"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E3E3E3] rounded-sm px-4 py-3.5">
        <Input
          label={t("transfer.reference")}
          type="text"
          placeholder="Optional, e.g. Invoice #1234"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <FeeNotice>{t("transfer.intlFee")}</FeeNotice>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        {fxQuote ? t("transfer.confirm") : t("transfer.sendTransfer")}
      </Button>
    </form>
    </>
  );
}

// ── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ result, onReset }: { result: Transfer; onReset: () => void }) {
  const { t } = useLanguage();
  const isPending = result.status === "PENDING";

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Status banner */}
      <div
        className={`px-4 py-10 flex flex-col items-center text-center ${
          isPending ? "bg-amber-50" : "bg-green-50"
        }`}
      >
        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
            isPending ? "bg-amber-100" : "bg-green-100"
          }`}
        >
          {isPending ? (
            <Clock size={32} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={32} className="text-green-500" />
          )}
        </div>
        <h2 className="text-xl font-bold text-[#333333] mb-1">
          {isPending ? t("transfer.submitted") : t("transfer.complete")}
        </h2>
        <p className="text-sm text-[#767676] max-w-xs">
          {isPending
            ? t("transfer.submittedDesc")
            : `${formatCurrency(Number(result.amount), result.currency)} ${t("transfer.completedDesc")}`}
        </p>
      </div>

      {/* Receipt */}
      <div className="bg-white border-b border-[#E3E3E3]">
        <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E3E3E3]">
          <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide">
            {t("transfer.receiptLabel")}
          </p>
        </div>
        {[
          { id: "ref",    label: t("transfer.referenceLabel"), value: result.id.slice(0, 8).toUpperCase() },
          { id: "amount", label: t("transfer.amount"),         value: formatCurrency(Number(result.amount), result.currency) },
          { id: "type",   label: t("transfer.type"),           value: result.type.charAt(0) + result.type.slice(1).toLowerCase() },
          { id: "status", label: t("transfer.status"),         value: result.status },
          ...(result.transferFee && Number(result.transferFee) > 0
            ? [{ id: "fee", label: t("transfer.fee"), value: formatCurrency(Number(result.transferFee), result.currency) }]
            : []),
          ...(result.fxRate
            ? [{ id: "fx", label: t("transfer.fxRate"), value: `1 GBP = ${Number(result.fxRate).toFixed(4)} ${result.currency}` }]
            : []),
        ].map(({ id, label, value }) => (
          <div
            key={id}
            className="flex justify-between items-center px-4 py-3.5 border-b border-[#E3E3E3] last:border-0"
          >
            <span className="text-sm text-[#767676]">{label}</span>
            <span
              className={`text-sm font-semibold ${
                id === "status"
                  ? isPending
                    ? "text-amber-500"
                    : "text-green-600"
                  : "text-[#333333]"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {isPending && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-sm p-3.5">
          <p className="text-xs text-amber-700 leading-relaxed">{t("transfer.fundsHeld")}</p>
        </div>
      )}

      <div className="p-4">
        <Button variant="secondary" fullWidth onClick={onReset}>
          {t("transfer.makeAnother")}
        </Button>
      </div>
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────

type PinStep = "enter" | "verifying" | "done" | "no-pin";

function ConfirmModal({
  amount,
  currency,
  recipient,
  onConfirm,
  onCancel,
  isLoading,
}: {
  amount: number;
  currency: string;
  recipient: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [step, setStep] = useState<PinStep>("enter");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pin = digits.join("");

  // Check if user has PIN set on mount
  useEffect(() => {
    authApi.getTransferPinStatus().then((r) => {
      if (!r.data.data.hasPin) setStep("no-pin");
      else setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }).catch(() => {});
  }, []);

  function handleDigit(idx: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = ch;
    setDigits(next);
    setPinError("");
    if (ch && idx < 5) inputRefs.current[idx + 1]?.focus();
    else if (ch && idx === 5) {
      // Auto-submit when last digit entered
      setTimeout(() => verifyPin(next.join("")), 80);
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ""; setDigits(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    if (text.length === 6) setTimeout(() => verifyPin(text), 80);
    else inputRefs.current[Math.min(text.length, 5)]?.focus();
  }

  async function verifyPin(code?: string) {
    const p = code ?? pin;
    if (p.length !== 6) return;
    setStep("verifying");
    setPinError("");
    try {
      await authApi.verifyTransferPin(p);
      setStep("done");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPinError(msg || "Incorrect PIN. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      setStep("enter");
      setShake(true);
      setTimeout(() => { setShake(false); inputRefs.current[0]?.focus(); }, 600);
    }
  }

  const isVerifying = step === "verifying";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4">
      <div className="w-full sm:max-w-sm bg-white sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a1a2e] px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Authorise payment</p>
            <p className="text-[11px] text-white/50 mt-0.5">Lumina Bank · Secure transfer</p>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-[#f8f8f8] border-b border-[#ebebeb] px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#AAAAAA] uppercase font-bold tracking-widest">Paying</p>
            <p className="text-sm font-semibold text-[#222] mt-0.5 truncate max-w-[180px]">{recipient}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#AAAAAA] uppercase font-bold tracking-widest">Amount</p>
            <p className="text-lg font-bold text-[#DB0011] mt-0.5">{formatCurrency(amount, currency)}</p>
          </div>
        </div>

        <div className="px-5 py-6">

          {/* No PIN set */}
          {step === "no-pin" && (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
                <KeyRound size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#222]">Transfer PIN not set up</p>
                <p className="text-xs text-[#767676] mt-1.5 leading-relaxed">
                  You need a 6-digit transfer PIN to authorise payments.<br />Set one up in your profile security settings.
                </p>
              </div>
              <button type="button" onClick={onCancel}
                className="w-full py-2.5 border border-[#E3E3E3] rounded-xl text-sm font-semibold text-[#767676]">
                Close
              </button>
            </div>
          )}

          {/* PIN entry */}
          {(step === "enter" || step === "verifying") && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-[#1a1a2e]/5 border border-[#1a1a2e]/10 flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={20} className="text-[#1a1a2e]" />
                </div>
                <p className="text-sm font-bold text-[#222]">Enter your transfer PIN</p>
                <p className="text-xs text-[#767676] mt-1">Your 6-digit security PIN</p>
              </div>

              {/* PIN dots */}
              <div
                className={`flex gap-3 justify-center transition-transform ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
                onPaste={handlePaste}
                style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
              >
                {digits.map((d, i) => (
                  <div key={i} className="relative">
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigit(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={isVerifying}
                      className="sr-only"
                    />
                    <div
                      onClick={() => inputRefs.current[i]?.focus()}
                      className={`h-14 w-11 rounded-xl border-2 flex items-center justify-center cursor-text transition-all
                        ${d ? "border-[#1a1a2e] bg-[#1a1a2e]" : "border-[#E3E3E3] bg-white"}
                        ${!d && digits.filter(Boolean).length === i ? "border-[#DB0011]" : ""}
                        ${isVerifying ? "opacity-50" : ""}`}
                    >
                      {d && <div className="h-3 w-3 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Keyboard for mobile */}
              <div className="grid grid-cols-3 gap-2">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isVerifying || k === ""}
                    onClick={() => {
                      if (k === "⌫") {
                        const lastFilled = [...digits].reverse().findIndex(d => d !== "");
                        if (lastFilled === -1) return;
                        const idx = 5 - lastFilled;
                        const next = [...digits]; next[idx] = ""; setDigits(next);
                        setPinError("");
                        inputRefs.current[idx]?.focus();
                      } else {
                        const nextEmpty = digits.findIndex(d => d === "");
                        if (nextEmpty === -1) return;
                        handleDigit(nextEmpty, k);
                      }
                    }}
                    className={`py-4 rounded-xl text-lg font-semibold transition-colors
                      ${k === "" ? "invisible" : ""}
                      ${k === "⌫" ? "text-[#DB0011] bg-red-50 hover:bg-red-100" : "bg-[#f5f5f5] text-[#222] hover:bg-[#ebebeb] active:bg-[#e0e0e0]"}
                      disabled:opacity-40`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {pinError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle size={13} className="text-[#DB0011] flex-shrink-0" />
                  <p className="text-xs text-[#DB0011] font-medium">{pinError}</p>
                </div>
              )}

              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#767676]">
                  <Loader2 size={13} className="animate-spin" /> Checking PIN…
                </div>
              )}
            </div>
          )}

          {/* Verified — ready to send */}
          {step === "done" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={26} className="text-green-600" />
                </div>
                <p className="text-sm font-bold text-[#222]">PIN accepted</p>
                <p className="text-xs text-[#767676] mt-1">Your payment is authorised and ready to send.</p>
              </div>
              <button type="button" onClick={onConfirm} disabled={isLoading}
                className="w-full py-3.5 bg-[#DB0011] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#b8000e] transition-colors">
                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                {isLoading ? "Sending…" : `Send ${formatCurrency(amount, currency)}`}
              </button>
            </div>
          )}
        </div>

        {step !== "done" && step !== "no-pin" && (
          <div className="px-5 pb-5">
            <button type="button" onClick={onCancel} disabled={isLoading}
              className="w-full py-2.5 border border-[#E3E3E3] rounded-xl text-sm font-semibold text-[#767676] hover:border-[#BBBBBB] transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SelectField ──────────────────────────────────────────────────────────────

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, children, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-[#333333] mb-1">{label}</label>
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none bg-white border rounded-sm px-3 py-2.5 pr-8 text-sm text-[#333333] focus:outline-none transition-colors ${
            error
              ? "border-[#DB0011]"
              : "border-[#E3E3E3] focus:border-[#DB0011]"
          }`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] pointer-events-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#DB0011]">{error}</p>}
    </div>
  )
);
SelectField.displayName = "SelectField";
