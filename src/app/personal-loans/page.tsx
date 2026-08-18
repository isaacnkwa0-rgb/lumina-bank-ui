"use client";

import Link from "next/link";
import { Banknote, Zap, Shield, BarChart3, ChevronRight, CheckCircle2, Clock, Calculator } from "lucide-react";
import Image from "next/image";

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

const loanOptions = [
  { amount: "£1,000 – £5,000", term: "1 – 3 years", rate: "6.9% APR", label: "Small personal loan" },
  { amount: "£5,001 – £15,000", term: "1 – 5 years", rate: "7.9% APR", label: "Medium personal loan", popular: true },
  { amount: "£15,001 – £50,000", term: "2 – 7 years", rate: "9.9% APR", label: "Large personal loan" },
];

export default function LoansPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center mb-5">
          <Banknote size={30} className="text-[#DB0011]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Borrow confidently</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Personal Loans</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto mb-8" style={{ lineHeight: "1.7" }}>
          From £1,000 to £50,000 with competitive rates and no early repayment charges.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Check my rate <ChevronRight size={16} />
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format&fit=crop"
          alt="Personal loan"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/40" />
      </div>

      {/* Rate check banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-4 text-center">
        <p className="text-sm text-amber-800">Checking your eligibility does <strong>not</strong> affect your credit score. We only use a soft search.</p>
      </div>

      {/* Loan options */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Loan tiers</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Borrow what you need</h2>
        <div className="space-y-4">
          {loanOptions.map((l) => (
            <div key={l.label} className={`p-5 rounded-xl border ${l.popular ? "border-[#DB0011] bg-red-50" : "border-[#E8E8E8]"}`}>
              {l.popular && <span className="text-[10px] font-bold uppercase tracking-wide text-[#DB0011] block mb-1">Best value</span>}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-[#333]">{l.label}</p>
                  <p className="text-sm text-[#888]">{l.amount} &nbsp;·&nbsp; {l.term}</p>
                </div>
                <span className="text-lg font-bold text-[#DB0011]">{l.rate}</span>
              </div>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-[#DB0011] font-semibold text-sm hover:opacity-75 transition-opacity">
                Apply now <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#AAA] mt-4">Representative APR. Rate offered depends on your credit score and individual circumstances. Credit subject to status.</p>
      </section>

      {/* Features */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Benefits</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Why choose a Lumina loan</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Zap, title: "Decision in seconds", desc: "Get a personalised rate with a soft credit search that does not affect your credit score." },
              { icon: Clock, title: "Same-day funding", desc: "Once approved, funds are usually in your account within the same business day." },
              { icon: Calculator, title: "No early repayment fee", desc: "Pay off your loan early at any time with no penalty charges whatsoever." },
              { icon: BarChart3, title: "Fixed monthly payments", desc: "Your repayments never change — easy to budget and plan your finances." },
              { icon: Shield, title: "Fully regulated", desc: "Lumina Bank is FCA-authorised for consumer credit. All loans are subject to affordability checks." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 border border-[#E8E8E8] bg-white rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#DB0011]" />
                </div>
                <div>
                  <p className="font-semibold text-[#333] mb-1">{title}</p>
                  <p className="text-sm text-[#666]" style={{ lineHeight: "1.7" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What can you use it for */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Use cases</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>What can you use a loan for?</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
          {[
            "Home improvements and renovations",
            "New or used car purchase",
            "Debt consolidation",
            "Wedding or special occasion",
            "Holiday or travel",
            "Medical or dental costs",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 size={15} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#555]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Get your personalised rate</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Soft check. No impact to your credit score. Decision in seconds.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Check my rate <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
