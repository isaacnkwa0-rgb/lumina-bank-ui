"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, Heart, Home, Car, Plane, Briefcase,
  ChevronRight, CheckCircle2, X, FileText, Clock,
} from "lucide-react";
import { insuranceApi, type InsuranceQuote } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils";

// ── Product catalogue ─────────────────────────────────────────────────────────

interface Product {
  id: "LIFE" | "HOME" | "CAR" | "TRAVEL" | "HEALTH" | "BUSINESS";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  name: string;
  tagline: string;
  from: string;
  features: string[];
  badge?: string;
  fields: FormField[];
}

interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  placeholder?: string;
  options?: string[];
  suffix?: string;
}

const PRODUCTS: Product[] = [
  {
    id: "LIFE",
    icon: Heart,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
    name: "Life Insurance",
    tagline: "Protect your family's future",
    from: "£8.50/mo",
    badge: "Popular",
    features: ["Up to £500,000 cover", "Fixed premiums for life", "Critical illness add-on", "Payable within 48 hours"],
    fields: [
      { key: "age", label: "Your age", type: "number", placeholder: "e.g. 34" },
      { key: "coverAmount", label: "Cover amount (£)", type: "number", placeholder: "e.g. 250000" },
      { key: "smoker", label: "Are you a smoker?", type: "select", options: ["No", "Yes"] },
    ],
  },
  {
    id: "HOME",
    icon: Home,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    name: "Home Insurance",
    tagline: "Buildings & contents covered",
    from: "£12.00/mo",
    features: ["Buildings & contents", "Accidental damage cover", "Emergency home assist", "Flood & fire protection"],
    fields: [
      { key: "propertyType", label: "Property type", type: "select", options: ["Detached", "Semi-detached", "Terraced", "Flat", "Bungalow"] },
      { key: "rebuildValue", label: "Rebuild value (£)", type: "number", placeholder: "e.g. 200000" },
      { key: "contentsValue", label: "Contents value (£)", type: "number", placeholder: "e.g. 15000" },
    ],
  },
  {
    id: "CAR",
    icon: Car,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    name: "Car Insurance",
    tagline: "Comprehensive road cover",
    from: "£24.99/mo",
    badge: "Best value",
    features: ["Comprehensive cover", "Courtesy car included", "24/7 roadside recovery", "No-claims discount"],
    fields: [
      { key: "registration", label: "Car registration", type: "text", placeholder: "e.g. AB12 CDE" },
      { key: "noClaimsYears", label: "No-claims years", type: "number", placeholder: "e.g. 3" },
      { key: "annualMileage", label: "Annual mileage", type: "number", placeholder: "e.g. 8000" },
    ],
  },
  {
    id: "TRAVEL",
    icon: Plane,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    name: "Travel Insurance",
    tagline: "Worldwide trip protection",
    from: "£4.99/trip",
    features: ["Medical expenses covered", "Trip cancellation", "Lost luggage", "Annual multi-trip option"],
    fields: [
      { key: "destination", label: "Destination", type: "select", options: ["Europe", "Worldwide (excl. USA/Canada)", "Worldwide", "UK only"] },
      { key: "duration", label: "Trip duration (days)", type: "number", placeholder: "e.g. 14" },
      { key: "travellers", label: "Number of travellers", type: "number", placeholder: "e.g. 2" },
    ],
  },
  {
    id: "HEALTH",
    icon: ShieldCheck,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    name: "Health Insurance",
    tagline: "Private medical cover",
    from: "£35.00/mo",
    features: ["Private consultations", "Specialist referrals", "Mental health support", "Dental & optical add-on"],
    fields: [
      { key: "age", label: "Your age", type: "number", placeholder: "e.g. 34" },
      { key: "preExisting", label: "Pre-existing conditions?", type: "select", options: ["None", "Minor", "Significant"] },
      { key: "includeOptical", label: "Include dental & optical?", type: "select", options: ["No", "Yes"] },
    ],
  },
  {
    id: "BUSINESS",
    icon: Briefcase,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    name: "Business Insurance",
    tagline: "Protect your enterprise",
    from: "£19.99/mo",
    features: ["Public liability cover", "Professional indemnity", "Employers' liability", "Business interruption"],
    fields: [
      { key: "businessType", label: "Business type", type: "select", options: ["Sole trader", "Partnership", "Limited company", "Other"] },
      { key: "employees", label: "Number of employees", type: "number", placeholder: "e.g. 5" },
      { key: "annualTurnover", label: "Annual turnover (£)", type: "number", placeholder: "e.g. 100000" },
    ],
  },
];

// ── Quote modal ───────────────────────────────────────────────────────────────

function QuoteModal({ product, onClose, onSuccess }: {
  product: Product;
  onClose: () => void;
  onSuccess: (quote: InsuranceQuote) => void;
}) {
  const { user } = useAuth();
  const Icon = product.icon;
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InsuranceQuote | null>(null);

  function set(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of product.fields) {
      if (!values[f.key]?.trim()) {
        setError(`Please fill in: ${f.label}`);
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      const details: Record<string, unknown> = { ...values };
      if (user?.firstName) details.contactName = `${user.firstName} ${user.lastName}`;
      const res = await insuranceApi.requestQuote({ type: product.id, details, notes: notes || undefined });
      const quote = res.data.data;
      setResult(quote);
      onSuccess(quote);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to get quote. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>

        {result ? (
          // ── Success ──
          <div className="px-5 py-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-[#222] mb-1">Quote ready!</p>
            <p className="text-2xl font-bold text-[#DB0011] mb-1">
              £{Number(result.premium).toFixed(2)}<span className="text-base text-[#767676] font-normal">/mo</span>
            </p>
            <p className="text-sm text-[#767676] leading-relaxed mb-1">
              Estimated premium for your <strong>{product.name}</strong>.
            </p>
            <p className="text-xs text-[#AAAAAA] mb-6">
              Our team will contact you within 24 hours to finalise your policy.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          // ── Form ──
          <form onSubmit={handleSubmit} className="px-5 pt-3 pb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${product.iconBg}`}>
                  <Icon size={20} className={product.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#222]">{product.name}</p>
                  <p className="text-xs text-[#AAAAAA]">From {product.from}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <X size={15} className="text-[#777]" />
              </button>
            </div>

            {/* Features */}
            <div className="bg-[#FAFAFA] rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-2.5">What&apos;s included</p>
              <div className="space-y-2">
                {product.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-[#333]">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="space-y-3.5 mb-4">
              {product.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-sm text-[#333] bg-white"
                    >
                      <option value="">Select…</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-sm text-[#333]"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Additional notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Anything else you'd like us to know?"
                  className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-sm text-[#333] resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
                <p className="text-sm text-[#DB0011]">{error}</p>
              </div>
            )}

            <p className="text-xs text-[#AAAAAA] text-center mb-4">
              By requesting a quote our specialist team will call you to discuss your needs.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] disabled:opacity-60 transition-colors"
            >
              {loading ? "Getting quote…" : "Get my quote"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── My Quotes ─────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === "QUOTED") return "text-amber-700 bg-amber-100";
  if (status === "ACCEPTED") return "text-green-700 bg-green-100";
  if (status === "DECLINED") return "text-red-700 bg-red-100";
  return "text-[#767676] bg-[#F0F0F0]";
}

function MyQuotes({ quotes, onAccept }: { quotes: InsuranceQuote[]; onAccept: (id: string) => void }) {
  if (quotes.length === 0) return null;

  return (
    <div className="px-4 mt-4">
      <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">My quotes</p>
      <div className="space-y-2">
        {quotes.map((q) => {
          const product = PRODUCTS.find((p) => p.id === q.type);
          const Icon = product?.icon ?? FileText;
          return (
            <div key={q.id} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-4 py-3.5 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${product?.iconBg ?? "bg-[#F0F0F0]"}`}>
                <Icon size={18} className={product?.iconColor ?? "text-[#767676]"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#333]">{product?.name ?? q.type}</p>
                <p className="text-xs text-[#AAAAAA]">{formatDate(q.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {q.premium && (
                  <p className="text-sm font-bold text-[#DB0011]">£{Number(q.premium).toFixed(2)}/mo</p>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(q.status)}`}>
                  {q.status}
                </span>
                {q.status === "QUOTED" && (
                  <button
                    onClick={() => onAccept(q.id)}
                    className="mt-1.5 block text-[10px] font-bold text-[#DB0011] hover:underline"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsurancePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);

  useEffect(() => {
    insuranceApi.getQuotes().then((r) => setQuotes(r.data.data)).catch(() => {});
  }, []);

  function handleSuccess(quote: InsuranceQuote) {
    setQuotes((prev) => [quote, ...prev.filter((q) => q.id !== quote.id)]);
  }

  async function handleAccept(id: string) {
    try {
      const res = await insuranceApi.acceptQuote(id);
      setQuotes((prev) => prev.map((q) => q.id === id ? res.data.data : q));
    } catch {}
  }

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Insurance</h1>
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Lumina Protect</p>
          <p className="text-3xl font-bold">{PRODUCTS.length} products</p>
          <p className="text-white/40 text-xs mt-1">Tailored cover from trusted underwriters</p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] px-4 py-3.5 flex items-center justify-around relative z-10">
        {[
          { label: "FCA regulated", emoji: "✅" },
          { label: "24/7 support",  emoji: "📞" },
          { label: "Fast claims",   emoji: "⚡" },
        ].map(({ label, emoji }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-xl">{emoji}</span>
            <p className="text-[10px] font-bold text-[#777] uppercase tracking-wide text-center">{label}</p>
          </div>
        ))}
      </div>

      {/* My quotes */}
      <MyQuotes quotes={quotes} onAccept={handleAccept} />

      {/* Product cards */}
      <div className="px-4 mt-4 space-y-3">
        {quotes.length === 0 && (
          <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">Browse products</p>
        )}
        {quotes.length > 0 && (
          <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">Get another quote</p>
        )}
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          return (
            <button
              key={product.id}
              onClick={() => setSelected(product)}
              className="w-full bg-white rounded-2xl border border-[#EFEFEF] shadow-sm overflow-hidden active:scale-[0.99] transition-transform text-left"
            >
              <div className="flex items-center gap-3.5 px-4 py-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${product.iconBg}`}>
                  <Icon size={22} className={product.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#222]">{product.name}</p>
                    {product.badge && (
                      <span className="text-[10px] font-bold bg-[#DB0011] text-white px-2 py-0.5 rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#AAAAAA] mt-0.5">{product.tagline}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-[#AAAAAA]">From</p>
                    <p className="text-xs font-bold text-[#DB0011]">{product.from}</p>
                  </div>
                  <ChevronRight size={16} className="text-[#CCCCCC]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-[#CCCCCC] mt-6 px-4">
        Lumina Insurance is arranged by Lumina Bank plc and underwritten by approved insurers. Products are subject to eligibility and terms.
      </p>

      {selected && (
        <QuoteModal
          product={selected}
          onClose={() => setSelected(null)}
          onSuccess={(q) => { handleSuccess(q); setSelected(null); }}
        />
      )}
    </div>
  );
}
