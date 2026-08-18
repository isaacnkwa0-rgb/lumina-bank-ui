"use client";

import Link from "next/link";
import { CreditCard, Zap, Globe, Shield, ChevronRight, CheckCircle2, Smartphone, RefreshCw } from "lucide-react";
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

const features = [
  { icon: Zap, title: "Instant payments", desc: "Send and receive money in seconds with UK Faster Payments and real-time Lumina-to-Lumina transfers." },
  { icon: Globe, title: "Spend worldwide", desc: "Use your Lumina card in over 200 countries with no foreign transaction fees on eligible transactions." },
  { icon: Smartphone, title: "Full mobile banking", desc: "Manage every aspect of your account from the Lumina app — 24 hours a day, 7 days a week." },
  { icon: Shield, title: "FSCS protected", desc: "Your eligible deposits are protected up to £85,000 per person by the Financial Services Compensation Scheme." },
  { icon: RefreshCw, title: "Automated savings", desc: "Round-up spare change on every purchase automatically into your savings pot." },
  { icon: CreditCard, title: "Virtual cards", desc: "Create virtual card numbers for online shopping to keep your main card details safe." },
];

const included = [
  "UK account number and sort code",
  "Contactless Visa debit card",
  "Apple Pay and Google Pay",
  "Fee-free ATM withdrawals in the UK",
  "Instant spending notifications",
  "Budgeting tools and spending insights",
  "24/7 in-app customer support",
  "Up to 4.5% AER on linked savings",
];

export default function CurrentAccountPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 items-center justify-center mb-5">
          <CreditCard size={30} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Everyday banking</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Current Account</h1>
        <p className="text-white/70 text-base max-w-sm mx-auto mb-8" style={{ lineHeight: "1.7" }}>
          A smart, full-featured current account with no monthly fee. Open in minutes.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-[#DB0011] font-bold px-7 py-3 text-sm hover:bg-white/90 transition-colors">
          Open an account <ChevronRight size={16} />
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&auto=format&fit=crop"
          alt="Smart mobile banking"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#8B000A]/30" />
      </div>

      {/* No fee banner */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] px-5 py-4 text-center">
        <p className="text-sm font-semibold text-[#333]">No monthly fee &nbsp;·&nbsp; No minimum balance &nbsp;·&nbsp; Open in under 5 minutes</p>
      </div>

      {/* Features */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Why Lumina</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Everything you need</h2>
        <div className="grid grid-cols-1 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 border border-[#E8E8E8] rounded-xl">
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
      </section>

      {/* Included */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">What you get</p>
          <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Included as standard</h2>
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="text-[#DB0011] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#555]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Transparent pricing</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Account fees</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
          {[
            ["Monthly account fee", "Free"],
            ["UK ATM withdrawals", "Free"],
            ["UK transfers", "Free"],
            ["International transfers", "From £3.99"],
            ["Replacement card", "Free"],
          ].map(([label, value], i) => (
            <div key={label} className={`flex justify-between items-center px-5 py-4 ${i < 4 ? "border-b border-[#F0F0F0]" : ""}`}>
              <p className="text-sm text-[#555]">{label}</p>
              <p className="text-sm font-semibold text-[#333]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Ready to open your account?</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Apply in minutes. No credit check for the standard account. FSCS protected.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Get started <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
