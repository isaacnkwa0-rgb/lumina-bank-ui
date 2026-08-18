"use client";

import Link from "next/link";
import { Shield, Heart, Car, Home, Umbrella, ChevronRight, CheckCircle2, Zap, Phone } from "lucide-react";
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
    icon: Heart,
    name: "Life Insurance",
    from: "From £6/month",
    desc: "Protect the people you love. Pay out a lump sum if you pass away during the policy term. Cover from £50,000 to £1,000,000.",
    features: ["Level or decreasing cover", "Terms from 5 to 40 years", "Serious illness add-on available", "Instant online quote"],
  },
  {
    icon: Umbrella,
    name: "Income Protection",
    from: "From £12/month",
    desc: "Replace up to 70% of your income if you are unable to work due to illness or injury. Pays out monthly until you recover or retire.",
    features: ["Short or long-term cover", "Deferred period from 4 to 52 weeks", "Own occupation definition", "Inflation-linked option"],
  },
  {
    icon: Home,
    name: "Home Insurance",
    from: "From £9/month",
    desc: "Combined buildings and contents cover for your home and belongings. Includes accidental damage and new-for-old replacement.",
    features: ["Buildings and contents together", "Accidental damage cover", "Alternative accommodation included", "Lumina customer discount"],
  },
  {
    icon: Car,
    name: "Car Insurance",
    from: "From £24/month",
    desc: "Comprehensive car insurance with a Lumina twist — manage your policy, file claims, and track your no-claims bonus all in the app.",
    features: ["Comprehensive cover", "Courtesy car as standard", "In-app claims filing", "Black box option for younger drivers"],
  },
  {
    icon: Shield,
    name: "Travel Insurance",
    from: "From £4/trip",
    desc: "Single-trip or annual multi-trip cover for individuals, couples, and families. Medical emergencies, cancellations, and lost luggage covered.",
    features: ["Worldwide or Europe-only cover", "Medical cover up to £10,000,000", "Cancellation up to £5,000", "Gadget cover add-on"],
  },
];

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="relative">
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format&fit=crop"
            alt="Family and home protection"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#1A1A1A]/75" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-5">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/15 items-center justify-center mb-4">
            <Shield size={26} className="text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Peace of mind</p>
          <h1 className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>Insurance</h1>
          <p className="text-white/70 text-sm max-w-xs" style={{ lineHeight: "1.7" }}>
            Protect what matters most — your family, home, car, and income.
          </p>
        </div>
      </div>

      {/* Key selling points */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] px-5 py-5">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-[#DB0011]">5 min</p>
            <p className="text-xs text-[#888] mt-0.5">To get a quote</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">5 types</p>
            <p className="text-xs text-[#888] mt-0.5">Of cover</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#DB0011]">24/7</p>
            <p className="text-xs text-[#888] mt-0.5">Claims support</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Products</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Choose your cover</h2>
        <div className="space-y-5">
          {products.map(({ icon: Icon, name, from, desc, features }) => (
            <div key={name} className="border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[#DB0011]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#333]">{name}</p>
                    <span className="text-sm font-bold text-[#DB0011] whitespace-nowrap">{from}</span>
                  </div>
                  <p className="text-sm text-[#666] mt-1" style={{ lineHeight: "1.7" }}>{desc}</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-4 pl-1">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#DB0011] flex-shrink-0" />
                    <p className="text-xs text-[#666]">{f}</p>
                  </div>
                ))}
              </div>
              <Link href="/register" className="inline-flex items-center gap-1.5 bg-[#DB0011] text-white text-xs font-semibold px-4 py-2 hover:bg-[#b8000e] transition-colors">
                Get a quote <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Lumina insurance */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Why us</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Insurance built for Lumina customers</h2>
          <div className="space-y-3">
            {[
              { icon: Zap, text: "Get a quote in 5 minutes — no lengthy forms or phone calls required" },
              { icon: Shield, text: "Managed entirely in the Lumina app alongside your banking" },
              { icon: CheckCircle2, text: "Lumina customer discount on all insurance products" },
              { icon: Phone, text: "24/7 claims line — speak to a human any time, day or night" },
              { icon: Heart, text: "FCA-regulated insurance products from trusted underwriters" },
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

      {/* Disclosures */}
      <section className="px-5 py-8 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800" style={{ lineHeight: "1.7" }}>
            Lumina Bank plc acts as a credit broker for insurance products, not the insurer. Insurance products are underwritten by authorised insurers. All quotes are subject to underwriting criteria. Prices shown are illustrative and may vary based on your circumstances.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <h2 className="text-2xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Get covered today</h2>
        <p className="text-white/60 text-sm mb-7 max-w-xs mx-auto">Quotes in 5 minutes. Cover starts immediately. Manage everything in the app.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-bold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Get a quote <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
