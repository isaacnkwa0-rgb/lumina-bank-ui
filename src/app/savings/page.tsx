"use client";

import Link from "next/link";
import { PiggyBank, TrendingUp, Lock, Zap, ChevronRight, CheckCircle2, RefreshCw, Shield } from "lucide-react";
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

const products = [
  {
    name: "Easy Access Saver",
    rate: "4.50% AER",
    desc: "Withdraw whenever you need with no penalties. Perfect for your emergency fund.",
    highlight: true,
  },
  {
    name: "Fixed Rate Bond (1 year)",
    rate: "5.10% AER",
    desc: "Lock in a higher rate for 12 months. Ideal for money you won't need right away.",
    highlight: false,
  },
  {
    name: "Regular Saver",
    rate: "5.75% AER",
    desc: "Deposit £25–£500 per month and earn our best rate. Designed for consistent savers.",
    highlight: false,
  },
  {
    name: "Junior ISA",
    rate: "4.25% AER",
    desc: "Tax-free savings for your child, up to £9,000 per year. Locked until they turn 18.",
    highlight: false,
  },
];

export default function SavingsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center mb-5">
          <PiggyBank size={30} className="text-[#DB0011]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Grow your money</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Savings Accounts</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto mb-8" style={{ lineHeight: "1.7" }}>
          Market-leading rates, flexible access, and FSCS protection up to £85,000.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Start saving <ChevronRight size={16} />
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&auto=format&fit=crop"
          alt="Savings and financial planning"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/60 to-transparent" />
      </div>

      {/* Products */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Our accounts</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Choose your savings account</h2>
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.name} className={`p-5 rounded-xl border ${p.highlight ? "border-[#DB0011] bg-red-50" : "border-[#E8E8E8] bg-white"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-[#333]">{p.name}</p>
                  {p.highlight && <span className="text-[10px] font-bold uppercase tracking-wide text-[#DB0011]">Most popular</span>}
                </div>
                <span className="text-xl font-bold text-[#DB0011] whitespace-nowrap">{p.rate}</span>
              </div>
              <p className="text-sm text-[#666] mb-4" style={{ lineHeight: "1.7" }}>{p.desc}</p>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-[#DB0011] font-semibold text-sm hover:opacity-75 transition-opacity">
                Open account <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#AAA] mt-4">AER (Annual Equivalent Rate) correct as of {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}. Rates subject to change.</p>
      </section>

      {/* Why choose Lumina */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Benefits</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Why save with Lumina</h2>
          <div className="space-y-3">
            {[
              { icon: TrendingUp, text: "Market-leading rates updated daily" },
              { icon: Lock, text: "FSCS protected up to £85,000 per person" },
              { icon: Zap, text: "Open a new savings account in under 2 minutes" },
              { icon: RefreshCw, text: "Automatic interest paid monthly directly to your account" },
              { icon: Shield, text: "No hidden fees or charges — ever" },
              { icon: CheckCircle2, text: "View and manage all savings pots in one place" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-xl p-4 flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#DB0011]" />
                </div>
                <p className="text-sm text-[#555]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Put your money to work</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Open a savings account today. No fees, no fuss — just competitive interest from day one.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Open a savings account <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
