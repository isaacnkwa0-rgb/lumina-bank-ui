"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield, Lock, Building2, Check, Eye, EyeOff,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Mail, Phone,
} from "lucide-react";
import { authApi, usersApi, kycApi, accountsApi } from "@/lib/api";
import { setToken, setRefreshToken, setUser } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "@/components/onboarding/OtpInput";
import { PasswordStrength } from "@/components/onboarding/PasswordStrength";
import { FileUploadZone } from "@/components/onboarding/FileUploadZone";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ReviewCard } from "@/components/onboarding/ReviewCard";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────────

const SANCTIONED = new Set(["IR", "KP", "CU", "SY", "MM"]);

const COUNTRIES = [
  { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" },
  { code: "ES", name: "Spain" }, { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" }, { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" }, { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" }, { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }, { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" }, { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" }, { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" }, { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" }, { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" }, { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" }, { code: "ZA", name: "South Africa" },
  { code: "GH", name: "Ghana" }, { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" }, { code: "EG", name: "Egypt" },
  { code: "IR", name: "Iran" }, { code: "KP", name: "North Korea" },
  { code: "CU", name: "Cuba" }, { code: "SY", name: "Syria" },
  { code: "MM", name: "Myanmar" }, { code: "RU", name: "Russia" },
];

const PHONE_PREFIXES = [
  { code: "GB", prefix: "+44", label: "+44 (UK)" },
  { code: "US", prefix: "+1", label: "+1 (US/CA)" },
  { code: "AU", prefix: "+61", label: "+61 (AU)" },
  { code: "DE", prefix: "+49", label: "+49 (DE)" },
  { code: "FR", prefix: "+33", label: "+33 (FR)" },
  { code: "ES", prefix: "+34", label: "+34 (ES)" },
  { code: "PT", prefix: "+351", label: "+351 (PT)" },
  { code: "IT", prefix: "+39", label: "+39 (IT)" },
  { code: "NL", prefix: "+31", label: "+31 (NL)" },
  { code: "IE", prefix: "+353", label: "+353 (IE)" },
  { code: "IN", prefix: "+91", label: "+91 (IN)" },
  { code: "NG", prefix: "+234", label: "+234 (NG)" },
  { code: "GH", prefix: "+233", label: "+233 (GH)" },
  { code: "KE", prefix: "+254", label: "+254 (KE)" },
  { code: "ZA", prefix: "+27", label: "+27 (ZA)" },
  { code: "AE", prefix: "+971", label: "+971 (AE)" },
  { code: "SG", prefix: "+65", label: "+65 (SG)" },
];

const INDUSTRIES = [
  "Finance", "Technology", "Healthcare", "Education", "Retail",
  "Manufacturing", "Construction", "Transport", "Hospitality",
  "Media", "Legal", "Agriculture", "Government", "Other",
];

const INCOME_RANGES = [
  { value: "0-20000", label: "Under £20,000" },
  { value: "20000-50000", label: "£20,000 – £50,000" },
  { value: "50000-100000", label: "£50,000 – £100,000" },
  { value: "100000-250000", label: "£100,000 – £250,000" },
  { value: "250000+", label: "Over £250,000" },
];

const MONTHLY_VOLUMES = [
  { value: "0-1000", label: "Under £1,000" },
  { value: "1000-5000", label: "£1,000 – £5,000" },
  { value: "5000-25000", label: "£5,000 – £25,000" },
  { value: "25000+", label: "Over £25,000" },
];

const SOURCE_OPTIONS = [
  "Salary", "Business income", "Investments",
  "Savings", "Inheritance", "Pension", "Other",
];

const STORAGE_KEY = "lumina_onboarding";
const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000;

// ── Types ──────────────────────────────────────────────────────────────────────

interface WizardState {
  step: number;
  completedSteps: number[];
  // Stage 2
  countryOfResidence: string;
  ageConfirmed: boolean;
  taxResidency: string;
  accountType: string;
  // Stage 3
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  ssn: string;
  // Stage 4
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  // Stage 5 & 6
  emailOtp: string;
  phoneOtp: string;
  // Stage 7
  addressLine1: string;
  addressLine2: string;
  city: string;
  addressState: string;
  postalCode: string;
  addressCountry: string;
  // Stage 8
  employmentStatus: string;
  occupation: string;
  industry: string;
  employerName: string;
  annualIncomeRange: string;
  sourceOfFunds: string[];
  expectedMonthlyVolume: string;
  // Stage 9
  docType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  kycSubmitted: boolean;
  // Stage 11
  termsAccepted: boolean;
  infoAccurate: boolean;
  marketingConsent: boolean;
  electronicStatementsConsent: boolean;
  dataProcessingConsent: boolean;
  // Meta
  errors: Record<string, string>;
  submitting: boolean;
  apiError: string;
  // Post-success
  userFirstName: string;
  accountNumber: string;
  sortCode: string;
}

type WizardAction =
  | { type: "SET"; field: keyof WizardState; value: unknown }
  | { type: "ERRORS"; errors: Record<string, string> }
  | { type: "CLEAR_ERRORS" }
  | { type: "API_ERROR"; message: string }
  | { type: "SUBMITTING"; value: boolean }
  | { type: "COMPLETE"; step: number }
  | { type: "GO_TO"; step: number }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "TOGGLE_SOURCE"; value: string }
  | { type: "SUCCESS"; firstName: string; accountNumber: string; sortCode: string }
  | { type: "RESTORE"; data: Partial<WizardState> };

const initial: WizardState = {
  step: 1, completedSteps: [],
  countryOfResidence: "GB", ageConfirmed: false, taxResidency: "GB", accountType: "",
  firstName: "", lastName: "", dateOfBirth: "", gender: "", nationality: "GB", ssn: "",
  email: "", phonePrefix: "+44", phoneNumber: "", password: "", confirmPassword: "",
  emailOtp: "", phoneOtp: "",
  addressLine1: "", addressLine2: "", city: "", addressState: "", postalCode: "", addressCountry: "GB",
  employmentStatus: "", occupation: "", industry: "", employerName: "",
  annualIncomeRange: "", sourceOfFunds: [], expectedMonthlyVolume: "",
  docType: "", idFront: null, idBack: null, selfie: null, kycSubmitted: false,
  termsAccepted: false, infoAccurate: false, marketingConsent: false,
  electronicStatementsConsent: false, dataProcessingConsent: false,
  errors: {}, submitting: false, apiError: "",
  userFirstName: "", accountNumber: "", sortCode: "",
};

function reducer(s: WizardState, a: WizardAction): WizardState {
  switch (a.type) {
    case "SET": return { ...s, [a.field]: a.value };
    case "ERRORS": return { ...s, errors: a.errors };
    case "CLEAR_ERRORS": return { ...s, errors: {}, apiError: "" };
    case "API_ERROR": return { ...s, apiError: a.message, submitting: false };
    case "SUBMITTING": return { ...s, submitting: a.value, apiError: "" };
    case "COMPLETE": return {
      ...s,
      completedSteps: s.completedSteps.includes(a.step) ? s.completedSteps : [...s.completedSteps, a.step],
    };
    case "GO_TO": return { ...s, step: a.step, errors: {}, apiError: "" };
    case "NEXT": return { ...s, step: s.step === 5 ? 7 : s.step + 1, errors: {}, apiError: "" };
    case "BACK": return { ...s, step: s.step === 7 ? 5 : s.step - 1, errors: {}, apiError: "" };
    case "TOGGLE_SOURCE": {
      const next = s.sourceOfFunds.includes(a.value)
        ? s.sourceOfFunds.filter((v) => v !== a.value)
        : [...s.sourceOfFunds, a.value];
      return { ...s, sourceOfFunds: next };
    }
    case "SUCCESS": return { ...s, userFirstName: a.firstName, accountNumber: a.accountNumber, sortCode: a.sortCode };
    case "RESTORE": return { ...s, ...a.data };
    default: return s;
  }
}

// ── localStorage helpers ───────────────────────────────────────────────────────

function saveProgress(s: WizardState) {
  // Never persist sensitive fields
  const { errors, submitting, apiError, idFront, idBack, selfie, ssn, password, confirmPassword, ...safe } = s;
  void errors; void submitting; void apiError; void idFront; void idBack; void selfie; void ssn; void password; void confirmPassword;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...safe, savedAt: Date.now() }));
  } catch { /* ignore */ }
}

function loadProgress(): Partial<WizardState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardState> & { savedAt?: number };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Phone step (6) is removed — migrate anyone saved there to Address (7)
    if (parsed.step === 6) parsed.step = 7;
    return parsed;
  } catch { return null; }
}

function clearProgress() { localStorage.removeItem(STORAGE_KEY); }

// ── UI helpers ─────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-[#DB0011]" role="alert">{msg}</p>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] mb-3">{children}</p>
  );
}

function RadioCard({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full text-left px-4 py-3 border rounded-sm transition-colors text-sm font-medium",
        selected
          ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
          : "border-[#E3E3E3] text-[#555555] hover:border-[#BBBBBB]"
      )}
    >
      <span className={cn(
        "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors",
        selected ? "border-[#DB0011] bg-[#DB0011]" : "border-[#CCCCCC]"
      )} />
      {children}
    </button>
  );
}

function NavButtons({
  onBack, onNext, nextLabel, submitting, hideBack = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  submitting?: boolean;
  hideBack?: boolean;
}) {
  return (
    <div className={cn("flex gap-3 pt-5 mt-5 border-t border-[#F0F0F0]", hideBack && "justify-center")}>
      {!hideBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-sm font-semibold text-[#555555] border border-[#E3E3E3] rounded-sm hover:bg-[#F8F8F8] transition-colors"
        >
          Back
        </button>
      )}
      <Button
        type="button"
        onClick={onNext}
        isLoading={submitting}
        size="lg"
        className={hideBack ? "px-12" : "flex-[2]"}
      >
        {submitting ? "Please wait…" : (nextLabel ?? "Continue")}
      </Button>
    </div>
  );
}

// ── Stage 1 — Welcome ──────────────────────────────────────────────────────────

function Stage1({ onNext }: { onNext: () => void }) {
  const { t } = useLanguage();
  const needs = [
    { key: "onboarding.welcome.need1" as const, icon: "🪪" },
    { key: "onboarding.welcome.need2" as const, icon: "✉️" },
    { key: "onboarding.welcome.need3" as const, icon: "📱" },
    { key: "onboarding.welcome.need4" as const, icon: "🏠" },
  ];
  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div>
        <h2 id="stage-title" className="text-2xl font-bold text-[#222222]">
          {t("onboarding.welcome.headline")}
        </h2>
      </div>

      <div className="bg-[#F8F8F8] rounded-sm p-5 space-y-3">
        <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">{t("onboarding.welcome.need")}</p>
        {needs.map(({ key, icon }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <span className="text-sm text-[#333333]">{t(key)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { icon: Lock, key: "onboarding.welcome.enc" as const },
          { icon: Shield, key: "onboarding.welcome.fca" as const },
          { icon: Building2, key: "onboarding.welcome.fscs" as const },
        ].map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-sm">
            <Icon size={13} />
            {t(key)}
          </div>
        ))}
      </div>

      <p className="text-xs text-[#767676] leading-relaxed">
        {t("onboarding.welcome.privacy")}
      </p>

      <Button size="lg" onClick={onNext} className="w-full">
        {t("onboarding.welcome.cta")} <ChevronRight size={16} className="ml-1" />
      </Button>

      <p className="text-center text-sm text-[#767676]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#DB0011] font-semibold hover:underline">Log on</Link>
      </p>
    </section>
  );
}

// ── Stage 2 — Eligibility ──────────────────────────────────────────────────────

function Stage2({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const isUS = state.countryOfResidence === "US";
  const isSanctioned = SANCTIONED.has(state.countryOfResidence);

  const accountTypes = [
    { value: "PERSONAL", key: "onboarding.elig.personal" as const },
    { value: "STUDENT", key: "onboarding.elig.student" as const },
    { value: "JOINT", key: "onboarding.elig.joint" as const },
    { value: "BUSINESS", key: "onboarding.elig.business" as const },
    { value: "PREMIUM", key: "onboarding.elig.premium" as const },
  ];

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!state.ageConfirmed) errs.ageConfirmed = "You must confirm your age to continue";
    if (!state.accountType) errs.accountType = "Please select an account type";
    if (Object.keys(errs).length) { dispatch({ type: "ERRORS", errors: errs }); return false; }
    return true;
  }

  function handleNext() {
    if (!validate()) return;
    dispatch({ type: "COMPLETE", step: 2 });
    dispatch({ type: "NEXT" });
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.elig.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.elig.subtitle")}</p>
      </div>

      {isSanctioned && (
        <div className="bg-red-50 border border-[#DB0011] rounded-sm p-4 flex gap-3">
          <AlertCircle size={18} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#DB0011]">{t("onboarding.elig.ineligible")}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.elig.country")}</label>
        <select
          value={state.countryOfResidence}
          onChange={(e) => {
            dispatch({ type: "SET", field: "countryOfResidence", value: e.target.value });
            dispatch({ type: "SET", field: "addressCountry", value: e.target.value });
          }}
          className="w-full border border-[#E3E3E3] rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.elig.taxResidency")}</label>
        <select
          value={state.taxResidency}
          onChange={(e) => dispatch({ type: "SET", field: "taxResidency", value: e.target.value })}
          className="w-full border border-[#E3E3E3] rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
        >
          {COUNTRIES.filter((c) => !SANCTIONED.has(c.code)).map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.ageConfirmed}
            onChange={(e) => dispatch({ type: "SET", field: "ageConfirmed", value: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-[#DB0011]"
          />
          <span className="text-sm text-[#333333]">{t("onboarding.elig.ageConfirm")}</span>
        </label>
        <FieldError msg={state.errors.ageConfirmed} />
      </div>

      <div>
        <SectionLabel>{t("onboarding.elig.accountType")}</SectionLabel>
        <div className="space-y-2">
          {accountTypes.map(({ value, key }) => (
            <RadioCard
              key={value}
              selected={state.accountType === value}
              onClick={() => dispatch({ type: "SET", field: "accountType", value })}
            >
              {t(key)}
            </RadioCard>
          ))}
        </div>
        <FieldError msg={state.errors.accountType} />
        {state.accountType === "JOINT" && (
          <p className="mt-3 text-xs text-[#767676] bg-blue-50 rounded-sm p-3">
            ℹ️ {t("onboarding.elig.jointNote")}
          </p>
        )}
      </div>

      {!isUS && (
        <NavButtons
          onBack={() => dispatch({ type: "BACK" })}
          onNext={isSanctioned ? undefined : handleNext}
          nextLabel={t("onboarding.next")}
          hideBack={false}
        />
      )}
      {isUS && (
        <NavButtons
          onBack={() => dispatch({ type: "BACK" })}
          onNext={isSanctioned ? undefined : handleNext}
          nextLabel={t("onboarding.next")}
        />
      )}
    </section>
  );
}

// ── Stage 3 — Personal Details ─────────────────────────────────────────────────

function Stage3({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const isUS = state.countryOfResidence === "US";
  const genders = [
    { value: "MALE", key: "onboarding.personal.male" as const },
    { value: "FEMALE", key: "onboarding.personal.female" as const },
    { value: "NON_BINARY", key: "onboarding.personal.nonBinary" as const },
    { value: "PREFER_NOT", key: "onboarding.personal.preferNot" as const },
  ];

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!state.firstName.trim()) errs.firstName = "First name is required";
    if (!state.lastName.trim()) errs.lastName = "Last name is required";
    if (!state.dateOfBirth) { errs.dateOfBirth = "Date of birth is required"; }
    else {
      const dob = new Date(state.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear() - (
        today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0
      );
      if (isNaN(dob.getTime()) || age < 18) errs.dateOfBirth = "You must be at least 18 years old";
    }
    if (isUS && !state.ssn.trim()) errs.ssn = t("onboarding.personal.ssnRequired");
    if (isUS && state.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(state.ssn)) errs.ssn = "Format must be XXX-XX-XXXX";
    if (Object.keys(errs).length) { dispatch({ type: "ERRORS", errors: errs }); return false; }
    return true;
  }

  function handleNext() {
    if (!validate()) return;
    dispatch({ type: "COMPLETE", step: 3 });
    dispatch({ type: "NEXT" });
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-5">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.personal.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.personal.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t("onboarding.personal.firstName")}
            value={state.firstName}
            onChange={(e) => dispatch({ type: "SET", field: "firstName", value: e.target.value })}
            error={state.errors.firstName}
            autoComplete="given-name"
          />
        </div>
        <div>
          <Input
            label={t("onboarding.personal.lastName")}
            value={state.lastName}
            onChange={(e) => dispatch({ type: "SET", field: "lastName", value: e.target.value })}
            error={state.errors.lastName}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Input
          label={t("onboarding.personal.dob")}
          type="date"
          value={state.dateOfBirth}
          onChange={(e) => dispatch({ type: "SET", field: "dateOfBirth", value: e.target.value })}
          error={state.errors.dateOfBirth}
          hint={t("onboarding.personal.dobHint")}
          autoComplete="bday"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">
          {t("onboarding.personal.gender")}{" "}
          <span className="font-normal text-[#767676]">{t("onboarding.personal.genderOptional")}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {genders.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => dispatch({ type: "SET", field: "gender", value: state.gender === value ? "" : value })}
              className={cn(
                "py-2.5 px-3 text-sm font-medium border rounded-sm transition-colors",
                state.gender === value
                  ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                  : "border-[#E3E3E3] text-[#555555] hover:border-[#BBBBBB]"
              )}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.personal.nationality")}</label>
        <select
          value={state.nationality}
          onChange={(e) => dispatch({ type: "SET", field: "nationality", value: e.target.value })}
          className="w-full border border-[#E3E3E3] rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
        >
          {COUNTRIES.filter((c) => !SANCTIONED.has(c.code)).map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {isUS && (
        <div>
          <Input
            label={t("onboarding.personal.ssn")}
            placeholder="XXX-XX-XXXX"
            value={state.ssn}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
              let formatted = digits;
              if (digits.length > 5) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
              else if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
              dispatch({ type: "SET", field: "ssn", value: formatted });
            }}
            error={state.errors.ssn}
            hint={t("onboarding.personal.ssnHint")}
            type="password"
            inputMode="numeric"
            autoComplete="off"
          />
        </div>
      )}

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleNext}
        nextLabel={t("onboarding.next")}
      />
    </section>
  );
}

// ── Stage 4 — Contact & Security ───────────────────────────────────────────────

function Stage4({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errs.email = "Enter a valid email address";
    if (!state.phoneNumber.trim() || state.phoneNumber.length < 7) errs.phoneNumber = "Enter a valid phone number";
    if (state.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!/[A-Z]/.test(state.password)) errs.password = "Password must include an uppercase letter";
    if (!/[0-9]/.test(state.password)) errs.password = "Password must include a number";
    if (state.password !== state.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { dispatch({ type: "ERRORS", errors: errs }); return false; }
    return true;
  }

  async function handleNext() {
    if (!validate()) return;
    dispatch({ type: "SUBMITTING", value: true });
    try {
      const phone = `${state.phonePrefix}${state.phoneNumber}`;
      // Backend enum only accepts MALE | FEMALE | OTHER
      const genderValue = ["MALE", "FEMALE", "OTHER"].includes(state.gender)
        ? (state.gender as "MALE" | "FEMALE" | "OTHER")
        : undefined;
      const res = await authApi.register({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone,
        password: state.password,
        gender: genderValue,
        dateOfBirth: state.dateOfBirth || undefined,
        nationality: state.nationality || undefined,
        countryOfResidence: state.countryOfResidence,
        taxResidency: state.taxResidency ? [state.taxResidency] : undefined,
        accountType: state.accountType || undefined,
        ssn: state.ssn || undefined,
      });
      const data = res.data.data as { accessToken: string; refreshToken: string; user: { firstName: string } };
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user as Parameters<typeof setUser>[0]);
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 4 });
      dispatch({ type: "NEXT" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string }; message?: string } } })
        ?.response?.data?.error?.message
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Registration failed. Please try again.";
      dispatch({ type: "API_ERROR", message: msg });
    }
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-5">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.contact.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.contact.subtitle")}</p>
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011]">{state.apiError}</p>
        </div>
      )}

      <Input
        label={t("onboarding.contact.email")}
        type="email"
        value={state.email}
        onChange={(e) => dispatch({ type: "SET", field: "email", value: e.target.value })}
        error={state.errors.email}
        autoComplete="email"
      />

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.contact.phone")}</label>
        <div className="flex gap-2">
          <select
            value={state.phonePrefix}
            onChange={(e) => dispatch({ type: "SET", field: "phonePrefix", value: e.target.value })}
            className="flex-shrink-0 border border-[#E3E3E3] rounded-sm px-2 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
          >
            {PHONE_PREFIXES.map((p) => (
              <option key={p.code} value={p.prefix}>{p.label}</option>
            ))}
          </select>
          <input
            type="tel"
            value={state.phoneNumber}
            onChange={(e) => dispatch({ type: "SET", field: "phoneNumber", value: e.target.value })}
            placeholder="7700 900000"
            autoComplete="tel"
            className={cn(
              "flex-1 border rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none transition-colors",
              state.errors.phoneNumber ? "border-[#DB0011]" : "border-[#E3E3E3] focus:border-[#DB0011]"
            )}
          />
        </div>
        <FieldError msg={state.errors.phoneNumber} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.contact.password")}</label>
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            value={state.password}
            onChange={(e) => dispatch({ type: "SET", field: "password", value: e.target.value })}
            autoComplete="new-password"
            className={cn(
              "w-full border rounded-sm px-3 py-2.5 pr-16 text-sm focus:outline-none transition-colors",
              state.errors.password ? "border-[#DB0011]" : "border-[#E3E3E3] focus:border-[#DB0011]"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#767676] hover:text-[#333333]"
          >
            {showPwd ? <><EyeOff size={14} className="inline" /> {t("onboarding.contact.hide")}</> : <><Eye size={14} className="inline" /> {t("onboarding.contact.show")}</>}
          </button>
        </div>
        <FieldError msg={state.errors.password} />
        {state.password && (
          <div className="mt-3">
            <PasswordStrength password={state.password} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.contact.confirmPassword")}</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={state.confirmPassword}
            onChange={(e) => dispatch({ type: "SET", field: "confirmPassword", value: e.target.value })}
            autoComplete="new-password"
            className={cn(
              "w-full border rounded-sm px-3 py-2.5 pr-16 text-sm focus:outline-none transition-colors",
              state.errors.confirmPassword ? "border-[#DB0011]" : "border-[#E3E3E3] focus:border-[#DB0011]"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#767676] hover:text-[#333333]"
          >
            {showConfirm ? <><EyeOff size={14} className="inline" /> {t("onboarding.contact.hide")}</> : <><Eye size={14} className="inline" /> {t("onboarding.contact.show")}</>}
          </button>
        </div>
        {state.confirmPassword && state.password && (
          <p className={cn("mt-1 text-xs font-medium", state.confirmPassword === state.password ? "text-green-600" : "text-[#DB0011]")}>
            {state.confirmPassword === state.password ? "✓ Passwords match" : "✗ Passwords do not match"}
          </p>
        )}
        <FieldError msg={state.errors.confirmPassword} />
      </div>

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleNext}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 5 — Verify Email ─────────────────────────────────────────────────────

function Stage5({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(30);
    timerRef.current = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  }

  useEffect(() => {
    startCooldown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    try { await authApi.resendVerification(state.email); startCooldown(); } catch { /* ignore */ }
  }

  async function handleVerify() {
    if (state.emailOtp.length < 6) return;
    dispatch({ type: "SUBMITTING", value: true });
    try {
      await authApi.verifyEmail(state.emailOtp, state.email);
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 5 });
      dispatch({ type: "NEXT" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Invalid or expired code";
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "API_ERROR", message: msg });
    }
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div className="text-center">
        <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-blue-600" />
        </div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.verifyEmail.title")}</h2>
        <p className="text-sm text-[#767676] mt-2">
          {t("onboarding.verifyEmail.body")}{" "}
          <span className="font-semibold text-[#333333]">{state.email}</span>
        </p>
        <p className="text-xs text-[#AAAAAA] mt-1">{t("onboarding.verifyEmail.expires")}</p>
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011] text-center">{state.apiError}</p>
        </div>
      )}

      <OtpInput
        value={state.emailOtp}
        onChange={(v) => dispatch({ type: "SET", field: "emailOtp", value: v })}
        disabled={state.submitting}
        error={state.errors.emailOtp}
      />

      <div className="text-center">
        {cooldown > 0 ? (
          <p className="text-xs text-[#AAAAAA]">
            {t("onboarding.verifyEmail.resendIn")} {cooldown}{t("onboarding.verifyEmail.s")}
          </p>
        ) : (
          <button type="button" onClick={handleResend} className="text-xs font-semibold text-[#DB0011] hover:underline">
            {t("onboarding.verifyEmail.resend")}
          </button>
        )}
        <p className="text-xs text-[#AAAAAA] mt-2">
          {t("onboarding.verifyEmail.wrong")}{" "}
          <button type="button" onClick={() => dispatch({ type: "BACK" })} className="text-[#DB0011] hover:underline font-semibold">
            Back
          </button>
        </p>
      </div>

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleVerify}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 6 — Verify Phone ─────────────────────────────────────────────────────

function Stage6({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sentRef = useRef(false);

  function startCooldown() {
    setCooldown(30);
    timerRef.current = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  }

  const sendOtp = useCallback(async () => {
    setSending(true);
    try {
      await authApi.sendPhoneOtp();
      startCooldown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Failed to send code";
      dispatch({ type: "API_ERROR", message: msg });
    } finally {
      setSending(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!sentRef.current) {
      sentRef.current = true;
      sendOtp();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sendOtp]);

  async function handleVerify() {
    if (state.phoneOtp.length < 6) return;
    dispatch({ type: "SUBMITTING", value: true });
    try {
      await authApi.verifyPhoneOtp(state.phoneOtp);
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 6 });
      dispatch({ type: "NEXT" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Invalid or expired code";
      dispatch({ type: "API_ERROR", message: msg });
    }
  }

  const phone = `${state.phonePrefix} ${state.phoneNumber}`;

  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div className="text-center">
        <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone size={24} className="text-blue-600" />
        </div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.verifyPhone.title")}</h2>
        {sending ? (
          <p className="text-sm text-[#767676] mt-2">{t("onboarding.verifyPhone.sending")}</p>
        ) : (
          <p className="text-sm text-[#767676] mt-2">
            {t("onboarding.verifyPhone.body")}{" "}
            <span className="font-semibold text-[#333333]">{phone}</span>
          </p>
        )}
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011] text-center">{state.apiError}</p>
        </div>
      )}

      <OtpInput
        value={state.phoneOtp}
        onChange={(v) => dispatch({ type: "SET", field: "phoneOtp", value: v })}
        disabled={state.submitting || sending}
        error={state.errors.phoneOtp}
      />

      <div className="text-center space-y-2">
        {cooldown > 0 ? (
          <p className="text-xs text-[#AAAAAA]">
            {t("onboarding.verifyPhone.resendIn")} {cooldown}{t("onboarding.verifyEmail.s")}
          </p>
        ) : (
          <button type="button" onClick={sendOtp} className="text-xs font-semibold text-[#DB0011] hover:underline block mx-auto">
            {t("onboarding.verifyPhone.resend")}
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="text-xs text-[#AAAAAA] hover:text-[#555] block mx-auto"
        >
          {t("onboarding.verifyPhone.tryDifferent")}
        </button>
      </div>

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleVerify}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 7 — Address ──────────────────────────────────────────────────────────

function Stage7({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!state.addressLine1.trim()) errs.addressLine1 = "Address line 1 is required";
    if (!state.city.trim()) errs.city = "City is required";
    if (!state.postalCode.trim()) errs.postalCode = "Postcode is required";
    if (Object.keys(errs).length) { dispatch({ type: "ERRORS", errors: errs }); return false; }
    return true;
  }

  async function handleNext() {
    if (!validate()) return;
    dispatch({ type: "SUBMITTING", value: true });
    try {
      const street = [state.addressLine1, state.addressLine2].filter(Boolean).join(", ");
      await usersApi.updateProfile({
        address: {
          street,
          city: state.city,
          state: state.addressState,
          postalCode: state.postalCode,
          country: state.addressCountry,
        },
      });
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 7 });
      dispatch({ type: "NEXT" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Failed to save address";
      dispatch({ type: "API_ERROR", message: msg });
    }
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-5">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.address.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.address.subtitle")}</p>
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011]">{state.apiError}</p>
        </div>
      )}

      <Input
        label={t("onboarding.address.line1")}
        value={state.addressLine1}
        onChange={(e) => dispatch({ type: "SET", field: "addressLine1", value: e.target.value })}
        error={state.errors.addressLine1}
        autoComplete="address-line1"
      />
      <Input
        label={t("onboarding.address.line2")}
        value={state.addressLine2}
        onChange={(e) => dispatch({ type: "SET", field: "addressLine2", value: e.target.value })}
        autoComplete="address-line2"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("onboarding.address.city")}
          value={state.city}
          onChange={(e) => dispatch({ type: "SET", field: "city", value: e.target.value })}
          error={state.errors.city}
          autoComplete="address-level2"
        />
        <Input
          label={t("onboarding.address.state")}
          value={state.addressState}
          onChange={(e) => dispatch({ type: "SET", field: "addressState", value: e.target.value })}
          autoComplete="address-level1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("onboarding.address.postcode")}
          value={state.postalCode}
          onChange={(e) => dispatch({ type: "SET", field: "postalCode", value: e.target.value })}
          error={state.errors.postalCode}
          autoComplete="postal-code"
        />
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.address.country")}</label>
          <select
            value={state.addressCountry}
            onChange={(e) => dispatch({ type: "SET", field: "addressCountry", value: e.target.value })}
            className="w-full border border-[#E3E3E3] rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
          >
            {COUNTRIES.filter((c) => !SANCTIONED.has(c.code)).map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleNext}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 8 — Financial Profile ────────────────────────────────────────────────

function Stage8({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const empStatuses = [
    { value: "EMPLOYED", key: "onboarding.finance.employed" as const },
    { value: "SELF_EMPLOYED", key: "onboarding.finance.selfEmployed" as const },
    { value: "STUDENT", key: "onboarding.finance.studentStatus" as const },
    { value: "RETIRED", key: "onboarding.finance.retired" as const },
    { value: "UNEMPLOYED", key: "onboarding.finance.unemployed" as const },
  ];
  const showOccupation = ["EMPLOYED", "SELF_EMPLOYED"].includes(state.employmentStatus);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!state.employmentStatus) errs.employmentStatus = "Please select your employment status";
    if (!state.annualIncomeRange) errs.annualIncomeRange = "Please select your annual income range";
    if (state.sourceOfFunds.length === 0) errs.sourceOfFunds = "Please select at least one source of funds";
    if (!state.expectedMonthlyVolume) errs.expectedMonthlyVolume = "Please select expected monthly volume";
    if (Object.keys(errs).length) { dispatch({ type: "ERRORS", errors: errs }); return false; }
    return true;
  }

  async function handleNext() {
    if (!validate()) return;
    dispatch({ type: "SUBMITTING", value: true });
    try {
      await usersApi.updateProfile({
        employmentStatus: state.employmentStatus || undefined,
        occupation: state.occupation || undefined,
        employer: state.employerName || undefined,
        industry: state.industry || undefined,
        annualIncomeRange: state.annualIncomeRange || undefined,
        sourceOfFunds: state.sourceOfFunds.length > 0 ? state.sourceOfFunds : undefined,
        expectedMonthlyVolume: state.expectedMonthlyVolume || undefined,
      });
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 8 });
      dispatch({ type: "NEXT" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Failed to save financial profile. Please try again.";
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "API_ERROR", message: msg });
    }
  }

  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.finance.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.finance.subtitle")}</p>
      </div>

      <div>
        <SectionLabel>{t("onboarding.finance.employment")}</SectionLabel>
        <div className="space-y-2">
          {empStatuses.map(({ value, key }) => (
            <RadioCard
              key={value}
              selected={state.employmentStatus === value}
              onClick={() => dispatch({ type: "SET", field: "employmentStatus", value })}
            >
              {t(key)}
            </RadioCard>
          ))}
        </div>
        <FieldError msg={state.errors.employmentStatus} />
      </div>

      {showOccupation && (
        <div className="space-y-4">
          <Input
            label={t("onboarding.finance.occupation")}
            value={state.occupation}
            onChange={(e) => dispatch({ type: "SET", field: "occupation", value: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.finance.industry")}</label>
            <select
              value={state.industry}
              onChange={(e) => dispatch({ type: "SET", field: "industry", value: e.target.value })}
              className="w-full border border-[#E3E3E3] rounded-sm px-3 py-2.5 text-sm text-[#333333] focus:outline-none focus:border-[#DB0011] transition-colors"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <Input
            label={t("onboarding.finance.employer")}
            value={state.employerName}
            onChange={(e) => dispatch({ type: "SET", field: "employerName", value: e.target.value })}
          />
        </div>
      )}

      <div>
        <SectionLabel>{t("onboarding.finance.finances")}</SectionLabel>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.finance.income")}</label>
        <div className="space-y-2">
          {INCOME_RANGES.map(({ value, label }) => (
            <RadioCard
              key={value}
              selected={state.annualIncomeRange === value}
              onClick={() => dispatch({ type: "SET", field: "annualIncomeRange", value })}
            >
              {label}
            </RadioCard>
          ))}
        </div>
        <FieldError msg={state.errors.annualIncomeRange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-3">{t("onboarding.finance.sourceFunds")}</label>
        <div className="grid grid-cols-2 gap-2">
          {SOURCE_OPTIONS.map((opt) => {
            const selected = state.sourceOfFunds.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_SOURCE", value: opt })}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 text-sm border rounded-sm transition-colors text-left",
                  selected
                    ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                    : "border-[#E3E3E3] text-[#555555] hover:border-[#BBBBBB]"
                )}
              >
                {selected && <Check size={12} className="flex-shrink-0" />}
                {opt}
              </button>
            );
          })}
        </div>
        <FieldError msg={state.errors.sourceOfFunds} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#333333] mb-2">{t("onboarding.finance.monthlyVol")}</label>
        <div className="space-y-2">
          {MONTHLY_VOLUMES.map(({ value, label }) => (
            <RadioCard
              key={value}
              selected={state.expectedMonthlyVolume === value}
              onClick={() => dispatch({ type: "SET", field: "expectedMonthlyVolume", value })}
            >
              {label}
            </RadioCard>
          ))}
        </div>
        <FieldError msg={state.errors.expectedMonthlyVolume} />
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011]">{state.apiError}</p>
        </div>
      )}

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleNext}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 9 — Identity Documents ───────────────────────────────────────────────

function Stage9({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"choose" | "upload" | "confirm" | "submitted">(
    state.kycSubmitted ? "submitted" : "choose"
  );

  const docTypes = [
    { value: "PASSPORT", key: "onboarding.identity.passport" as const, icon: "🛂" },
    { value: "DRIVING_LICENCE", key: "onboarding.identity.drivingLicence" as const, icon: "🪪" },
    { value: "NATIONAL_ID", key: "onboarding.identity.nationalId" as const, icon: "🪪" },
  ];

  async function handleSubmit() {
    if (!state.idFront || !state.idBack) {
      dispatch({ type: "ERRORS", errors: { docs: t("onboarding.identity.allRequired") } });
      return;
    }
    setPhase("confirm");
  }

  async function handleConfirmSubmit() {
    dispatch({ type: "SUBMITTING", value: true });
    try {
      const fd = new FormData();
      fd.append("documentType", state.docType);
      fd.append("idFront", state.idFront!);
      fd.append("idBack", state.idBack!);
      await kycApi.submit(fd);
      dispatch({ type: "SET", field: "kycSubmitted", value: true });
      dispatch({ type: "SUBMITTING", value: false });
      setPhase("submitted");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Failed to submit documents. Please try again.";
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "API_ERROR", message: msg });
      setPhase("upload");
    }
  }

  if (phase === "submitted") {
    return (
      <section aria-labelledby="stage-title" className="space-y-6 text-center">
        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <div>
          <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.identity.submitted")}</h2>
          <p className="text-sm text-[#767676] mt-2">{t("onboarding.identity.underReview")}</p>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-sm p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Under Review</span>
            </div>
            <p className="text-xs text-amber-600">{t("onboarding.identity.eta")}</p>
          </div>
        </div>
        <Button size="lg" onClick={() => { dispatch({ type: "COMPLETE", step: 9 }); dispatch({ type: "NEXT" }); }}>
          {t("onboarding.identity.continue")} <ChevronRight size={16} className="ml-1" />
        </Button>
      </section>
    );
  }

  if (phase === "confirm") {
    return (
      <section aria-labelledby="stage-title" className="space-y-6">
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.identity.title")}</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{t("onboarding.identity.uploadNotice")}</p>
          </div>
        </div>
        {state.apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
            <p className="text-sm text-[#DB0011]">{state.apiError}</p>
          </div>
        )}
        <div className="space-y-3">
          {[
            { label: "ID Front", file: state.idFront },
            { label: "ID Back", file: state.idBack },
          ].map(({ label, file }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-white border border-[#E3E3E3] rounded-sm">
              <span className="text-sm font-medium text-[#333333]">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#767676]">{file?.name}</span>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            </div>
          ))}
        </div>
        <NavButtons
          onBack={() => setPhase("upload")}
          onNext={handleConfirmSubmit}
          nextLabel={t("onboarding.identity.submitDocs")}
          submitting={state.submitting}
        />
      </section>
    );
  }

  if (phase === "upload") {
    return (
      <section aria-labelledby="stage-title" className="space-y-5">
        <div>
          <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.identity.title")}</h2>
          <p className="text-sm text-[#767676] mt-1">{t("onboarding.identity.subtitle")}</p>
        </div>
        {state.apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
            <p className="text-sm text-[#DB0011]">{state.apiError}</p>
          </div>
        )}
        <FileUploadZone
          label={t("onboarding.identity.idFront")}
          hint={t("onboarding.identity.idFrontHint")}
          accept="image/jpeg,image/png,application/pdf"
          file={state.idFront}
          onChange={(f) => dispatch({ type: "SET", field: "idFront", value: f })}
        />
        <FileUploadZone
          label={t("onboarding.identity.idBack")}
          hint={t("onboarding.identity.idBackHint")}
          accept="image/jpeg,image/png,application/pdf"
          file={state.idBack}
          onChange={(f) => dispatch({ type: "SET", field: "idBack", value: f })}
        />
        <FieldError msg={state.errors.docs} />
        <NavButtons
          onBack={() => setPhase("choose")}
          onNext={handleSubmit}
          nextLabel={t("onboarding.next")}
        />
      </section>
    );
  }

  // phase === "choose"
  return (
    <section aria-labelledby="stage-title" className="space-y-5">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.identity.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.identity.chooseDoc")}</p>
      </div>
      <div className="space-y-3">
        {docTypes.map(({ value, key, icon }) => (
          <RadioCard
            key={value}
            selected={state.docType === value}
            onClick={() => dispatch({ type: "SET", field: "docType", value })}
          >
            <span className="text-xl mr-1">{icon}</span>
            {t(key)}
          </RadioCard>
        ))}
      </div>
      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => {
          if (!state.docType) { dispatch({ type: "ERRORS", errors: { docType: "Please select a document type" } }); return; }
          setPhase("upload");
        }}
        nextLabel={t("onboarding.next")}
      />
      <FieldError msg={state.errors.docType} />
    </section>
  );
}

// ── Stage 10 — Review ──────────────────────────────────────────────────────────

function Stage10({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();

  const personalFields = [
    { label: "Name", value: `${state.firstName} ${state.lastName}` },
    { label: "Date of birth", value: state.dateOfBirth },
    { label: "Gender", value: state.gender || "Not specified" },
    { label: "Nationality", value: COUNTRIES.find((c) => c.code === state.nationality)?.name ?? state.nationality },
  ];

  const contactFields = [
    { label: "Email", value: <span className="flex items-center gap-1">{state.email} <Check size={12} className="text-green-500" /></span> },
    { label: "Phone", value: <span className="flex items-center gap-1">{state.phonePrefix} {state.phoneNumber} <Check size={12} className="text-green-500" /></span> },
  ];

  const addressFields = [
    { label: "Address", value: [state.addressLine1, state.addressLine2, state.city, state.addressState, state.postalCode].filter(Boolean).join(", ") },
    { label: "Country", value: COUNTRIES.find((c) => c.code === state.addressCountry)?.name ?? state.addressCountry },
  ];

  const financeFields = [
    { label: "Employment", value: state.employmentStatus.replace("_", " ") || "—" },
    { label: "Income range", value: INCOME_RANGES.find((r) => r.value === state.annualIncomeRange)?.label ?? "—" },
    { label: "Source of funds", value: state.sourceOfFunds.join(", ") || "—" },
    { label: "Monthly volume", value: MONTHLY_VOLUMES.find((v) => v.value === state.expectedMonthlyVolume)?.label ?? "—" },
  ];

  const docsFields = [
    { label: "Document type", value: state.docType.replace(/_/g, " ") || "—" },
    { label: "Status", value: <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12} />Submitted</span> },
  ];

  return (
    <section aria-labelledby="stage-title" className="space-y-5">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.review.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.review.subtitle")}</p>
      </div>

      <ReviewCard title={t("onboarding.review.personalInfo")} fields={personalFields} onEdit={() => dispatch({ type: "GO_TO", step: 3 })} />
      <ReviewCard title={t("onboarding.review.contactInfo")} fields={contactFields} />
      <ReviewCard title={t("onboarding.review.address")} fields={addressFields} onEdit={() => dispatch({ type: "GO_TO", step: 7 })} />
      <ReviewCard title={t("onboarding.review.employment")} fields={financeFields} onEdit={() => dispatch({ type: "GO_TO", step: 8 })} />
      <ReviewCard title={t("onboarding.review.documents")} fields={docsFields} onEdit={() => dispatch({ type: "GO_TO", step: 9 })} />

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => { dispatch({ type: "COMPLETE", step: 10 }); dispatch({ type: "NEXT" }); }}
        nextLabel={t("onboarding.next")}
      />
    </section>
  );
}

// ── Stage 11 — Legal Consent ───────────────────────────────────────────────────

function Stage11({
  state, dispatch,
}: { state: WizardState; dispatch: React.Dispatch<WizardAction> }) {
  const { t } = useLanguage();

  async function handleNext() {
    if (!state.termsAccepted || !state.infoAccurate) {
      dispatch({ type: "ERRORS", errors: { consent: t("onboarding.consent.required") } });
      return;
    }
    dispatch({ type: "SUBMITTING", value: true });
    try {
      await usersApi.updateProfile({
        termsAcceptedAt: new Date().toISOString(),
        marketingConsent: state.marketingConsent,
        electronicStatementsConsent: state.electronicStatementsConsent,
        dataProcessingConsent: state.dataProcessingConsent,
        onboardingStep: 12,
      });
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 11 });
      dispatch({ type: "NEXT" });
    } catch {
      dispatch({ type: "SUBMITTING", value: false });
      dispatch({ type: "COMPLETE", step: 11 });
      dispatch({ type: "NEXT" });
    }
  }

  const required = [
    { field: "termsAccepted" as const, key: "onboarding.consent.terms" as const },
    { field: "infoAccurate" as const, key: "onboarding.consent.accurate" as const },
  ];

  const optional = [
    { field: "marketingConsent" as const, key: "onboarding.consent.marketing" as const },
    { field: "electronicStatementsConsent" as const, key: "onboarding.consent.electronic" as const },
    { field: "dataProcessingConsent" as const, key: "onboarding.consent.dataProcessing" as const },
  ];

  return (
    <section aria-labelledby="stage-title" className="space-y-6">
      <div>
        <h2 id="stage-title" className="text-xl font-semibold text-[#222222]">{t("onboarding.consent.title")}</h2>
        <p className="text-sm text-[#767676] mt-1">{t("onboarding.consent.subtitle")}</p>
      </div>

      {state.apiError && (
        <div className="bg-red-50 border-l-4 border-[#DB0011] p-3 rounded-sm" role="alert">
          <p className="text-sm text-[#DB0011]">{state.apiError}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">Required</p>
        {required.map(({ field, key }) => (
          <label key={field} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state[field]}
              onChange={(e) => dispatch({ type: "SET", field, value: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#DB0011] flex-shrink-0"
            />
            <span className="text-sm text-[#333333]">{t(key)}</span>
          </label>
        ))}
        {state.errors.consent && (
          <p className="text-xs text-[#DB0011]" role="alert">{state.errors.consent}</p>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-[#F0F0F0]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">{t("onboarding.consent.optional")}</p>
        {optional.map(({ field, key }) => (
          <label key={field} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state[field]}
              onChange={(e) => dispatch({ type: "SET", field, value: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#DB0011] flex-shrink-0"
            />
            <span className="text-sm text-[#767676]">{t(key)}</span>
          </label>
        ))}
      </div>

      <NavButtons
        onBack={() => dispatch({ type: "BACK" })}
        onNext={handleNext}
        nextLabel={t("onboarding.next")}
        submitting={state.submitting}
      />
    </section>
  );
}

// ── Stage 12 — Success ─────────────────────────────────────────────────────────

function Stage12({ state }: { state: WizardState }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState(state.accountNumber);
  const [sortCode, setSortCode] = useState(state.sortCode);

  useEffect(() => {
    clearProgress();
    if (!accountNumber) {
      accountsApi.list().then((res) => {
        const accounts = res.data.data as { type: string; accountNumber?: string; sortCode?: string }[];
        const current = accounts.find((a) => a.type === "CURRENT") ?? accounts[0];
        if (current) {
          setAccountNumber(current.accountNumber ?? "");
          setSortCode(current.sortCode ?? "");
        }
      }).catch(() => { /* ignore */ });
    }
  }, [accountNumber]);

  const statuses = [
    { key: "onboarding.success.accountCreated" as const, done: true },
    { key: "onboarding.success.emailVerified" as const, done: true },
    { key: "onboarding.success.docsSubmitted" as const, done: true },
    { key: "onboarding.success.reviewPending" as const, done: false },
  ];

  return (
    <section aria-labelledby="stage-title" className="space-y-6 text-center">
      <div>
        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 id="stage-title" className="text-2xl font-bold text-[#222222]">
          {t("onboarding.success.welcome")}, {state.userFirstName || state.firstName}!
        </h2>
        <p className="text-sm text-[#767676] mt-2">{t("onboarding.success.created")}</p>
      </div>

      <div className="bg-white border border-[#E3E3E3] rounded-sm p-5 text-left space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">{t("onboarding.success.status")}</p>
        {statuses.map(({ key, done }) => (
          <div key={key} className="flex items-center gap-3">
            {done ? (
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
            ) : (
              <Clock size={16} className="text-amber-500 flex-shrink-0" />
            )}
            <div>
              <span className="text-sm text-[#333333]">{t(key)}</span>
              {!done && (
                <p className="text-xs text-[#767676]">{t("onboarding.success.eta")}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(accountNumber || sortCode) && (
        <div className="bg-[#F8F8F8] rounded-sm p-5 text-left space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA]">{t("onboarding.success.yourAccount")}</p>
          {accountNumber && (
            <div className="flex justify-between">
              <span className="text-sm text-[#767676]">{t("onboarding.success.accountNumber")}</span>
              <span className="text-sm font-semibold text-[#333333] font-mono">{accountNumber}</span>
            </div>
          )}
          {sortCode && (
            <div className="flex justify-between">
              <span className="text-sm text-[#767676]">{t("onboarding.success.sortCode")}</span>
              <span className="text-sm font-semibold text-[#333333] font-mono">{sortCode}</span>
            </div>
          )}
        </div>
      )}

      <Button size="lg" onClick={() => router.push("/dashboard")} className="w-full">
        {t("onboarding.success.dashboard")} <ChevronRight size={16} className="ml-1" />
      </Button>
    </section>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [resumeData, setResumeData] = useState<Partial<WizardState> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.step && saved.step > 1 && saved.step < 12) {
      setResumeData(saved);
    }
  }, []);

  useEffect(() => {
    if (state.step > 1 && state.step < 12) {
      saveProgress(state);
    }
  }, [state]);

  function handleResume() {
    if (resumeData) {
      dispatch({ type: "RESTORE", data: resumeData });
    }
    setResumeData(null);
  }

  function handleStartOver() {
    clearProgress();
    setResumeData(null);
  }

  if (resumeData) {
    return (
      <div className="bg-white border border-[#E3E3E3] rounded-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#222222]">Continue where you left off?</h2>
        <p className="text-sm text-[#767676]">Your progress has been saved.</p>
        <div className="flex gap-3">
          <button
            onClick={handleStartOver}
            className="flex-1 py-3 text-sm font-semibold text-[#555555] border border-[#E3E3E3] rounded-sm hover:bg-[#F8F8F8] transition-colors"
          >
            Start over
          </button>
          <Button onClick={handleResume} className="flex-[2]">Resume</Button>
        </div>
      </div>
    );
  }

  const isSuccess = state.step === 12;

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm overflow-hidden">
      {!isSuccess && (
        <div className="border-b border-[#E3E3E3] px-6 py-4 bg-[#FAFAFA]">
          <OnboardingProgress currentStep={state.step} completedSteps={state.completedSteps} />
        </div>
      )}

      <div className="px-6 py-6">
        {state.step === 1 && <Stage1 onNext={() => { dispatch({ type: "COMPLETE", step: 1 }); dispatch({ type: "NEXT" }); }} />}
        {state.step === 2 && <Stage2 state={state} dispatch={dispatch} />}
        {state.step === 3 && <Stage3 state={state} dispatch={dispatch} />}
        {state.step === 4 && <Stage4 state={state} dispatch={dispatch} />}
        {state.step === 5 && <Stage5 state={state} dispatch={dispatch} />}
        {state.step === 7 && <Stage7 state={state} dispatch={dispatch} />}
        {state.step === 8 && <Stage8 state={state} dispatch={dispatch} />}
        {state.step === 9 && <Stage9 state={state} dispatch={dispatch} />}
        {state.step === 10 && <Stage10 state={state} dispatch={dispatch} />}
        {state.step === 11 && <Stage11 state={state} dispatch={dispatch} />}
        {state.step === 12 && <Stage12 state={state} />}
      </div>

      {!isSuccess && (
        <div className="border-t border-[#E3E3E3] bg-[#FAFAFA] px-6 py-3">
          <p className="text-xs text-[#AAAAAA] flex items-center gap-2">
            <Lock size={11} />
            256-bit TLS encryption · FCA regulated · FSCS protected up to £85,000
          </p>
        </div>
      )}
    </div>
  );
}
