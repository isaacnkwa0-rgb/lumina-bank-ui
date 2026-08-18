"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-5 py-14 text-white text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-white/15 items-center justify-center mb-4">
          <Lock size={26} className="text-white" />
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>Privacy Policy</h1>
        <p className="text-white/60 text-sm">Last updated: 1 January 2025</p>
      </div>

      <div className="px-5 py-10 max-w-2xl mx-auto">

        <Section number="1" title="Who we are">
          <p>
            Lumina Bank plc is the data controller for personal data collected through our website and banking app. Our registered office is 1 Lumina Square, London, EC2V 8RF.
          </p>
          <p>
            If you have any questions about how we use your data, contact us at <a href="mailto:privacy@luminabank.online" className="text-[#DB0011] underline">privacy@luminabank.online</a>.
          </p>
        </Section>

        <Section number="2" title="What data we collect">
          <BulletList items={[
            "Identity data: name, date of birth, gender, nationality",
            "Contact data: email address, phone number, postal address",
            "Identity verification: government-issued ID documents (for KYC)",
            "Financial data: account balances, transactions, payment history",
            "Tax residency and National Insurance / Tax reference information",
            "Device and technical data: IP address, browser type, operating system",
            "Usage data: pages visited, features used, login times",
          ]} />
        </Section>

        <Section number="3" title="Why we use your data">
          <BulletList items={[
            "To open and operate your bank account",
            "To verify your identity and comply with Know Your Customer (KYC) obligations",
            "To detect and prevent fraud and financial crime",
            "To comply with legal and regulatory obligations (FCA, HMRC, AML regulations)",
            "To process payments and transfers on your behalf",
            "To send you service notifications and account alerts",
            "To improve our products and services through analysis",
          ]} />
        </Section>

        <Section number="4" title="Legal basis for processing">
          <p>We rely on the following legal bases under UK GDPR Article 6:</p>
          <BulletList items={[
            "Performance of a contract: to provide banking services you have requested",
            "Legal obligation: to comply with FCA, AML and other regulatory requirements",
            "Legitimate interests: fraud prevention, network security, improving our services",
            "Consent: for optional marketing communications (you can withdraw at any time)",
          ]} />
        </Section>

        <Section number="5" title="Who we share your data with">
          <p>We share your data only where necessary, with:</p>
          <BulletList items={[
            "Credit reference agencies (Experian, Equifax, TransUnion)",
            "Fraud prevention agencies and CIFAS",
            "Payment processors and card network operators (Visa)",
            "Regulatory authorities (FCA, PRA, HMRC, NCA) when legally required",
            "Our regulated technology and cloud service providers",
          ]} />
          <p className="font-medium text-[#333]">We never sell your personal data to third parties.</p>
        </Section>

        <Section number="6" title="Your rights">
          <p>Under UK GDPR you have the right to:</p>
          <BulletList items={[
            "Access: request a copy of the personal data we hold about you",
            "Rectification: ask us to correct inaccurate or incomplete data",
            "Erasure: ask us to delete your data (subject to legal retention obligations)",
            "Restriction: ask us to limit how we use your data in certain circumstances",
            "Portability: receive your data in a structured, machine-readable format",
            "Object: object to processing based on legitimate interests",
            "Withdraw consent: for any processing based on consent, at any time",
          ]} />
          <p>To exercise your rights, email <a href="mailto:privacy@luminabank.online" className="text-[#DB0011] underline">privacy@luminabank.online</a>. We will respond within 30 days.</p>
        </Section>

        <Section number="7" title="Data retention">
          <p>
            We retain account and transaction data for <strong>7 years</strong> after account closure, as required by UK financial regulations and HMRC guidelines. Identity verification documents are retained for 5 years after the end of our business relationship, in line with the Money Laundering Regulations 2017.
          </p>
        </Section>

        <Section number="8" title="Cookies">
          <p>
            We use cookies and similar technologies to operate our website and app. These include:
          </p>
          <BulletList items={[
            "Essential cookies: required for login, security, and core functionality",
            "Functional cookies: remember your preferences and settings",
            "Analytics cookies: help us understand how customers use our services (anonymised)",
          ]} />
          <p>You can manage cookie preferences in your browser settings. Blocking essential cookies may affect how the app functions.</p>
        </Section>

        <Section number="9" title="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email at least 14 days before the changes take effect. Continued use of our services after the effective date constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section number="10" title="Contact us">
          <p>
            For privacy-related queries or to exercise your rights:
          </p>
          <BulletList items={[
            "Email: privacy@luminabank.online",
            "Phone: +44 800 123 4567",
            "Post: Data Protection Officer, Lumina Bank plc, 1 Lumina Square, London, EC2V 8RF",
          ]} />
          <p>
            You also have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#DB0011] underline">ico.org.uk</a>.
          </p>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
