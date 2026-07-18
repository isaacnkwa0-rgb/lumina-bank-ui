"use client";

import { useEffect, useState, useRef, forwardRef, Suspense, type ReactNode, type SelectHTMLAttributes } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, Clock, ChevronDown, ArrowDownUp,
  RefreshCw, Send, Globe,
} from "lucide-react";
import {
  accountsApi, transfersApi, beneficiariesApi,
  type Account, type Beneficiary, type Transfer, type FxQuote,
} from "@/lib/api";
import { Loader2, BadgeCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
              {a.type} — {formatCurrency(Number(a.balance), a.currency)} (••{a.accountNumber.slice(-4)})
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
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm px-5 py-5">
      <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide text-center mb-4">
        Amount
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
    { key: "own", label: "Own accounts", icon: <ArrowDownUp size={13} /> },
    { key: "domestic", label: "UK transfer", icon: <Send size={13} /> },
    { key: "international", label: "International", icon: <Globe size={13} /> },
  ];

  if (result) {
    return (
      <SuccessScreen result={result} onReset={() => { setResult(null); setError(""); }} />
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3] px-4 py-4">
        <h1 className="text-lg font-semibold text-[#333333]">Transfer & Pay</h1>
        <p className="text-xs text-[#767676] mt-0.5">Send money quickly and securely</p>
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
            beneficiaries={beneficiaries.filter((b) => b.type === "domestic")}
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
  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<OwnForm>({ resolver: zodResolver(ownSchema) });

  const fromAccountId = watch("fromAccountId") ?? "";
  const toAccountId = watch("toAccountId") ?? "";

  async function onSubmit(data: OwnForm) {
    onError("");
    try {
      const res = await transfersApi.internal({ ...data, amount: Number(data.amount) });
      onSuccess(res.data.data);
    } catch (err: unknown) {
      onError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Transfer failed."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          From
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder="Choose source account"
        />
      </div>

      <TransferArrow />

      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          To
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={toAccountId}
          registerProps={register("toAccountId")}
          error={errors.toAccountId?.message}
          placeholder="Choose destination account"
        />
      </div>

      <BigAmountInput registerProps={register("amount")} error={errors.amount?.message} />

      <div className="bg-white border border-[#E3E3E3] rounded-sm px-4 py-3.5">
        <Input
          label="Reference"
          type="text"
          placeholder="e.g. Moving money to savings"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        Transfer now
      </Button>
    </form>
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
  const [useManual, setUseManual] = useState(beneficiaries.length === 0 || !!prefillAccNumber);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifiedName, setVerifiedName] = useState("");
  const [pendingData, setPendingData] = useState<DomesticFormValues | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
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
    setValue("toAccountName", b.name);
    if (b.bankCode) setValue("toBankCode", b.bankCode);
    setUseManual(false);
  }

  async function onSubmit(data: DomesticFormValues) {
    onError("");
    if (Number(data.amount) >= CONFIRM_THRESHOLD) {
      setPendingData(data);
      return;
    }
    await executeTransfer(data);
  }

  async function executeTransfer(data: DomesticFormValues) {
    setIsConfirming(true);
    try {
      const res = await transfersApi.domestic({ ...data, amount: Number(data.amount) });
      setPendingData(null);
      onSuccess(res.data.data);
    } catch (err: unknown) {
      setPendingData(null);
      onError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Transfer failed."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <>
    {pendingData && (
      <ConfirmModal
        amount={Number(pendingData.amount)}
        currency="GBP"
        recipient={pendingData.toAccountName}
        onConfirm={() => executeTransfer(pendingData)}
        onCancel={() => setPendingData(null)}
        isLoading={isConfirming}
      />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          From
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder="Choose source account"
        />
      </div>

      <TransferArrow />

      {/* Recipient section */}
      <SectionCard title="Send to">
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
                Saved payees
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
                New payee
              </button>
            </div>

            {!useManual && (
              <div className="space-y-2">
                {beneficiaries.map((b) => {
                  const initials = b.name
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
                        <p className="text-sm font-semibold text-[#333333] truncate">{b.name}</p>
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
              <option value="">Select bank</option>
              {UK_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </SelectField>

            {/* Account name — auto-populated via verify API */}
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Account name
              </label>

              {verifyState === "loading" && (
                <div className="flex items-center gap-2 py-2.5 border-b-2 border-[#E3E3E3] text-sm text-[#767676]">
                  <Loader2 size={14} className="animate-spin flex-shrink-0" />
                  Verifying account…
                </div>
              )}

              {verifyState === "found" && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 py-2.5 border-b-2 border-green-500">
                    <BadgeCheck size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-[#333333] flex-1">{verifiedName}</span>
                    <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide bg-green-50 px-1.5 py-0.5 rounded-sm">
                      Verified
                    </span>
                  </div>
                  <input type="hidden" {...register("toAccountName")} />
                  <p className="text-xs text-[#767676]">
                    Name doesn&apos;t match?{" "}
                    <button
                      type="button"
                      className="text-[#DB0011] underline"
                      onClick={() => {
                        setVerifyState("idle");
                        setVerifiedName("");
                        setValue("toAccountName", "");
                      }}
                    >
                      Enter manually
                    </button>
                  </p>
                </div>
              )}

              {verifyState === "not-found" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-2 text-sm text-amber-600">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    Account not found — enter name manually
                  </div>
                  <Input
                    type="text"
                    placeholder="Full name or company"
                    error={errors.toAccountName?.message}
                    {...register("toAccountName")}
                  />
                </div>
              )}

              {verifyState === "idle" && (
                <Input
                  type="text"
                  placeholder={toBankCode === "LMN" ? "Enter account number to auto-verify" : "Enter recipient's full name"}
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
              <span className="text-xs text-[#767676]">Save as a payee for future payments</span>
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
          label="Payment reference"
          type="text"
          placeholder="e.g. Rent July"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <FeeNotice>
        A <strong>£1.50</strong> fee applies to external UK transfers.
        Lumina-to-Lumina transfers are instant and <strong>free</strong>.
      </FeeNotice>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        Send payment
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
  const [pendingData, setPendingData] = useState<InternationalFormValues | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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
    await executeTransfer(data);
  }

  async function executeTransfer(data: InternationalFormValues) {
    setIsConfirming(true);
    try {
      const res = await transfersApi.international({ ...data, amount: Number(data.amount) });
      setPendingData(null);
      onSuccess(res.data.data);
    } catch (err: unknown) {
      setPendingData(null);
      onError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Transfer failed."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <>
    {pendingData && (
      <ConfirmModal
        amount={Number(pendingData.amount)}
        currency="GBP"
        recipient={pendingData.toAccountName}
        onConfirm={() => executeTransfer(pendingData)}
        onCancel={() => setPendingData(null)}
        isLoading={isConfirming}
      />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2 px-0.5">
          From
        </p>
        <AccountCardPicker
          accounts={accounts}
          selectedId={fromAccountId}
          registerProps={register("fromAccountId")}
          error={errors.fromAccountId?.message}
          placeholder="Choose source account"
        />
      </div>

      <TransferArrow />

      <SectionCard title="Recipient details">
        <Input
          label="Recipient name"
          type="text"
          placeholder="Full name or company"
          error={errors.toAccountName?.message}
          {...register("toAccountName")}
        />
        <Input
          label="Bank name"
          type="text"
          placeholder="e.g. BNP Paribas"
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
          label="SWIFT / BIC"
          type="text"
          placeholder="e.g. BNPAFRPPXXX"
          error={errors.swiftCode?.message}
          {...register("swiftCode")}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Country"
            error={errors.toCountry?.message}
            {...register("toCountry")}
          >
            <option value="">Country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </SelectField>
          <SelectField
            label="Currency"
            error={errors.toCurrency?.message}
            {...register("toCurrency")}
          >
            <option value="">Currency</option>
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
          {loadingQuote ? "Getting rate…" : fxQuote ? "Refresh rate" : "Get exchange rate"}
        </button>
      )}

      {/* FX quote box */}
      {fxQuote && (
        <div className="bg-white border border-[#E3E3E3] rounded-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E3E3E3]">
            <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide">
              Exchange rate breakdown
            </p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {[
              ["Rate", `1 GBP = ${fxQuote.rate.toFixed(4)} ${fxQuote.toCurrency}`],
              ["You send", formatCurrency(Number(amount), "GBP")],
              ["Recipient gets", `${fxQuote.convertedAmount.toFixed(2)} ${fxQuote.toCurrency}`],
              ["Fees", formatCurrency(fxQuote.fee, "GBP")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-[#767676]">{label}</span>
                <span
                  className={`text-sm font-semibold ${
                    label === "Recipient gets" ? "text-green-600" : "text-[#333333]"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E3E3E3] rounded-sm px-4 py-3.5">
        <Input
          label="Payment reference"
          type="text"
          placeholder="Optional — e.g. Invoice #1234"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <FeeNotice>
        International transfers include a <strong>£5.00</strong> fee plus an FX conversion charge.
        Processing typically takes <strong>3–5 business days</strong>.
      </FeeNotice>

      <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
        {fxQuote ? "Confirm transfer" : "Send transfer"}
      </Button>
    </form>
    </>
  );
}

// ── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ result, onReset }: { result: Transfer; onReset: () => void }) {
  const isPending = result.status === "PENDING";

  return (
    <div className="max-w-lg mx-auto">
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
          {isPending ? "Transfer submitted" : "Transfer complete"}
        </h2>
        <p className="text-sm text-[#767676] max-w-xs">
          {isPending
            ? `Your transfer of ${formatCurrency(Number(result.amount), result.currency)} is pending review. You'll be notified once it's approved.`
            : `${formatCurrency(Number(result.amount), result.currency)} has been transferred successfully.`}
        </p>
      </div>

      {/* Receipt */}
      <div className="bg-white border-b border-[#E3E3E3]">
        <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E3E3E3]">
          <p className="text-xs font-semibold text-[#767676] uppercase tracking-wide">
            Transfer receipt
          </p>
        </div>
        {[
          ["Reference", result.id.slice(0, 8).toUpperCase()],
          ["Amount", formatCurrency(Number(result.amount), result.currency)],
          ["Type", result.type.charAt(0) + result.type.slice(1).toLowerCase()],
          ["Status", result.status],
          ...(result.transferFee && Number(result.transferFee) > 0
            ? [["Transfer fee", formatCurrency(Number(result.transferFee), result.currency)]]
            : []),
          ...(result.fxRate
            ? [["FX rate", `1 GBP = ${Number(result.fxRate).toFixed(4)} ${result.currency}`]]
            : []),
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between items-center px-4 py-3.5 border-b border-[#E3E3E3] last:border-0"
          >
            <span className="text-sm text-[#767676]">{label}</span>
            <span
              className={`text-sm font-semibold ${
                label === "Status"
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
          <p className="text-xs text-amber-700 leading-relaxed">
            Your funds have been debited and held securely while the transfer is reviewed. This
            typically takes 1–5 business days depending on the transfer type and destination.
          </p>
        </div>
      )}

      <div className="p-4">
        <Button variant="secondary" fullWidth onClick={onReset}>
          Make another transfer
        </Button>
      </div>
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────

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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E3E3E3]">
          <p className="text-sm font-bold text-[#333333]">Confirm transfer</p>
          <p className="text-xs text-[#767676] mt-0.5">Please review before sending</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-[#767676]">Amount</span>
            <span className="text-sm font-bold text-[#333333]">
              {formatCurrency(amount, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#767676]">To</span>
            <span className="text-sm font-semibold text-[#333333] max-w-[60%] text-right truncate">
              {recipient}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
            <p className="text-xs text-amber-700">
              This transfer cannot be undone once confirmed. Ensure all details are correct.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-[#E3E3E3] rounded-sm text-sm font-semibold text-[#767676] hover:border-[#BBBBBB] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-[#DB0011] rounded-sm text-sm font-bold text-white hover:bg-[#B0000E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? "Sending…" : "Confirm & send"}
          </button>
        </div>
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
