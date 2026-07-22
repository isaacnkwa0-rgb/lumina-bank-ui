"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import {
  ArrowLeft, HelpCircle, MessageSquare, Mail, Phone,
  ChevronDown, ChevronUp, ShieldCheck, CreditCard,
  ArrowLeftRight, Lock, FileCheck, AlertCircle,
} from "lucide-react";

const FAQS = [
  {
    icon: ArrowLeftRight,
    q: "How long do transfers take?",
    a: "Lumina-to-Lumina transfers are instant. UK bank transfers (Faster Payments) typically complete within 2 hours but can take up to 1 business day. International transfers via SWIFT take 3–5 business days.",
  },
  {
    icon: Lock,
    q: "I've been locked out of my account",
    a: "After 5 failed login attempts your account is locked for 30 minutes. Once unlocked, use 'Forgot password' on the login screen to reset your credentials if needed.",
  },
  {
    icon: CreditCard,
    q: "My card has been blocked — what do I do?",
    a: "If your card was blocked by us, you'll receive an email explaining why. Contact support at support@lumina.bank to have it reviewed. If you lost your card, use the Cards section in the app to report it lost.",
  },
  {
    icon: ShieldCheck,
    q: "How do I enable two-factor authentication?",
    a: "Go to Profile → Security → Two-factor authentication. You'll need an authenticator app (e.g. Google Authenticator or Authy). Once set up, you'll enter a 6-digit code at each login.",
  },
  {
    icon: FileCheck,
    q: "Why is my KYC verification taking long?",
    a: "Identity verification typically completes within 1 business day. If it's been longer, contact support with your full name and the email address on your account.",
  },
  {
    icon: AlertCircle,
    q: "I don't recognise a transaction on my account",
    a: "Go to Transactions, find the transaction in question, and tap 'Raise dispute'. Our team will investigate within 5 business days. For urgent concerns, contact us directly.",
  },
  {
    icon: ArrowLeftRight,
    q: "What are the daily transfer limits?",
    a: "Daily limits depend on your account tier: Standard £5,000, Premium £25,000, Private £100,000. Limits apply to the combined total of all domestic and international transfers in a 24-hour period.",
  },
  {
    icon: Lock,
    q: "How do I change my password?",
    a: "Go to Profile → Security → Change password. You'll need your current password. After changing, you'll be signed out of all devices for security.",
  },
];

function FaqItem({ icon: Icon, q, a }: { icon: React.ElementType; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#F0F0F0] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
      >
        <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-[#DB0011]" />
        </div>
        <p className="flex-1 text-sm font-medium text-[#333]">{q}</p>
        {open ? <ChevronUp size={15} className="text-[#AAAAAA] flex-shrink-0" /> : <ChevronDown size={15} className="text-[#AAAAAA] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pl-16">
          <p className="text-sm text-[#767676] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <HelpCircle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("support.title")}</h1>
            <p className="text-white/60 text-xs mt-0.5">{t("support.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Contact options */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F0F0F0]">
            <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{t("support.contact")}</p>
          </div>
          {[
            {
              icon: Mail,
              label: t("support.emailSupport"),
              sub: "support@lumina.bank",
              color: "text-blue-600",
              bg: "bg-blue-50",
              href: "mailto:support@lumina.bank",
            },
            {
              icon: MessageSquare,
              label: t("support.liveChat"),
              sub: t("support.chatHours"),
              color: "text-green-600",
              bg: "bg-green-50",
              href: null,
            },
            {
              icon: Phone,
              label: t("support.phone"),
              sub: "+44 800 000 0000 · 24/7",
              color: "text-purple-600",
              bg: "bg-purple-50",
              href: "tel:+448000000000",
            },
          ].map(({ icon: Icon, label, sub, color, bg, href }) => (
            <button
              key={label}
              onClick={() => href && (window.location.href = href)}
              className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0] last:border-0"
            >
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#333]">{label}</p>
                <p className="text-xs text-[#AAAAAA] mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F0F0F0]">
            <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{t("support.faq")}</p>
          </div>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>

        {/* Footer note */}
        <div className="bg-[#F8F8F8] rounded-2xl border border-[#E8E8E8] px-5 py-4">
          <p className="text-xs text-[#AAAAAA] text-center leading-relaxed">
            {t("support.demo")}
            {" "}
            {t("support.urgent")}{" "}
            <span className="text-[#DB0011] font-medium">security@lumina.bank</span>
          </p>
        </div>
      </div>
    </div>
  );
}
