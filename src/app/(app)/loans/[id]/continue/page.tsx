"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { loansApi, type Loan } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, User, Briefcase,
  DollarSign, FileText, Eye, Loader2, X, Upload, CheckCircle, Shield,
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
  idType: string; idNote: string; idDocumentUrl: string;
  addressProofNote: string; addressProofUrl: string;
  incomeProofNote: string; incomeProofUrl: string;
};

type GuarantorData = {
  fullName: string; relationship: string; email: string; phone: string;
  addressLine1: string; city: string; postcode: string;
  employmentStatus: string; monthlyIncome: string;
};

type AllData = {
  personal: PersonalData;
  employment: EmploymentData;
  financial: FinancialData;
  documents: DocumentsData;
  guarantor: GuarantorData;
};

const STEPS = [
  { id: 1, title: "Personal Information",   icon: User      },
  { id: 2, title: "Employment & Income",    icon: Briefcase },
  { id: 3, title: "Financial Background",   icon: DollarSign },
  { id: 4, title: "Documents",             icon: FileText   },
  { id: 5, title: "Guarantor",             icon: Shield     },
  { id: 6, title: "Review & Submit",        icon: Eye        },
];

const EMPLOYMENT_STATUSES = [
  "Full-time employed", "Part-time employed", "Self-employed",
  "Contractor / Freelancer", "Retired", "Student", "Unemployed",
];

const MARITAL_STATUSES = ["Single", "Married", "Civil Partnership", "Divorced", "Widowed", "Separated"];

const NATIONALITIES = [
  "Afghan","Albanian","Algerian","American","Andorran","Angolan","Antiguan","Argentine","Armenian",
  "Australian","Austrian","Azerbaijani","Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian",
  "Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian","Botswanan","Brazilian","Bruneian",
  "Bulgarian","Burkinabe","Burundian","Cambodian","Cameroonian","Canadian","Cape Verdean","Central African",
  "Chadian","Chilean","Chinese","Colombian","Comoran","Congolese","Costa Rican","Croatian","Cuban",
  "Cypriot","Czech","Danish","Djiboutian","Dominican","Dutch","East Timorese","Ecuadorian","Egyptian",
  "Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian","Fijian","Finnish","French","Gabonese",
  "Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Guinea-Bissauan",
  "Guyanese","Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish",
  "Israeli","Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakhstani","Kenyan","Kiribatian",
  "Kuwaiti","Kyrgyzstani","Laotian","Latvian","Lebanese","Lesothan","Liberian","Libyan","Liechtensteiner",
  "Lithuanian","Luxembourgish","Macedonian","Malagasy","Malawian","Malaysian","Maldivian","Malian",
  "Maltese","Marshallese","Mauritanian","Mauritian","Mexican","Micronesian","Moldovan","Monacan",
  "Mongolian","Montenegrin","Moroccan","Mozambican","Namibian","Nauruan","Nepalese","New Zealander",
  "Nicaraguan","Nigerian","Nigerien","Norwegian","Omani","Pakistani","Palauan","Palestinian","Panamanian",
  "Papua New Guinean","Paraguayan","Peruvian","Philippine","Polish","Portuguese","Qatari","Romanian",
  "Russian","Rwandan","Saint Kitts and Nevis","Saint Lucian","Saint Vincentian","Samoan","San Marinese",
  "Sao Tomean","Saudi","Senegalese","Serbian","Seychellois","Sierra Leonean","Singaporean","Slovak",
  "Slovenian","Solomon Islander","Somali","South African","South Korean","South Sudanese","Spanish",
  "Sri Lankan","Sudanese","Surinamese","Swazi","Swedish","Swiss","Syrian","Taiwanese","Tajikistani",
  "Tanzanian","Thai","Togolese","Tongan","Trinidadian","Tunisian","Turkish","Turkmen","Tuvaluan",
  "Ugandan","Ukrainian","Uruguayan","Uzbekistani","Vanuatuan","Venezuelan","Vietnamese","Yemeni",
  "Zambian","Zimbabwean","British","Other",
];
const ID_TYPES = ["Passport", "Driving Licence", "National ID Card", "Residence Permit", "Other Government ID"];
const RELATIONSHIPS = ["Parent", "Sibling", "Spouse / Partner", "Friend", "Colleague", "Other"];

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
        <Select label="Nationality" options={NATIONALITIES} value={data.nationality} onChange={u("nationality")} />
        <Select label="Marital status" options={MARITAL_STATUSES} value={data.maritalStatus} onChange={u("maritalStatus")} />
      </div>
      <Input label="Phone number" type="tel" value={data.phone} onChange={u("phone")} placeholder="+1 555 000 0000" />
      <div className="pt-1 border-t border-[#F0F0F0]">
        <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">Current Address</p>
        <div className="space-y-3">
          <Input label="Address line 1" value={data.addressLine1} onChange={u("addressLine1")} placeholder="123 Main Street" />
          <Input label="Address line 2 (optional)" value={data.addressLine2} onChange={u("addressLine2")} placeholder="Apt 4B" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City / Town" value={data.city} onChange={u("city")} placeholder="City" />
            <Input label="Postal code" value={data.postcode} onChange={u("postcode")} placeholder="Postal code" />
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

  const isTraditionalEmployee = ["Full-time employed", "Part-time employed"].includes(data.employmentStatus);
  const isSelfEmployed = ["Self-employed", "Contractor / Freelancer"].includes(data.employmentStatus);
  const isRetired = data.employmentStatus === "Retired";
  const isStudent = data.employmentStatus === "Student";

  const incomeLabel =
    isRetired ? "Monthly pension income £" :
    isStudent ? "Monthly income / allowance £" :
    data.employmentStatus === "Unemployed" ? "Any monthly income £ (optional)" :
    "Monthly net income (after tax) £";

  return (
    <div className="space-y-4">
      <Select label="Employment status" options={EMPLOYMENT_STATUSES} value={data.employmentStatus} onChange={u("employmentStatus")} />

      {isTraditionalEmployee && (
        <>
          <Input label="Employer / Company name" value={data.employerName} onChange={u("employerName")} placeholder="Acme Ltd" />
          <Input label="Job title" value={data.jobTitle} onChange={u("jobTitle")} placeholder="Software Engineer" />
          <Input label="Employment start date" type="date" value={data.employmentStartDate} onChange={u("employmentStartDate")} />
        </>
      )}

      {isSelfEmployed && (
        <>
          <Input label="Trading / business name (optional)" value={data.employerName} onChange={u("employerName")} placeholder="Smith Consulting" />
          <Input label="Nature of work / service" value={data.jobTitle} onChange={u("jobTitle")} placeholder="IT Consulting" />
          <Input label="Self-employment start date" type="date" value={data.employmentStartDate} onChange={u("employmentStartDate")} />
        </>
      )}

      {isRetired && (
        <Input label="Pension provider (optional)" value={data.employerName} onChange={u("employerName")} placeholder="e.g. Aviva, NHS Pension" />
      )}

      {isStudent && (
        <Input label="Institution / University (optional)" value={data.employerName} onChange={u("employerName")} placeholder="e.g. MIT, University of Toronto" />
      )}

      <div>
        <Label>{incomeLabel}</Label>
        <input
          type="number" min="0" value={data.monthlyIncome} onChange={u("monthlyIncome")}
          placeholder="e.g. 3500"
          className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
        />
      </div>

      <div>
        <Label>Other monthly income £ (optional)</Label>
        <input
          type="number" min="0" value={data.otherIncome} onChange={u("otherIncome")}
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
      {(["monthlyRent", "monthlyLiving", "monthlyDebt", "existingLoans", "creditCardBalance"] as const).map(field => {
        const labels: Record<string, string> = {
          monthlyRent: "Monthly rent / mortgage £",
          monthlyLiving: "Monthly living expenses £ (food, bills, transport)",
          monthlyDebt: "Existing loan / debt repayments per month £",
          existingLoans: "Total outstanding loans £ (excluding mortgages)",
          creditCardBalance: "Total credit card balances £",
        };
        const placeholders: Record<string, string> = {
          monthlyRent: "e.g. 1200", monthlyLiving: "e.g. 800", monthlyDebt: "e.g. 300",
          existingLoans: "e.g. 5000", creditCardBalance: "e.g. 2000",
        };
        return (
          <div key={field}>
            <Label>{labels[field]}</Label>
            <input type="number" min="0" value={data[field]} onChange={u(field)} placeholder={placeholders[field]}
              className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20" />
          </div>
        );
      })}
      <RadioGroup
        label="Have you ever been declared bankrupt or had a court judgment against you?"
        options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
        value={data.bankruptcyHistory}
        onChange={(v) => onChange({ ...data, bankruptcyHistory: v })}
      />
      <div className="bg-[#F8F8F8] rounded-xl p-3.5">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox" id="creditConsent"
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

type UploadStates = {
  idDocument: "idle" | "uploading" | "done" | "error";
  addressProof: "idle" | "uploading" | "done" | "error";
  incomeProof: "idle" | "uploading" | "done" | "error";
};

function DocumentsStep({
  data, onChange, loanId, onUpload,
}: {
  data: DocumentsData;
  onChange: (d: DocumentsData) => void;
  loanId: string;
  onUpload: (docType: "idDocument" | "addressProof" | "incomeProof", file: File) => Promise<void>;
}) {
  const [uploadStates, setUploadStates] = useState<UploadStates>({
    idDocument: data.idDocumentUrl ? "done" : "idle",
    addressProof: data.addressProofUrl ? "done" : "idle",
    incomeProof: data.incomeProofUrl ? "done" : "idle",
  });

  const idRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const incomeRef = useRef<HTMLInputElement>(null);

  const refs = { idDocument: idRef, addressProof: addrRef, incomeProof: incomeRef };

  async function handleFile(docType: "idDocument" | "addressProof" | "incomeProof", file: File) {
    setUploadStates(s => ({ ...s, [docType]: "uploading" }));
    try {
      await onUpload(docType, file);
      setUploadStates(s => ({ ...s, [docType]: "done" }));
    } catch {
      setUploadStates(s => ({ ...s, [docType]: "error" }));
    }
  }

  const docs = [
    {
      key: "idDocument" as const,
      title: "Photo ID",
      desc: "Passport, driving licence, or national ID card",
      urlField: "idDocumentUrl" as keyof DocumentsData,
      noteField: "idNote" as keyof DocumentsData,
      showTypeSelect: true,
      ref: idRef,
    },
    {
      key: "addressProof" as const,
      title: "Proof of address",
      desc: "Utility bill or bank statement (dated within 3 months)",
      urlField: "addressProofUrl" as keyof DocumentsData,
      noteField: "addressProofNote" as keyof DocumentsData,
      showTypeSelect: false,
      ref: addrRef,
    },
    {
      key: "incomeProof" as const,
      title: "Proof of income",
      desc: "Last 3 payslips or 2 years of accounts (self-employed)",
      urlField: "incomeProofUrl" as keyof DocumentsData,
      noteField: "incomeProofNote" as keyof DocumentsData,
      showTypeSelect: false,
      ref: incomeRef,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#767676]">Upload your documents below. Accepted formats: JPG, PNG, PDF (max 10MB each).</p>

      {docs.map(({ key, title, desc, urlField, noteField, showTypeSelect, ref }) => {
        const state = uploadStates[key];
        const url = data[urlField] as string;

        return (
          <div key={key} className="bg-white border border-[#E8E8E8] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-[#DB0011]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#333]">{title}</p>
                <p className="text-[11px] text-[#AAAAAA]">{desc}</p>
              </div>
              {state === "done" && (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              )}
            </div>

            {showTypeSelect && (
              <div className="mb-3">
                <Select
                  label="Document type"
                  options={ID_TYPES}
                  value={data.idType}
                  onChange={(e) => onChange({ ...data, idType: e.target.value })}
                />
              </div>
            )}

            <input
              ref={ref}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(key, file);
              }}
            />

            {url ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-green-700 font-medium truncate hover:underline">
                    Document uploaded — view
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => { refs[key].current?.click(); }}
                  className="text-[10px] text-[#AAAAAA] hover:text-[#555] ml-2 flex-shrink-0"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => ref.current?.click()}
                disabled={state === "uploading"}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#E3E3E3] rounded-xl text-sm text-[#767676] hover:border-[#DB0011] hover:text-[#DB0011] transition-all disabled:opacity-50"
              >
                {state === "uploading" ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                ) : (
                  <><Upload size={14} /> Choose file</>
                )}
              </button>
            )}
            {state === "error" && (
              <p className="text-[11px] text-[#DB0011] mt-1">Upload failed — please try again.</p>
            )}

            <div className="mt-2">
              <Label>Notes (optional)</Label>
              <input
                type="text"
                value={data[noteField] as string}
                onChange={(e) => onChange({ ...data, [noteField]: e.target.value })}
                placeholder="e.g. I have a valid passport ready"
                className="w-full px-3 py-2 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GuarantorStep({ data, onChange }: { data: GuarantorData; onChange: (d: GuarantorData) => void }) {
  const u = (field: keyof GuarantorData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <p className="text-xs text-amber-700 font-medium">
          A guarantor agrees to repay the loan if you are unable to. They must be over 18 and have a good credit history. Guarantors may be based anywhere in the world.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Full name" value={data.fullName} onChange={u("fullName")} placeholder="Jane Smith" />
        <Select label="Relationship to you" options={RELATIONSHIPS} value={data.relationship} onChange={u("relationship")} />
      </div>
      <Input label="Email address" type="email" value={data.email} onChange={u("email")} placeholder="jane.smith@example.com" />
      <Input label="Phone number" type="tel" value={data.phone} onChange={u("phone")} placeholder="+1 555 000 0000" />

      <div className="pt-1 border-t border-[#F0F0F0]">
        <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">Guarantor&apos;s Address</p>
        <div className="space-y-3">
          <Input label="Address" value={data.addressLine1} onChange={u("addressLine1")} placeholder="123 Main Street" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={data.city} onChange={u("city")} placeholder="City" />
            <Input label="Postal code" value={data.postcode} onChange={u("postcode")} placeholder="Postal code" />
          </div>
        </div>
      </div>

      <div className="pt-1 border-t border-[#F0F0F0]">
        <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-3">Guarantor&apos;s Finances</p>
        <div className="space-y-3">
          <Select label="Employment status" options={EMPLOYMENT_STATUSES} value={data.employmentStatus} onChange={u("employmentStatus")} />
          <div>
            <Label>Monthly income £</Label>
            <input
              type="number" min="0" value={data.monthlyIncome} onChange={u("monthlyIncome")}
              placeholder="e.g. 3500"
              className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
            />
          </div>
        </div>
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
        ["Employer / Business", allData.employment.employerName || "—"],
        ["Role", allData.employment.jobTitle || "—"],
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
    {
      title: "Documents",
      rows: [
        ["Photo ID", allData.documents.idDocumentUrl ? "Uploaded ✓" : allData.documents.idNote || "—"],
        ["Proof of address", allData.documents.addressProofUrl ? "Uploaded ✓" : allData.documents.addressProofNote || "—"],
        ["Proof of income", allData.documents.incomeProofUrl ? "Uploaded ✓" : allData.documents.incomeProofNote || "—"],
      ],
    },
    {
      title: "Guarantor",
      rows: [
        ["Name", allData.guarantor.fullName || "—"],
        ["Relationship", allData.guarantor.relationship || "—"],
        ["Email", allData.guarantor.email || "—"],
        ["Phone", allData.guarantor.phone || "—"],
        ["Address", [allData.guarantor.addressLine1, allData.guarantor.city, allData.guarantor.postcode].filter(Boolean).join(", ") || "—"],
        ["Employment", allData.guarantor.employmentStatus || "—"],
        ["Monthly income", allData.guarantor.monthlyIncome ? `£${Number(allData.guarantor.monthlyIncome).toLocaleString()}` : "—"],
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
    idType: "", idNote: "", idDocumentUrl: "",
    addressProofNote: "", addressProofUrl: "",
    incomeProofNote: "", incomeProofUrl: "",
  });
  const [guarantor, setGuarantor] = useState<GuarantorData>({
    fullName: "", relationship: "", email: "", phone: "",
    addressLine1: "", city: "", postcode: "", employmentStatus: "", monthlyIncome: "",
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
      if (saved?.guarantor) setGuarantor((g) => ({ ...g, ...saved.guarantor }));
      if (res.data.data.loan.applicationStep && res.data.data.loan.applicationStep > 1) {
        setCurrentStep(Math.min(res.data.data.loan.applicationStep, 6));
      }
    } catch {
      setError("Could not load your application. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => { load(); }, [load]);

  async function handleDocumentUpload(docType: "idDocument" | "addressProof" | "incomeProof", file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    const res = await loansApi.uploadDocument(loanId, formData);
    const url = res.data.data.url;
    const urlFieldMap = {
      idDocument: "idDocumentUrl",
      addressProof: "addressProofUrl",
      incomeProof: "incomeProofUrl",
    } as const;
    setDocuments((d) => ({ ...d, [urlFieldMap[docType]]: url }));
  }

  async function saveAndNext() {
    setError("");

    // Validate required fields before saving
    if (currentStep === 2 && !employment.employmentStatus) {
      setError("Please select your employment status before continuing.");
      return;
    }
    if (currentStep === 5) {
      if (!guarantor.fullName.trim()) {
        setError("Please enter the guarantor's full name.");
        return;
      }
      if (!guarantor.email.trim()) {
        setError("Please enter the guarantor's email address.");
        return;
      }
    }

    setSaving(true);
    const stepData: Record<string, unknown> = {};
    if (currentStep === 1) stepData.personal = personal;
    if (currentStep === 2) stepData.employment = employment;
    if (currentStep === 3) stepData.financial = financial;
    if (currentStep === 4) stepData.documents = documents;
    if (currentStep === 5) stepData.guarantor = guarantor;
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

  const allData: AllData = { personal, employment, financial, documents, guarantor };
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
          <div className="flex items-center gap-1 mb-3">
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
          {currentStep === 4 && (
            <DocumentsStep
              data={documents}
              onChange={setDocuments}
              loanId={loanId}
              onUpload={handleDocumentUpload}
            />
          )}
          {currentStep === 5 && <GuarantorStep data={guarantor} onChange={setGuarantor} />}
          {currentStep === 6 && <ReviewStep loan={loan} allData={allData} />}
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
