"use client";

import Link from "next/link";
import { Shield, Zap, Users, ChevronRight } from "lucide-react";

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

export default function AboutPage() {
  const stats = [
    { value: "2001", label: "Year founded" },
    { value: "2.4m+", label: "Customers" },
    { value: "£31.6bn", label: "Assets under management" },
    { value: "4.9★", label: "App Store rating" },
  ];

  const values = [
    { icon: Shield, title: "Trust", desc: "We safeguard your money and data with the highest standards of security and regulatory compliance. Your trust is the foundation of everything we do." },
    { icon: Zap, title: "Innovation", desc: "We build technology that makes banking faster, simpler, and more intuitive — so you spend less time managing money and more time living your life." },
    { icon: Users, title: "Inclusion", desc: "We believe world-class banking should be accessible to everyone, not just the privileged few. Fair pricing, clear terms, no hidden charges." },
  ];

  const team = [
    { name: "Sarah Mitchell", title: "Chief Executive Officer", initials: "SM", bio: "Former VP at Barclays. 20 years in digital financial services." },
    { name: "James Okafor", title: "Chief Financial Officer", initials: "JO", bio: "Previously CFO at Starling Bank. Chartered accountant, FCA." },
    { name: "Priya Sharma", title: "Chief Technology Officer", initials: "PS", bio: "Ex-engineering director at Monzo. Fintech infrastructure specialist." },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-16 text-white text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">About us</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>About Lumina Bank</h1>
        <p className="text-white/70 text-base max-w-sm mx-auto" style={{ lineHeight: "1.7" }}>
          Building the future of personal banking — for everyone.
        </p>
      </div>

      {/* Mission */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-3">Our mission</p>
        <h2 className="text-2xl font-light text-[#333] mb-5" style={{ letterSpacing: "0.02em" }}>
          Banking that works for you, not the other way around
        </h2>
        <p className="text-[15px] text-[#555] mb-4" style={{ lineHeight: "1.85" }}>
          We believe everyone deserves world-class banking. Lumina Bank was founded to make private-banking-quality services accessible to everyone — not just the wealthy few.
        </p>
        <p className="text-[15px] text-[#555] mb-4" style={{ lineHeight: "1.85" }}>
          We are a technology-first bank, built from the ground up on modern infrastructure. No legacy systems, no branch queues, no paper. Just fast, secure, intelligent banking in your pocket.
        </p>
        <p className="text-[15px] text-[#555]" style={{ lineHeight: "1.85" }}>
          Fully authorised and regulated in the United Kingdom, Lumina Bank holds a banking licence from the Prudential Regulation Authority. Your deposits are protected by the FSCS up to £85,000.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-[#F8F8F8] px-5 py-10 border-t border-b border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8E8E8] p-5 text-center">
              <p className="text-2xl font-bold text-[#DB0011] mb-1">{s.value}</p>
              <p className="text-xs text-[#888] uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">What we stand for</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Our values</h2>
        <div className="space-y-4">
          {values.map(({ icon: Icon, title, desc }) => (
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

      {/* Leadership */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Leadership</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Our team</h2>
          <div className="space-y-4">
            {team.map((m) => (
              <div key={m.name} className="bg-white border border-[#E8E8E8] rounded-xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#DB0011] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{m.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-[#333]">{m.name}</p>
                  <p className="text-xs text-[#DB0011] font-medium mb-0.5">{m.title}</p>
                  <p className="text-xs text-[#888]">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulated */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <div className="bg-[#003087] rounded-xl p-6 text-white text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Shield size={20} className="text-white" />
            <span className="text-xs font-bold tracking-widest uppercase">FSCS Protected</span>
          </div>
          <p className="text-sm text-white/80" style={{ lineHeight: "1.7" }}>
            Lumina Bank plc is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority (FCA Register No. 56754). Deposits protected up to <strong className="text-white">£85,000</strong>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-xl font-light text-[#333] mb-4">Ready to join Lumina?</h2>
        <Link href="/register" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-semibold px-7 py-3 text-sm hover:bg-[#b8000e] transition-colors">
          Open an account <ChevronRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
