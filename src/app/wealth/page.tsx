"use client";

import Link from "next/link";
import { TrendingUp, PieChart, Shield, BarChart3, ChevronRight, CheckCircle2, Zap, BookOpen } from "lucide-react";
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
        <p className="text-white/30 text-[11px]">© {new Date().getFullYear()} Lumina Bank plc. All rights reserved.</p>
      </div>
    </footer>
  );
}

const portfolios = [
  {
    name: "Cautious",
    risk: "Low risk",
    return: "3 – 5% target p.a.",
    desc: "Mostly bonds and cash-equivalent assets. Prioritises capital preservation over growth.",
    colour: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    name: "Balanced",
    risk: "Medium risk",
    return: "5 – 8% target p.a.",
    desc: "A diversified mix of equities and bonds. Suitable for most long-term investors.",
    colour: "bg-amber-50 border-amber-200 text-amber-700",
    popular: true,
  },
  {
    name: "Growth",
    risk: "Higher risk",
    return: "8 – 12% target p.a.",
    desc: "Primarily equities across global markets. Higher potential returns with higher volatility.",
    colour: "bg-red-50 border-red-200 text-red-700",
  },
];

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-[#1A1A1A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center mb-5">
          <TrendingUp size={30} className="text-[#DB0011]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Build long-term wealth</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Investments</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto mb-8" style={{ lineHeight: "1.7" }}>
          Stocks, ISAs, and managed portfolios — all in your Lumina app from as little as £1.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Start investing <ChevronRight size={16} />
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop"
          alt="Investment charts"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/50" />
      </div>

      {/* Risk warning */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-4 text-center">
        <p className="text-xs text-amber-800" style={{ lineHeight: "1.6" }}>
          <strong>Capital at risk.</strong> The value of your investments can go down as well as up and you may get back less than you put in. Past performance is not a guide to future returns.
        </p>
      </div>

      {/* Portfolio options */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Managed portfolios</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Choose your risk level</h2>
        <div className="space-y-4">
          {portfolios.map((p) => (
            <div key={p.name} className={`p-5 rounded-xl border ${p.popular ? "border-[#DB0011]" : "border-[#E8E8E8]"}`}>
              {p.popular && <span className="text-[10px] font-bold uppercase tracking-wide text-[#DB0011] block mb-1">Most popular</span>}
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-[#333] text-lg">{p.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${p.colour}`}>{p.risk}</span>
              </div>
              <p className="text-sm font-semibold text-[#DB0011] mb-2">{p.return}</p>
              <p className="text-sm text-[#666] mb-4" style={{ lineHeight: "1.7" }}>{p.desc}</p>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-[#DB0011] font-semibold text-sm hover:opacity-75 transition-opacity">
                Get started <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">All products</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>What you can invest in</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: BarChart3, title: "Stocks and shares ISA", desc: "Invest up to £20,000 per tax year completely tax-free. Holds UK and global equities, ETFs, and funds." },
              { icon: PieChart, title: "General Investment Account", desc: "No annual limit. Invest in thousands of stocks, ETFs, and funds from around the world." },
              { icon: TrendingUp, title: "Lifetime ISA", desc: "Save up to £4,000 per year towards your first home or retirement and receive a 25% government bonus." },
              { icon: BookOpen, title: "Lumina Learn", desc: "New to investing? Access free educational guides, webinars, and a practice account with virtual money." },
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

      {/* Fees */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Transparent pricing</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Fees</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
          {[
            ["Platform fee", "0.25% per year (capped at £250)"],
            ["Fund ongoing charges", "Varies by fund (avg. 0.15–0.75%)"],
            ["Stock trading", "£3.99 per trade"],
            ["ETF trading", "£1.99 per trade"],
            ["Withdrawals", "Free, processed next business day"],
          ].map(([label, value], i) => (
            <div key={label} className={`flex justify-between items-center px-5 py-4 ${i < 4 ? "border-b border-[#F0F0F0]" : ""}`}>
              <p className="text-sm text-[#555]">{label}</p>
              <p className="text-sm font-semibold text-[#333] text-right max-w-[180px]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Start with as little as £1</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">No minimums, no lock-ins. Invest and withdraw whenever you want.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Open an investment account <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
