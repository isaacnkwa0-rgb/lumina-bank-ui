"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { loansApi, type Loan } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, User, Briefcase,
  DollarSign, FileText, Eye, Loader2, X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type PersonalData = {
  firstName: string; lastName: string; dateOfBirth: string;
  nationality: string; maritalStatus: string;
  addressLine1: string; addressLine2: string; city: string;
  postcode: string; yearsAtAddress: string; phone: string;
};

type EmploymentData = {
  employmentStatus: string; employerName: string; jobTitle: string;
  employmentStartDate: string; monthlyIncome: string;
  otherIncome: string; otherIncomeSource: string;
};

type FinancialData = {
  monthlyRent: string; monthlyLiving: string; monthlyDebt: string;
  existingLoans: string; creditCardBalance: string;
  bankruptcyHistory: string; creditConsent: string;
};

type DocumentsData = {
  idType: string; idNote: string;
  addressProofNote: string; incomeProofNote: string;
};

type AllData = {
  personal: PersonalData;
  employment: EmploymentData;
  financial: FinancialData;
  documents: DocumentsData;
};

const STEPS = [
  { id: 1, title: "Personal Information",   icon: User       },
  { id: 2, title: "Employment & Income",     icon: Briefcase  },
  { id: 3, title: "Financial Background",    icon: DollarSign },
  { id: 4, title: "Documents",              icon: FileText   },
  { id: 5, title: "Review & Submit",         icon: Eye        },
];

const EMPLOYMENT_STATUSES = [
  "Full-time employed", "Part-time employed", "Self-employed",
  "Contractor / Freelancer", "Retired", "Student", "Unemployed",
];

const MARITAL_STATUSES = ["Single", "Married", "Civil Partnership", "Divorced", "Widowed", "Separated"];

const ID_TYPES = ["Passport", "UK Driving Licence", "National ID Card", "Residence Permit"];

// ── Field helpers ──────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#555] mb-1.5">{children}</label>;
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
      />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        {...props}
        className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
              value === o.value
                ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                : "border-[#E8E8E8] text-[#555] hover:border-[#CCCCCC]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────────────────

function PersonalStep({ data, onChange }: { data: PersonalData; onChange: (d: PersonalData) => void }) {
  const u = (field: keyof PersonalData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={data.firstName} onChange={u("firstName")} placeholder="John" />
        <Input label="Last name" value={data.lastName} onChange={u("lastName")} placeholder="Smith" />
      </div>
      <Input label="Date of birth" type="date" value={data.dateOfBirth} onChange={u("dateOfBirth")} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Nationality" options={["British", "Irish", "EU National", "Other"]} value={data.nationality} onChange={u("nationality")} />
        <Select label="Marital status" options={MARITAL_STATUSES} value={data.maritalStatus} onChange={u("maritalStatus")} />
      </div>
      <Input label="Phone number" type="tel" value={data.phone} onChange={u("phone")} placeholder="+44 7700 000000" />
      <div className="pt-1 border-t border-[#F0F0F0]">
        <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">Current Address</p>
        <div className="space-y-3">
          <Input label="Address line 1" value={data.addressLine1} onChange={u("addressLine1")} placeholder="123 High Street" />
          <Input label="Address line 2 (optional)" value={data.addressLine2} onChange={u("addressLine2")} placeholder="Flat 4B" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City / Town" value={data.city} onChange={u("city")} placeholder="London" />
            <Input label="Postcode" value={data.postcode} onChange={u("postcode")} placeholder="SW1A 1AA" />
          </div>
          <Select label="Years at this address" options={["Less than 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"]} value={data.yearsAtAddress} onChange={u("yearsAtAddress")} />
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ data, onChange }: { data: EmploymentData; onChange: (d: EmploymentData) => void }) {
  const u = (field: keyof EmploymentData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });
  const isEmployed = ["Full-time employed", "Part-time employed", "Self-employed", "Contractor / Freelancer"].includes(data.employmentStatus);

  return (
    <div className="space-y-4">
      <Select label="Employment status" options={EMPLOYMENT_STATUSES} value={data.employmentStatus} onChange={u("employmentStatus")} />
      {isEmployed && (
        <>
          <Input label="Employer / Company name" value={data.employerName} onChange={u("employerName")} placeholder="Acme Ltd" />
          <Input label="Job title" value={data.jobTitle} onChange={u("jobTitle")} placeholder="Software Engineer" />
          <Input label="Employment start date" type="date" value={data.employmentStartDate} onChange={u("employmentStartDate")} />
        </>
      )}
      <div>
        <Label>Monthly net income (after tax) £</Label>
        <input
          type="number"
          min="0"
          value={data.monthlyIncome}
          onChange={u("monthlyIncome")}
          placeholder="e.g. 3500"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
        />
      </div>
      <div>
        <Label>Other monthly income £ (optional)</Label>
        <input
          type="number"
          min="0"
          value={data.otherIncome}
          onChange={u("otherIncome")}
          placeholder="e.g. 500"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
        />
      </div>
      {Number(data.otherIncome) > 0 && (
        <Input label="Source of other income" value={data.otherIncomeSource} onChange={u("otherIncomeSource")} placeholder="e.g. Rental income, investments" />
      )}
    </div>
  );
}

function FinancialStep({ data, onChange }: { data: FinancialData; onChange: (d: FinancialData) => void }) {
  const u = (field: keyof FinancialData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#767676]">Please provide your monthly outgoings and existing financial commitments.</p>
      <div>
        <Label>Monthly rent / mortgage £</Label>
        <input type="number" min="0" value={data.monthlyRent} onChange={u("monthlyRent")} placeholder="e.g. 1200"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
      </div>
      <div>
        <Label>Monthly living expenses £ (food, bills, transport)</Label>
        <input type="number" min="0" value={data.monthlyLiving} onChange={u("monthlyLiving")} placeholder="e.g. 800"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
      </div>
      <div>
        <Label>Existing loan / debt repayments per month £</Label>
        <input type="number" min="0" value={data.monthlyDebt} onChange={u("monthlyDebt")} placeholder="e.g. 300"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
      </div>
      <div>
        <Label>Total outstanding loans £ (excluding mortgages)</Label>
        <input type="number" min="0" value={data.existingLoans} onChange={u("existingLoans")} placeholder="e.g. 5000"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
      </div>
      <div>
        <Label>Total credit card balances £</Label>
        <input type="number" min="0" value={data.creditCardBalance} onChange={u("creditCardBalance")} placeholder="e.g. 2000"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
      </div>
      <RadioGroup
        label="Have you ever been declared bankrupt or had a CCJ?"
        options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
        value={data.bankruptcyHistory}
        onChange={(v) => onChange({ ...data, bankruptcyHistory: v })}
      />
      <div className="bg-[#F8F8F8] rounded-xl p-3.5">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="creditConsent"
            checked={data.creditConsent === "yes"}
            onChange={(e) => onChange({ ...data, creditConsent: e.target.checked ? "yes" : "no" })}
            className="mt-0.5 accent-[#DB0011]"
          />
          <label htmlFor="creditConsent" className="text-xs text-[#555] leading-relaxed cursor-pointer">
            I consent to Lumina Bank performing a soft credit check to assess my loan application. This will not affect my credit score.
          </label>
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({ data, onChange }: { data: DocumentsData; onChange: (d: DocumentsData) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[#767676]">
        The following documents will be required. You can note what you have available — a secure upload link will be sent to your email.
      </p>

      <div className="space-y-3">
        {[
          {
            title: "Photo ID",
            desc: "Passport, driving licence, or national ID card",
            field: "idType" as keyof DocumentsData,
            noteField: "idNote" as keyof DocumentsData,
            options: ID_TYPES,
          },
          {
            title: "Proof of address",
            desc: "Utility bill or bank statement (dated within 3 months)",
            field: null,
            noteField: "addressProofNote" as keyof DocumentsData,
            options: [],
          },
          {
            title: "Proof of income",
            desc: "Last 3 payslips or 2 years of accounts (self-employed)",
            field: null,
            noteField: "incomeProofNote" as keyof DocumentsData,
            options: [],
          },
        ].map(({ title, desc, field, noteField, options }) => (
          <div key={title} className="bg-white border border-[#E8E8E8] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-[#DB0011]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333]">{title}</p>
                <p className="text-[11px] text-[#AAAAAA]">{desc}</p>
              </div>
            </div>
            {field && options.length > 0 && (
              <Select
                label="Document type"
                options={options}
                value={data[field]}
                onChange={(e) => onChange({ ...data, [field]: e.target.value })}
              />
            )}
            <div className="mt-2">
              <Label>Notes (optional)</Label>
              <input
                type="text"
                value={data[noteField]}
                onChange={(e) => onChange({ ...data, [noteField]: e.target.value })}
                placeholder="e.g. I have a UK passport ready"
                className="w-full px-3 py-2 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011]"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
        <p className="text-xs text-blue-700 font-medium">
          After submitting your application, you&apos;ll receive a secure email link to upload your documents through our verified portal.
        </p>
      </div>
    </div>
  );
}

function ReviewStep({ loan, allData }: { loan: Loan; allData: AllData }) {
  const sections = [
    {
      title: "Loan Details",
      rows: [
        ["Type", loan.type + " Loan"],
        ["Amount", formatCurrency(Number(loan.principalAmount))],
        ["Term", `${loan.termMonths} months`],
        ["Monthly payment", formatCurrency(Number(loan.monthlyPayment))],
        ["Reference", loan.referenceNumber ?? "—"],
      ],
    },
    {
      title: "Personal Information",
      rows: [
        ["Full name", `${allData.personal.firstName} ${allData.personal.lastName}`],
        ["Date of birth", allData.personal.dateOfBirth],
        ["Nationality", allData.personal.nationality],
        ["Phone", allData.personal.phone],
        ["Address", [allData.personal.addressLine1, allData.personal.addressLine2, allData.personal.city, allData.personal.postcode].filter(Boolean).join(", ")],
      ],
    },
    {
      title: "Employment & Income",
      rows: [
        ["Status", allData.employment.employmentStatus],
        ["Employer", allData.employment.employerName || "—"],
        ["Job title", allData.employment.jobTitle || "—"],
        ["Monthly income", allData.employment.monthlyIncome ? `£${Number(allData.employment.monthlyIncome).toLocaleString()}` : "—"],
        ["Other income", allData.employment.otherIncome ? `£${Number(allData.employment.otherIncome).toLocaleString()}` : "None"],
      ],
    },
    {
      title: "Financial Background",
      rows: [
        ["Monthly rent/mortgage", allData.financial.monthlyRent ? `£${Number(allData.financial.monthlyRent).toLocaleString()}` : "—"],
        ["Monthly living expenses", allData.financial.monthlyLiving ? `£${Number(allData.financial.monthlyLiving).toLocaleString()}` : "—"],
        ["Existing debt repayments", allData.financial.monthlyDebt ? `£${Number(allData.financial.monthlyDebt).toLocaleString()}/mo` : "None"],
        ["Outstanding loans", allData.financial.existingLoans ? `£${Number(allData.financial.existingLoans).toLocaleString()}` : "None"],
        ["Bankruptcy history", allData.financial.bankruptcyHistory === "yes" ? "Yes" : "No"],
        ["Credit check consent", allData.financial.creditConsent === "yes" ? "Given" : "Not given"],
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-2">
        <p className="text-xs text-blue-700 font-medium">
          Please review all information before submitting. Once submitted your application will move to full review by our underwriting team.
        </p>
      </div>
      {sections.map(({ title, rows }) => (
        <div key={title} className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#E8E8E8]">
            <p className="text-xs font-bold text-[#555] uppercase tracking-wide">{title}</p>
          </div>
          <div className="divide-y divide-[#F8F8F8]">
            {rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span className="text-[#767676] text-xs">{label}</span>
                <span className="font-semibold text-[#333] text-xs text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LoanContinuePage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [personal, setPersonal] = useState<PersonalData>({
    firstName: "", lastName: "", dateOfBirth: "", nationality: "", maritalStatus: "",
    addressLine1: "", addressLine2: "", city: "", postcode: "", yearsAtAddress: "", phone: "",
  });
  const [employment, setEmployment] = useState<EmploymentData>({
    employmentStatus: "", employerName: "", jobTitle: "", employmentStartDate: "",
    monthlyIncome: "", otherIncome: "", otherIncomeSource: "",
  });
  const [financial, setFinancial] = useState<FinancialData>({
    monthlyRent: "", monthlyLiving: "", monthlyDebt: "", existingLoans: "",
    creditCardBalance: "", bankruptcyHistory: "", creditConsent: "",
  });
  const [documents, setDocuments] = useState<DocumentsData>({
    idType: "", idNote: "", addressProofNote: "", incomeProofNote: "",
  });

  const load = useCallback(async () => {
    try {
      const res = await loansApi.getApplicationData(loanId);
      setLoan(res.data.data.loan);
      const saved = res.data.data.applicationData as Partial<AllData>;
      if (saved?.personal) setPersonal((p) => ({ ...p, ...saved.personal }));
      if (saved?.employment) setEmployment((e) => ({ ...e, ...saved.employment }));
      if (saved?.financial) setFinancial((f) => ({ ...f, ...saved.financial }));
      if (saved?.documents) setDocuments((d) => ({ ...d, ...saved.documents }));
      if (res.data.data.loan.applicationStep && res.data.data.loan.applicationStep > 1) {
        setCurrentStep(Math.min(res.data.data.loan.applicationStep, 5));
      }
    } catch {
      setError("Could not load your application. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => { load(); }, [load]);

  async function saveAndNext() {
    setSaving(true);
    setError("");
    const stepData: Record<string, unknown> = {};
    if (currentStep === 1) stepData.personal = personal;
    if (currentStep === 2) stepData.employment = employment;
    if (currentStep === 3) stepData.financial = financial;
    if (currentStep === 4) stepData.documents = documents;
    try {
      await loansApi.saveDraft(loanId, currentStep + 1, stepData);
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await loansApi.submitApplication(loanId);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center">
        <Loader2 size={32} className="animate-spin text-[#DB0011] mb-4" />
        <p className="text-sm text-[#767676]">Loading your application…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#333] mb-2">Application Submitted</h2>
        <p className="text-[#767676] text-sm mb-6">
          Your full application is now under review by our underwriting team. You&apos;ll receive a decision within 3–5 business days.
        </p>
        {loan?.referenceNumber && (
          <div className="w-full bg-[#F8F8F8] rounded-2xl p-4 mb-6 text-center">
            <p className="text-xs text-[#AAAAAA] mb-1">Reference number</p>
            <p className="text-base font-bold font-mono text-[#333]">{loan.referenceNumber}</p>
          </div>
        )}
        <button
          onClick={() => router.push("/loans")}
          className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors"
        >
          Return to Loans
        </button>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <p className="text-[#DB0011] text-sm">{error || "Loan not found."}</p>
        <button onClick={() => router.push("/loans")} className="mt-4 text-sm text-[#767676] underline">Back to Loans</button>
      </div>
    );
  }

  const allData: AllData = { personal, employment, financial, documents };
  const step = STEPS[currentStep - 1];
  const StepIcon = step.icon;
  const isLast = currentStep === STEPS.length;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-5 pb-10 text-white">
        <button
          onClick={() => currentStep > 1 ? setCurrentStep((s) => s - 1) : router.push("/loans")}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
            {loan.type} Loan · {formatCurrency(Number(loan.principalAmount))}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Complete Application</h1>
        <p className="text-white/60 text-sm">Step {currentStep} of {STEPS.length} — {step.title}</p>
      </div>

      <div className="px-4 -mt-6">
        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s.id < currentStep ? "bg-[#DB0011]" : s.id === currentStep ? "bg-[#DB0011]/50" : "bg-[#E8E8E8]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <StepIcon size={14} className="text-[#DB0011]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#333]">{step.title}</p>
              <p className="text-[10px] text-[#AAAAAA]">{currentStep} of {STEPS.length} steps completed</p>
            </div>
            {loan.referenceNumber && (
              <span className="ml-auto text-[10px] font-mono text-[#AAAAAA]">{loan.referenceNumber}</span>
            )}
          </div>
        </div>

        {/* Step form card */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <StepIcon size={16} className="text-[#DB0011]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#333]">{step.title}</p>
              <p className="text-[11px] text-[#AAAAAA]">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>

          {currentStep === 1 && <PersonalStep data={personal} onChange={setPersonal} />}
          {currentStep === 2 && <EmploymentStep data={employment} onChange={setEmployment} />}
          {currentStep === 3 && <FinancialStep data={financial} onChange={setFinancial} />}
          {currentStep === 4 && <DocumentsStep data={documents} onChange={setDocuments} />}
          {currentStep === 5 && <ReviewStep loan={loan} allData={allData} />}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <X size={14} className="text-[#DB0011] flex-shrink-0" />
            <p className="text-sm text-[#DB0011]">{error}</p>
          </div>
        )}

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || financial.creditConsent !== "yes"}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit Full Application"}
          </button>
        ) : (
          <button
            onClick={saveAndNext}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <>Save & Continue <ArrowRight size={16} /></>}
          </button>
        )}

        {financial.creditConsent !== "yes" && isLast && (
          <p className="text-[11px] text-[#AAAAAA] text-center mt-2">You must consent to a soft credit check before submitting.</p>
        )}

        <p className="text-[11px] text-[#AAAAAA] text-center mt-3 pb-2">
          Your progress is saved automatically. You can return to complete this later.
        </p>
      </div>
    </div>
  );
}
