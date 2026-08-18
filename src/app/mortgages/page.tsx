"use client";

import Link from "next/link";
import { Home, Percent, Shield, Clock, ChevronRight, CheckCircle2, Calculator, Users } from "lucide-react";
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

const mortgageTypes = [
  {
    name: "Fixed Rate",
    rate: "From 4.29% APR",
    term: "2, 3, or 5 years",
    desc: "Your monthly repayments stay the same for the fixed term — great for budgeting certainty.",
    popular: true,
  },
  {
    name: "Tracker Rate",
    rate: "From 4.09% APR",
    term: "Lifetime or 2 years",
    desc: "Your rate tracks the Bank of England base rate plus a set margin. Benefit if rates fall.",
    popular: false,
  },
  {
    name: "Offset Mortgage",
    rate: "From 4.75% APR",
    term: "2 to 5 years fixed",
    desc: "Link your savings to your mortgage and only pay interest on the difference.",
    popular: false,
  },
];

export default function MortgagesPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="relative">
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop"
            alt="Modern home"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#1A1A1A]/70" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-5">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/15 items-center justify-center mb-4">
            <Home size={26} className="text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Your home</p>
          <h1 className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>Mortgages</h1>
          <p className="text-white/70 text-sm max-w-xs" style={{ lineHeight: "1.7" }}>
            Competitive rates, expert guidance, and a fully digital application.
          </p>
        </div>
      </div>

      {/* Key stats */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] px-5 py-5">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-[#DB0011]">4.29%</p>
            <p className="text-xs text-[#888] mt-0.5">Rates from</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">95%</p>
            <p className="text-xs text-[#888] mt-0.5">Max LTV</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">35 yrs</p>
            <p className="text-xs text-[#888] mt-0.5">Max term</p>
          </div>
        </div>
      </div>

      {/* Mortgage types */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Products</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Mortgage types</h2>
        <div className="space-y-4">
          {mortgageTypes.map((m) => (
            <div key={m.name} className={`p-5 rounded-xl border ${m.popular ? "border-[#DB0011] bg-red-50" : "border-[#E8E8E8]"}`}>
              {m.popular && <span className="text-[10px] font-bold uppercase tracking-wide text-[#DB0011] block mb-1">Most popular</span>}
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-[#333]">{m.name}</p>
                <span className="text-sm font-bold text-[#DB0011]">{m.rate}</span>
              </div>
              <p className="text-xs text-[#AAA] mb-2">Term: {m.term}</p>
              <p className="text-sm text-[#666] mb-3" style={{ lineHeight: "1.7" }}>{m.desc}</p>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-[#DB0011] font-semibold text-sm hover:opacity-75 transition-opacity">
                Get a quote <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#AAA] mt-4">Your home may be repossessed if you do not keep up repayments on your mortgage. Rates correct as of {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })} and subject to change.</p>
      </section>

      {/* Why Lumina */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Why us</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Why choose a Lumina mortgage</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Calculator, title: "Free online calculator", desc: "Use our mortgage calculator to see exactly what you can borrow and estimate your monthly repayments." },
              { icon: Clock, title: "Decision in 24 hours", desc: "We give you a decision in principle (DIP) within 24 hours of your application — often much sooner." },
              { icon: Users, title: "Dedicated case manager", desc: "You'll be assigned a named case manager who handles your application from start to completion." },
              { icon: Shield, title: "Fully regulated", desc: "Lumina Bank is fully authorised by the PRA and regulated by the FCA for mortgage lending." },
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

      {/* Eligibility */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Requirements</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Eligibility</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
          {[
            "Aged 18 or over (maximum age 75 at end of mortgage term)",
            "UK resident with right to live and work in the UK",
            "Minimum income of £25,000 per year (sole or joint)",
            "Minimum deposit of 5% of the property value",
            "Good credit history (no CCJs or bankruptcies in the last 3 years)",
            "Property must be in England, Scotland, or Wales",
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
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Ready to find your new home?</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Get a decision in principle today. No hard credit check until you proceed.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Get a mortgage quote <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
