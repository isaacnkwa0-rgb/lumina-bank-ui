"use client";

import Link from "next/link";
import { CreditCard, Percent, Globe, Shield, ChevronRight, CheckCircle2, Zap, Star } from "lucide-react";
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

const cards = [
  {
    name: "Lumina Everyday",
    apr: "21.9% APR",
    limit: "Up to £5,000",
    rewards: "0.5% cashback",
    annualFee: "No annual fee",
    highlight: false,
  },
  {
    name: "Lumina Rewards",
    apr: "24.9% APR",
    limit: "Up to £15,000",
    rewards: "1.5% cashback + travel perks",
    annualFee: "£9.99/month",
    highlight: true,
  },
  {
    name: "Lumina Prestige",
    apr: "19.9% APR",
    limit: "Up to £50,000",
    rewards: "2% cashback + airport lounge access",
    annualFee: "£24.99/month",
    highlight: false,
  },
];

export default function CreditCardsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 items-center justify-center mb-5">
          <CreditCard size={30} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Spend smarter</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Credit Cards</h1>
        <p className="text-white/70 text-base max-w-sm mx-auto mb-8" style={{ lineHeight: "1.7" }}>
          Earn cashback on every purchase. No foreign transaction fees. Instant decisions.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-[#DB0011] font-bold px-7 py-3 text-sm hover:bg-white/90 transition-colors">
          Apply now <ChevronRight size={16} />
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80&auto=format&fit=crop"
          alt="Credit cards"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#8B000A]/30" />
      </div>

      {/* Cards */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Our cards</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Choose your card</h2>
        <div className="space-y-4">
          {cards.map((c) => (
            <div key={c.name} className={`p-5 rounded-xl border ${c.highlight ? "border-[#DB0011]" : "border-[#E8E8E8]"}`}>
              {c.highlight && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Star size={12} className="text-[#DB0011] fill-[#DB0011]" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#DB0011]">Most popular</span>
                </div>
              )}
              <p className="font-bold text-[#333] text-lg mb-3">{c.name}</p>
              <div className="grid grid-cols-2 gap-y-2 mb-4">
                <div>
                  <p className="text-[10px] text-[#AAA] uppercase tracking-wide">Representative APR</p>
                  <p className="text-sm font-semibold text-[#333]">{c.apr}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#AAA] uppercase tracking-wide">Credit limit</p>
                  <p className="text-sm font-semibold text-[#333]">{c.limit}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#AAA] uppercase tracking-wide">Rewards</p>
                  <p className="text-sm font-semibold text-[#DB0011]">{c.rewards}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#AAA] uppercase tracking-wide">Annual fee</p>
                  <p className="text-sm font-semibold text-[#333]">{c.annualFee}</p>
                </div>
              </div>
              <Link href="/register" className="inline-flex items-center gap-1.5 bg-[#DB0011] text-white text-xs font-semibold px-4 py-2 hover:bg-[#b8000e] transition-colors">
                Apply <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#AAA] mt-4">Representative APR is variable. Your actual rate will depend on your individual circumstances. Credit subject to status.</p>
      </section>

      {/* Features */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">All cards include</p>
          <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Standard features</h2>
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
            {[
              "No foreign transaction fees worldwide",
              "Instant freeze and unfreeze in the app",
              "Real-time spending notifications",
              "0% interest on purchases for up to 56 days",
              "Apple Pay and Google Pay",
              "24/7 fraud monitoring and zero liability protection",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#555]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Simple process</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Apply in 3 steps</h2>
        <div className="space-y-4">
          {[
            { step: "1", icon: Zap, title: "Apply online", desc: "Fill in your details. It takes less than 3 minutes and only requires a soft credit check initially." },
            { step: "2", icon: Shield, title: "Get an instant decision", desc: "We check your eligibility instantly. Most applicants receive a decision in under 60 seconds." },
            { step: "3", icon: Globe, title: "Start spending", desc: "Your digital card is ready immediately. Your physical card arrives in 3 to 5 working days." },
          ].map(({ step, icon: Icon, title, desc }) => (
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

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Start earning cashback today</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Soft check first. No impact to your credit score until you accept your offer.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Apply now <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
