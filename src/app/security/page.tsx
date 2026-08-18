"use client";

import Link from "next/link";
import { Shield, Lock, Eye, AlertTriangle, Smartphone, Key, Wifi, ChevronRight, Phone, Mail } from "lucide-react";

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

export default function SecurityPage() {
  const protections = [
    { icon: Lock, title: "256-bit Encryption", desc: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your information is unreadable to anyone but you." },
    { icon: Smartphone, title: "Two-Factor Authentication", desc: "Add an extra layer to every login with an authenticator app. Even if your password is stolen, your account stays safe." },
    { icon: Eye, title: "Real-time Fraud Monitoring", desc: "Our AI systems monitor every transaction 24/7. Unusual activity triggers instant alerts and automatic holds to protect your funds." },
    { icon: Shield, title: "FSCS Protection", desc: "Eligible deposits are protected up to £85,000 per person by the Financial Services Compensation Scheme — at no cost to you." },
  ];

  const tips = [
    { icon: Key, tip: "Never share your one-time passcode (OTP) with anyone — Lumina staff will never ask for it." },
    { icon: Lock, tip: "Use a strong, unique password for your Lumina account. A password manager can help." },
    { icon: Smartphone, tip: "Enable two-factor authentication in Profile > Security > Two-factor authentication." },
    { icon: Wifi, tip: "Avoid banking on public Wi-Fi. Use mobile data or a trusted private network." },
    { icon: AlertTriangle, tip: "Be suspicious of emails or calls claiming to be from Lumina. Check the sender address carefully." },
    { icon: Eye, tip: "Lock your phone with a PIN, fingerprint, or face ID to protect the app if your device is lost." },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-[#1A1A1A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center mb-5">
          <Shield size={32} className="text-[#DB0011]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Your safety</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Security Centre</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto" style={{ lineHeight: "1.7" }}>
          How we protect your money, data, and identity.
        </p>
      </div>

      {/* How we protect you */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Protection</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>How we protect you</h2>
        <div className="grid grid-cols-1 gap-4">
          {protections.map(({ icon: Icon, title, desc }) => (
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

      {/* Security tips */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Stay safe</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Security tips</h2>
          <div className="space-y-3">
            {tips.map(({ icon: Icon, tip }, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-xl p-4 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#DB0011]" />
                </div>
                <p className="text-sm text-[#555]" style={{ lineHeight: "1.7" }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report concern */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <div className="bg-[#1A1A1A] rounded-xl p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Urgent?</p>
          <h3 className="text-xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>Report a security concern</h3>
          <p className="text-white/60 text-sm mb-5" style={{ lineHeight: "1.7" }}>
            If you suspect fraud or unauthorised access to your account, contact us immediately. We are available 24/7.
          </p>
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3">
              <Phone size={15} className="text-[#DB0011]" />
              <span className="text-sm text-white/80">+44 800 123 4567 (free, 24/7)</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-[#DB0011]" />
              <span className="text-sm text-white/80">security@luminabank.online</span>
            </div>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 bg-[#DB0011] text-white font-semibold px-5 py-2.5 text-sm hover:bg-[#b8000e] transition-colors">
            Go to secure app <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
