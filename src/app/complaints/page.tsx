"use client";

import Link from "next/link";
import { AlertCircle, Phone, Mail, ChevronRight, CheckCircle2, FileText, Clock, MessageSquare } from "lucide-react";

function LuminaDiamond() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#DB0011">
      <polygon points="12,2 22,12 12,22 2,12" />
    </svg>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3E3E3] h-14 flex items-center px-4 gap-2">
      <Link href="/" className="flex-1 flex items-center gap-2.5">
        <LuminaDiamond />
        <span className="font-bold text-[#333] text-lg tracking-tight">Lumina</span>
      </Link>
      <Link href="/login" className="bg-[#DB0011] text-white text-xs font-semibold px-4 h-8 flex items-center hover:bg-[#b8000e] transition-colors">
        Log On
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="h-1 bg-[#DB0011]" />
      <div className="bg-[#1A1A1A] px-5 pt-10 pb-8">
        <div className="flex items-center gap-2.5 mb-8">
          <LuminaDiamond />
          <span className="text-white font-semibold text-base tracking-tight">Lumina</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 mb-8">
          <div>
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">Banking</p>
            {[["Current accounts", "/current-account"], ["Savings", "/savings"], ["Credit cards", "/credit-cards"], ["Mortgages", "/mortgages"], ["Loans", "/personal-loans"], ["Investments", "/wealth"], ["International", "/international"], ["Insurance", "/insurance-products"]].map(([l, h]) => (
              <Link key={l} href={h} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">Company</p>
            {[["About Lumina", "/about"], ["Security centre", "/security"], ["Careers", "/careers"], ["Privacy policy", "/privacy"], ["Terms of use", "/terms"], ["Complaints", "/complaints"]].map(([l, h]) => (
              <Link key={l} href={h} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/10 mb-5" />
        <p className="text-white/40 text-[11px] leading-relaxed mb-2">
          Lumina Bank plc is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority (FCA Register No. 56754). Registered office: 1 Lumina Square, London, EC2V 8RF.
        </p>
        <p className="text-white/30 text-[11px]">© {new Date().getFullYear()} Lumina Bank plc. All rights reserved. FSCS protected up to £85,000.</p>
      </div>
    </footer>
  );
}

export default function ComplaintsPage() {
  const steps = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Contact us",
      desc: "Use the support chat in the app, email support@luminabank.online, or call +44 800 123 4567. Tell us what went wrong and what you would like us to do.",
    },
    {
      icon: CheckCircle2,
      step: "2",
      title: "Acknowledgement",
      desc: "We will acknowledge your complaint within 3 business days and provide you with a reference number.",
    },
    {
      icon: Clock,
      step: "3",
      title: "Investigation",
      desc: "We will investigate thoroughly and keep you informed. Most complaints are resolved within 8 weeks.",
    },
    {
      icon: FileText,
      step: "4",
      title: "Final response",
      desc: "We will send a final response letter explaining our decision. If you are not satisfied, you can refer to the Financial Ombudsman Service free of charge.",
    },
  ];

  const whatToInclude = [
    "Your full name and account number (last 4 digits)",
    "The date the issue occurred",
    "A clear description of what happened",
    "Any relevant transaction references",
    "What resolution you are looking for",
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#8B000A] to-[#1A1A1A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center mb-5">
          <AlertCircle size={30} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Feedback</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Complaints</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto" style={{ lineHeight: "1.7" }}>
          We take all complaints seriously and aim to resolve them quickly, fairly, and transparently.
        </p>
      </div>

      {/* Steps */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Process</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>How to complain</h2>
        <div className="space-y-4">
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 border border-[#E8E8E8] rounded-xl">
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Icon size={18} className="text-[#DB0011]" />
                </div>
                <span className="text-[10px] font-bold text-[#DB0011]">Step {step}</span>
              </div>
              <div>
                <p className="font-semibold text-[#333] mb-1">{title}</p>
                <p className="text-sm text-[#666]" style={{ lineHeight: "1.7" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to include */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Be prepared</p>
          <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>What to include</h2>
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
            {whatToInclude.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#555]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Independent escalation</p>
          <h3 className="font-semibold text-[#333] mb-3">Financial Ombudsman Service</h3>
          <p className="text-sm text-[#555] mb-4" style={{ lineHeight: "1.7" }}>
            If we have not resolved your complaint within 8 weeks, or you are not satisfied with our final response, you can refer your complaint to the Financial Ombudsman Service. This service is free of charge.
          </p>
          <div className="space-y-2 text-sm text-[#555]">
            <p><strong>Website:</strong> www.financial-ombudsman.org.uk</p>
            <p><strong>Phone:</strong> 0800 023 4567 (free from landlines and mobiles)</p>
            <p><strong>Address:</strong> Exchange Tower, London, E14 9SR</p>
          </div>
        </div>
      </section>

      {/* Response times table */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Timescales</p>
          <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Response times</h2>
          <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
            {[
              ["Acknowledgement", "Within 3 business days"],
              ["Urgent / fraud cases", "Within 5 business days"],
              ["Standard final response", "Within 8 weeks"],
              ["FOS referral deadline", "Within 6 months of our final response"],
            ].map(([label, value], i) => (
              <div key={label} className={`flex justify-between items-center px-5 py-4 ${i < 3 ? "border-b border-[#F0F0F0]" : ""}`}>
                <p className="text-sm text-[#555]">{label}</p>
                <p className="text-sm font-semibold text-[#333]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h3 className="font-semibold text-[#333] mb-4">Contact our complaints team</h3>
        <div className="space-y-3">
          <a href="mailto:complaints@luminabank.online" className="flex items-center gap-3 p-4 border border-[#E8E8E8] rounded-xl hover:border-[#DB0011] transition-colors">
            <Mail size={18} className="text-[#DB0011]" />
            <div>
              <p className="text-sm font-semibold text-[#333]">Email</p>
              <p className="text-xs text-[#888]">complaints@luminabank.online</p>
            </div>
            <ChevronRight size={15} className="text-[#CCCCCC] ml-auto" />
          </a>
          <a href="tel:+448001234567" className="flex items-center gap-3 p-4 border border-[#E8E8E8] rounded-xl hover:border-[#DB0011] transition-colors">
            <Phone size={18} className="text-[#DB0011]" />
            <div>
              <p className="text-sm font-semibold text-[#333]">Phone</p>
              <p className="text-xs text-[#888]">+44 800 123 4567 (free, 24/7)</p>
            </div>
            <ChevronRight size={15} className="text-[#CCCCCC] ml-auto" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
