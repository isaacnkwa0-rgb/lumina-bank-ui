"use client";

import Link from "next/link";
import { Globe, Zap, DollarSign, Shield, ChevronRight, CheckCircle2, RefreshCw, MapPin } from "lucide-react";
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

const corridors = [
  { from: "GBP", to: "EUR", fee: "Free", time: "Instant" },
  { from: "GBP", to: "USD", fee: "£1.99", time: "Same day" },
  { from: "GBP", to: "CHF", fee: "£1.99", time: "Same day" },
  { from: "GBP", to: "JPY", fee: "£2.99", time: "1 – 2 days" },
  { from: "GBP", to: "AUD", fee: "£2.99", time: "1 – 2 days" },
  { from: "GBP", to: "CAD", fee: "£1.99", time: "Same day" },
];

export default function InternationalPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="relative">
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop"
            alt="International banking"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#1A1A1A]/75" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-5">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/15 items-center justify-center mb-4">
            <Globe size={26} className="text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Global banking</p>
          <h1 className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>International Banking</h1>
          <p className="text-white/70 text-sm max-w-xs" style={{ lineHeight: "1.7" }}>
            Send money worldwide, spend abroad, and manage multiple currencies — all in one place.
          </p>
        </div>
      </div>

      {/* Key stats */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] px-5 py-5">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-[#DB0011]">40+</p>
            <p className="text-xs text-[#888] mt-0.5">Currencies</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">180+</p>
            <p className="text-xs text-[#888] mt-0.5">Countries</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">Mid-market</p>
            <p className="text-xs text-[#888] mt-0.5">Exchange rate</p>
          </div>
        </div>
      </div>

      {/* Transfer corridors */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Transfer fees</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>Popular corridors</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 gap-0 px-5 py-3 border-b border-[#F0F0F0] bg-[#F8F8F8]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#AAA]">From</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#AAA]">To</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#AAA]">Fee</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#AAA]">Speed</p>
          </div>
          {corridors.map((c, i) => (
            <div key={i} className={`grid grid-cols-4 gap-0 px-5 py-4 ${i < corridors.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}>
              <p className="text-sm font-semibold text-[#333]">{c.from}</p>
              <p className="text-sm font-semibold text-[#333]">{c.to}</p>
              <p className="text-sm font-semibold text-[#DB0011]">{c.fee}</p>
              <p className="text-sm text-[#666]">{c.time}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#AAA] mt-4">Mid-market exchange rate applied. Additional local bank fees may apply at the recipient end. All rates subject to change.</p>
      </section>

      {/* Features */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Features</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>International features</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: DollarSign, title: "Multi-currency wallet", desc: "Hold, exchange, and spend in over 40 currencies. Lock in exchange rates in advance." },
              { icon: Zap, title: "Real-time transfers", desc: "SEPA and Faster Payments transfers are instant. SWIFT transfers in 1 to 5 business days." },
              { icon: RefreshCw, title: "Mid-market rates", desc: "We use the mid-market exchange rate with no hidden markup — the same rate you see on Google." },
              { icon: MapPin, title: "Spend abroad for free", desc: "Use your Lumina card in 180+ countries with no foreign transaction fees on standard purchases." },
              { icon: Shield, title: "Sending limits up to £1m", desc: "Verified customers can send up to £1,000,000 per transaction via SWIFT international wire." },
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

      {/* What you get */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Everything included</p>
        <h2 className="text-2xl font-light text-[#333] mb-6" style={{ letterSpacing: "0.02em" }}>What&apos;s included</h2>
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 space-y-3">
          {[
            "IBAN and BIC for receiving international payments",
            "SWIFT and SEPA transfers",
            "Real-time currency exchange in the app",
            "Forward contracts to lock in exchange rates",
            "Instant currency conversion at checkout",
            "Dedicated international support team",
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
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Bank without borders</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Open an account today and start sending money worldwide in minutes.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Open an account <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
