"use client";

import Link from "next/link";
import { Briefcase, Calendar, BookOpen, ChevronRight, MapPin, Clock } from "lucide-react";

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

const ROLES = [
  { title: "Senior Software Engineer", dept: "Technology", location: "London / Remote", type: "Full-time" },
  { title: "Product Manager, Payments", dept: "Product", location: "London", type: "Full-time" },
  { title: "Risk & Compliance Analyst", dept: "Risk", location: "London", type: "Full-time" },
  { title: "Customer Support Specialist", dept: "Operations", location: "Remote", type: "Full-time" },
  { title: "UX Designer", dept: "Design", location: "London / Remote", type: "Full-time" },
  { title: "Data Scientist", dept: "Analytics", location: "London", type: "Full-time" },
];

const DEPT_COLOURS: Record<string, string> = {
  Technology: "bg-blue-50 text-blue-700",
  Product: "bg-purple-50 text-purple-700",
  Risk: "bg-orange-50 text-orange-700",
  Operations: "bg-green-50 text-green-700",
  Design: "bg-pink-50 text-pink-700",
  Analytics: "bg-indigo-50 text-indigo-700",
};

export default function CareersPage() {
  const benefits = [
    { icon: Briefcase, title: "Competitive salary", desc: "Market-leading pay benchmarked annually, plus performance bonus and equity options." },
    { icon: Calendar, title: "Flexible working", desc: "Hybrid and remote options across most roles. Work when and where you do your best thinking." },
    { icon: BookOpen, title: "Learning & development", desc: "£2,000 annual learning budget, internal workshops, and sponsored professional qualifications." },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-16 text-white text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 items-center justify-center mb-5">
          <Briefcase size={30} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Join us</p>
        <h1 className="text-3xl font-light mb-3" style={{ letterSpacing: "0.02em" }}>Careers at Lumina Bank</h1>
        <p className="text-white/70 text-base max-w-sm mx-auto" style={{ lineHeight: "1.7" }}>
          Help us build the future of banking. We are looking for curious, driven people who want to make a real difference.
        </p>
      </div>

      {/* Benefits */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Why Lumina</p>
        <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Why work with us</h2>
        <div className="space-y-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
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

      {/* Open roles */}
      <section className="bg-[#F8F8F8] px-5 py-12 border-t border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Now hiring</p>
          <h2 className="text-2xl font-light text-[#333] mb-8" style={{ letterSpacing: "0.02em" }}>Open positions</h2>
          <div className="space-y-3">
            {ROLES.map((role) => (
              <div key={role.title} className="bg-white border border-[#E8E8E8] rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#333] mb-1.5">{role.title}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${DEPT_COLOURS[role.dept] ?? "bg-gray-100 text-gray-600"}`}>
                      {role.dept}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#888] mb-4">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {role.location}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {role.type}</span>
                </div>
                <a
                  href={`mailto:careers@luminabank.online?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="inline-flex items-center gap-1.5 bg-[#DB0011] text-white text-xs font-semibold px-4 py-2 hover:bg-[#b8000e] transition-colors"
                >
                  Apply <ChevronRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DB0011] mb-2">Culture</p>
        <h2 className="text-2xl font-light text-[#333] mb-4" style={{ letterSpacing: "0.02em" }}>Life at Lumina</h2>
        <p className="text-[15px] text-[#555] mb-8" style={{ lineHeight: "1.85" }}>
          We are a diverse team united by a shared mission. We work hard, support each other, and celebrate every milestone — from first lines of code to product launches that reach hundreds of thousands of customers. We hire people who care about craft, who ask why, and who want to leave banking better than they found it.
        </p>

        {/* No role box */}
        <div className="bg-[#F8F8F8] border border-[#E8E8E8] rounded-xl p-6">
          <p className="font-semibold text-[#333] mb-2">Can&apos;t see the right role?</p>
          <p className="text-sm text-[#666] mb-4" style={{ lineHeight: "1.7" }}>
            We are always interested in hearing from talented people. Send your CV and a short note about how you would make Lumina better.
          </p>
          <a
            href="mailto:careers@luminabank.online"
            className="inline-flex items-center gap-1.5 text-[#DB0011] font-semibold text-sm hover:opacity-75 transition-opacity"
          >
            careers@luminabank.online <ChevronRight size={14} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
