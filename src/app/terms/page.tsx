"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

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
        <div className="flex items-center gap-2.5 mb-6">
          <LuminaDiamond />
          <span className="text-white font-semibold text-base tracking-tight">Lumina</span>
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

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-[#333] mb-3 flex items-baseline gap-2">
        <span className="text-[#DB0011] font-bold text-sm">{number}.</span>
        {title}
      </h2>
      <div className="text-[15px] text-[#555] space-y-3" style={{ lineHeight: "1.85" }}>
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#DB0011] mt-1 flex-shrink-0">&#8227;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-[#1A1A1A] px-5 py-14 text-white text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <FileText size={26} className="text-[#DB0011]" />
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>Terms of Use</h1>
        <p className="text-white/50 text-sm">Effective date: 1 January 2025</p>
      </div>

      <div className="px-5 py-10 max-w-2xl mx-auto">

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-amber-800" style={{ lineHeight: "1.7" }}>
            Please read these Terms of Use carefully before using the Lumina Bank website or mobile application. By using our services, you agree to be bound by these terms.
          </p>
        </div>

        <Section number="1" title="Acceptance of terms">
          <p>
            By accessing or using the Lumina Bank website (luminabank.online) or mobile application, you confirm that you accept these Terms of Use and agree to comply with them. If you do not agree, you must not use our services.
          </p>
          <p>
            These terms should be read alongside our <Link href="/privacy" className="text-[#DB0011] underline">Privacy Policy</Link>, which explains how we handle your personal data.
          </p>
        </Section>

        <Section number="2" title="Eligibility">
          <p>To open a Lumina Bank account you must:</p>
          <BulletList items={[
            "Be at least 18 years of age",
            "Be a resident of the United Kingdom",
            "Not be subject to international sanctions",
            "Have a valid government-issued identity document",
            "Provide accurate and truthful information during registration",
          ]} />
        </Section>

        <Section number="3" title="Account security">
          <p>You are responsible for maintaining the confidentiality of your login credentials. You must:</p>
          <BulletList items={[
            "Keep your password and one-time passcodes (OTPs) strictly private",
            "Never share your account access with any other person",
            "Report any suspected unauthorised access immediately by calling +44 800 123 4567",
            "Log out after each session on shared devices",
            "Enable two-factor authentication where possible",
          ]} />
          <p>We will not be liable for losses resulting from your failure to keep your credentials secure.</p>
        </Section>

        <Section number="4" title="Prohibited uses">
          <p>You must not use Lumina Bank services for:</p>
          <BulletList items={[
            "Money laundering, fraud, or financing terrorism",
            "Any activity that violates UK or international law",
            "Circumventing regulatory controls or sanctions requirements",
            "Transmitting malware or attempting to access our systems without authorisation",
            "Scraping, reverse-engineering, or copying our platform or software",
            "Impersonating another person or entity",
          ]} />
        </Section>

        <Section number="5" title="Payments and transfers">
          <p>
            Transfers are subject to our published limits, which depend on your account tier and verification status. Lumina-to-Lumina transfers are processed instantly. UK Faster Payments typically complete within 2 hours. International SWIFT transfers typically take 3 to 5 business days.
          </p>
          <p>
            We reserve the right to delay, block, or reverse a payment if we have reasonable grounds to suspect fraud, money laundering, or breach of sanctions.
          </p>
        </Section>

        <Section number="6" title="Intellectual property">
          <p>
            All content on the Lumina Bank website and app — including logos, text, graphics, software, and design — is owned by or licensed to Lumina Bank plc and is protected by UK and international intellectual property law.
          </p>
          <p>
            You may not reproduce, distribute, modify, or create derivative works from any of our content without our prior written consent.
          </p>
        </Section>

        <Section number="7" title="Limitation of liability">
          <p>To the fullest extent permitted by law, Lumina Bank plc will not be liable for losses arising from:</p>
          <BulletList items={[
            "Your failure to keep your account credentials secure",
            "Third-party system failures outside our control (e.g., payment networks, telecommunications)",
            "Inaccurate information provided by you during registration or transactions",
            "Events beyond our reasonable control (force majeure), including natural disasters, cyberattacks, or regulatory actions",
          ]} />
          <p>Nothing in these terms limits our liability for fraud, death or personal injury caused by our negligence, or any other liability that cannot be excluded by law.</p>
        </Section>

        <Section number="8" title="Changes to our services">
          <p>
            We may modify, suspend, or discontinue any part of our services at any time. Where reasonably practicable, we will give you at least 2 months&apos; notice of any material changes to services that affect you as a payment account holder, in accordance with the Payment Services Regulations 2017.
          </p>
        </Section>

        <Section number="9" title="Governing law">
          <p>
            These Terms of Use and any dispute arising from them are governed by English law. You and we both agree to submit to the exclusive jurisdiction of the courts of England and Wales, except where you are protected by mandatory consumer law provisions in your jurisdiction.
          </p>
        </Section>

        <Section number="10" title="Changes to these terms">
          <p>
            We may update these Terms of Use from time to time. We will give you at least 30 days&apos; notice of any changes by email before they take effect. Continued use of our services after the effective date constitutes your acceptance of the revised terms.
          </p>
        </Section>

        <Section number="11" title="Contact us">
          <BulletList items={[
            "Email: legal@luminabank.online",
            "Phone: +44 800 123 4567",
            "Post: Lumina Bank plc, 1 Lumina Square, London, EC2V 8RF",
          ]} />
        </Section>

      </div>

      <Footer />
    </div>
  );
}
