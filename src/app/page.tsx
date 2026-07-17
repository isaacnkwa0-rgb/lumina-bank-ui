"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronRight, Landmark, CalendarDays, RefreshCw, Send } from "lucide-react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const products = [
    { label: "Current accounts", href: "/register" },
    { label: "Savings accounts", href: "/register" },
    { label: "Credit cards", href: "/register" },
    { label: "Loans", href: "/register" },
    { label: "Mortgages", href: "/register" },
    { label: "Investments", href: "/register" },
    { label: "International banking", href: "/register" },
    { label: "Insurance", href: "/register" },
  ];

  const menuLinks = [
    "Current accounts",
    "Savings",
    "Credit cards",
    "Loans",
    "Mortgages",
    "Investments",
    "International",
    "Insurance",
    "Help & support",
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E3E3E3] h-14 flex items-center px-4">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1 -ml-1 text-[#333]"
          aria-label="Open menu"
        >
          <MenuThick />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2.5">
          <LuminaDiamond />
          <span className="font-bold text-[#333] text-lg tracking-tight">
            Lumina
          </span>
        </div>

        <Link
          href="/login"
          className="bg-[#DB0011] text-white text-xs font-semibold px-4 h-8 flex items-center hover:bg-[#b8000e] transition-colors"
        >
          Log on
        </Link>
      </header>

      {/* ── SLIDE-OUT MENU ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative z-10 w-72 bg-white h-full flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#E3E3E3]">
              <div className="flex items-center gap-2">
                <LuminaDiamond />
                <span className="font-bold text-[#333] text-base">Lumina</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-[#333]">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              {menuLinks.map((item) => (
                <button
                  key={item}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-4 text-base text-[#333] border-b border-[#E3E3E3] hover:bg-[#F8F8F8] text-left"
                >
                  {item}
                  <ChevronRight size={18} className="text-[#DB0011]" />
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-[#E3E3E3]">
              <Link
                href="/login"
                className="block bg-[#DB0011] text-white text-center font-semibold py-3 text-sm hover:bg-[#b8000e]"
              >
                Log on to Online Banking
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-white">
        {/* Full-width image */}
        <div className="w-full">
          <Image
            src="/hero.jpeg"
            alt="Customer paying with phone at shop"
            width={1224}
            height={816}
            className="w-full h-auto block"
            priority
          />
        </div>

        {/* Text card overlaps the bottom of the image */}
        <div className="relative -mt-6 mx-4 bg-white px-4 pt-5 pb-6">
          <h3 className="text-[1.95rem] font-light text-[#333] mb-4" style={{ letterSpacing: "0.04em", wordSpacing: "0.1em", whiteSpace: "nowrap", lineHeight: "1.2" }}>
            Your next credit card?
          </h3>
          <p className="text-[15px] text-[#333] mb-6" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            Get £25 cashback when you spend or transfer a balance of £500 or more with a Balance Transfer or Purchase Plus card. Offer ends 10 August 2026. Representative 24.9% APR (variable). Credit is subject to status. T&Cs apply.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#DB0011] text-white font-semibold py-3 px-8 text-sm hover:bg-[#b8000e] transition-colors"
          >
            Apply now
          </Link>
          <p className="text-[12px] text-[#555] mt-3 leading-[1.7]">
            Available to new and existing customers. Offer and eligibility criteria apply.{" "}
            <a href="#" className="underline text-[#555]">
              View offer terms and conditions
            </a>{" "}
            Offer may be withdrawn at any time.
          </p>
        </div>
      </section>

      {/* ── PREMIER + FUNDS CARDS ── */}
      <div className="px-4 py-5 space-y-4">
        {/* Card 1 — Premier */}
        <div className="bg-white border border-[#E3E3E3] px-4 py-5">
          <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
            Join <span className="font-light text-[1.7rem]">Lumina</span> Premier today
          </h2>
          <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            Lumina Premier is our premium account that gives you more than banking with
            wealth, health and travel benefits, and rewards too. Eligibility criteria and T&Cs apply.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011] transition-colors"
          >
            Premier Bank Account <ChevronRight size={16} className="text-[#DB0011]" />
          </Link>
        </div>

        {/* Card 2 — Buy & manage */}
        <div className="bg-white border border-[#E3E3E3] px-4 py-5">
          <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
            Buy and manage funds online
          </h2>
          <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            It's now even easier for Lumina UK current account customers to manage,
            buy and sell investments online. Capital at risk. Fees apply.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011] transition-colors"
          >
            Learn more <ChevronRight size={16} className="text-[#DB0011]" />
          </Link>
        </div>
      </div>

      <div className="h-2 bg-[#F0F0F0]" />

      {/* ── PRODUCTS LIST ── */}
      <section className="px-4">
        {products.map((product) => (
          <Link
            key={product.label}
            href={product.href}
            className="flex items-center py-5 hover:opacity-70 transition-opacity"
          >
            <span className="text-[1.35rem] font-normal text-[#333]" style={{ letterSpacing: "0.01em" }}>{product.label}</span>
            <ChevronRight size={20} className="text-[#DB0011] flex-shrink-0 ml-1" />
          </Link>
        ))}
      </section>

      {/* Bigger gap after Insurance before next section */}
      <div className="h-10" />

      {/* ── LOOKING FOR HELP ── */}
      <section className="px-4">
        <div className="border border-[#E3E3E3]">
          <Image
            src="/family.jpeg"
            alt="Happy family"
            width={1080}
            height={720}
            className="w-full h-auto block"
          />
          <div className="px-4 py-5">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              Looking for help?
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              Find answers to your questions and get the latest guidance.
            </p>
            <div className="space-y-2">
              <Link
                href="#"
                className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
              >
                Digital reset <ChevronRight size={14} className="text-[#DB0011]" />
              </Link>
              <Link
                href="#"
                className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
              >
                Managing your account <ChevronRight size={14} className="text-[#DB0011]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-6" />

      {/* ── GROWING YOUR MONEY ── */}
      <section className="px-4">
        <div className="border border-[#E3E3E3]">
          <Image
            src="/growth.jpeg"
            alt="Coins in a jar with a growing plant"
            width={1224}
            height={688}
            className="w-full h-auto block"
          />
          <div className="px-4 py-5">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              Growing your money
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              Explore ways you could make the most of your money to help reach your goals.
            </p>
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
            >
              Stocks &amp; shares ISA <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-6" />

      {/* ── SMALL BUSINESS ── */}
      <section className="px-4">
        <div className="border border-[#E3E3E3]">
          <Image
            src="/business.jpeg"
            alt="Small business owner at counter"
            width={1200}
            height={675}
            className="w-full h-auto block"
          />
          <div className="px-4 py-5">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              Lumina Small Business Banking Account
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              We're here to support your business all the way, that's why there's no monthly account fee and free UK digital banking.
            </p>
            <Link
              href="/register"
              className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
            >
              Small Business Banking Account <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY BANK WITH LUMINA ── */}
      <section className="bg-[#F4F4F4] border-t border-b border-[#E3E3E3] px-4 py-8">
        <h2 className="text-[1.45rem] font-light text-[#333] mb-7" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
          Why bank with <span className="font-medium">Lumina?</span>
        </h2>
        <div className="space-y-7">
          {([
            { icon: Landmark, desc: "With one of the UK's most accessible banking networks, we're easy to find." },
            { icon: CalendarDays, desc: "Meet with us for advice on selecting the right account for you, building your savings, managing debt or investing in your future." },
            { icon: RefreshCw, desc: "Have foreign cash delivered free to your home or your nearest Lumina Banking Centre." },
            { icon: Send, desc: "Send money to over 120 countries using Lumina Global Money Transfer and pay no transfer fee." },
          ] as const).map(({ icon: Icon, desc }) => (
            <div key={desc} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 border border-[#DB0011] rounded-full flex items-center justify-center">
                <Icon size={18} className="text-[#DB0011]" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-[#333] pt-1.5" style={{ lineHeight: "1.8", letterSpacing: "0.01em" }}>{desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#DB0011] mt-7 hover:underline"
        >
          Learn about more ways to bank <ChevronRight size={15} className="text-[#DB0011]" />
        </Link>
      </section>

      {/* ── DISCOVER OTHER WAYS ── */}
      <div className="px-4 pt-16 pb-12 text-center">
        <h2 className="text-[1.45rem] font-light text-[#333]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.55" }}>
          Discover other ways we can help you
        </h2>
      </div>

      <div className="px-4 pb-4">
        <div className="border border-[#E3E3E3]">
          <Image
            src="/shield.jpeg"
            alt="Security shield"
            width={740}
            height={560}
            className="w-full h-auto block"
          />
          <div className="px-4 py-5">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              Your security, our priority
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              We use advanced encryption and multi-factor authentication to keep your account and money safe at all times.
            </p>
            <Link
              href="/register"
              className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
            >
              Learn about security <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="border border-[#E3E3E3]">
          <Image
            src="/investing.jpeg"
            alt="Man investing on tablet"
            width={770}
            height={514}
            className="w-full h-auto block"
          />
          <div className="px-4 py-5">
            <p className="text-[11px] font-semibold text-[#333] uppercase tracking-widest mb-2">Investing</p>
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              Trade smarter, not harder
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              Open a Lumina Investor's Edge account and access stocks, ETFs, and more with no commission on eligible trades.
            </p>
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]"
            >
              Learn more <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── PRE-CARD DIVIDER TEXT ── */}
      <div className="px-4 py-7 border-t border-[#E3E3E3]">
        <h2 className="text-[1.45rem] font-light text-[#333] mb-2" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
          Cards designed for you
        </h2>
        <p className="text-[15px] text-[#333]" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
          Whether you're spending at home or abroad, our range of Visa cards puts you in control — with cashback, travel perks, and zero foreign fees.
        </p>
      </div>

      {/* ── LUMINA CARD — featured style ── */}
      <section>
        {/* Full-bleed image, no side padding */}
        <Image
          src="/card.jpeg"
          alt="Lumina Business Visa Card"
          width={1366}
          height={768}
          className="w-full h-auto block"
        />
        {/* Dark feature strip below */}
        <div className="bg-[#1A1A1A] px-5 py-6">
          <p className="text-[#DB0011] text-xs font-semibold uppercase tracking-widest mb-2">Featured</p>
          <h2 className="text-[1.5rem] font-light text-white mb-3" style={{ letterSpacing: "0.03em", lineHeight: "1.25" }}>
            Lumina Business<br />Visa Signature
          </h2>
          <p className="text-[14px] text-white/70 mb-5" style={{ lineHeight: "1.85", letterSpacing: "0.01em" }}>
            No foreign transaction fees, unlimited cashback, and premium travel benefits worldwide. Built for business, designed for life.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#DB0011] text-white font-semibold py-3 px-7 text-sm hover:bg-[#b8000e] transition-colors"
          >
            Apply now
          </Link>
        </div>
      </section>

      {/* ── QUESTIONS ── */}
      <QuestionsSection />

      {/* ── FSCS MEMBERSHIP ── */}
      <section className="bg-white px-4 py-12 text-center border-t border-[#E3E3E3]">
        {/* FSCS badge */}
        <div className="inline-flex items-center gap-3 bg-[#003087] text-white px-7 py-4 rounded-full mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-widest leading-tight">FSCS</p>
            <p className="text-[11px] font-bold tracking-widest leading-tight">PROTECTED</p>
          </div>
        </div>
        <p className="text-[15px] text-[#333] max-w-xs mx-auto" style={{ lineHeight: "1.8", letterSpacing: "0.01em" }}>
          Lumina Bank is a member of the Financial Services Compensation Scheme (FSCS).
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        {/* Red top accent */}
        <div className="h-1 bg-[#DB0011]" />

        {/* Main dark footer */}
        <div className="bg-[#1A1A1A] px-5 pt-10 pb-8">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <LuminaDiamond />
            <span className="text-white font-semibold text-base tracking-tight">
              Lumina
            </span>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-x-6 mb-10">
            <div>
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">Banking</p>
              {["Current accounts", "Savings", "Credit cards", "Mortgages", "Loans", "Investments", "International"].map(l => (
                <p key={l} className="text-white/75 text-[13px] mb-2.5 hover:text-white cursor-pointer" style={{ lineHeight: "1.4" }}>{l}</p>
              ))}
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">Company</p>
              {["About Lumina", "Help & FAQs", "Security centre", "Careers", "Privacy policy", "Terms of use", "Complaints"].map(l => (
                <p key={l} className="text-white/75 text-[13px] mb-2.5 hover:text-white cursor-pointer" style={{ lineHeight: "1.4" }}>{l}</p>
              ))}
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-5 mb-8">
            <a href="#" aria-label="Facebook" className="text-white/50 hover:text-white transition-colors"><FbIcon /></a>
            <a href="#" aria-label="X" className="text-white/50 hover:text-white transition-colors"><XIcon /></a>
            <a href="#" aria-label="YouTube" className="text-white/50 hover:text-white transition-colors"><YtIcon /></a>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-6" />

          {/* Legal bottom */}
          <p className="text-white/40 text-[11px] leading-relaxed mb-3">
            Lumina Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Financial Services Register number: 123456.
          </p>
          <p className="text-white/40 text-[11px] leading-relaxed mb-5">
            Eligible deposits are protected up to £85,000 per person by the Financial Services Compensation Scheme (FSCS). This website is designed for use in the United Kingdom.
          </p>
          <p className="text-white/30 text-[11px]">
            © Lumina Group 2025–2026. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const ALL_QUESTIONS = [
  { q: "How do I open a Lumina Bank account?", a: "You can open an account online in minutes. Click 'Open an account' on our homepage, complete the form, and verify your identity. Your account will be ready within 24 hours." },
  { q: "What is a pending transaction?", a: "A pending transaction is a payment that has been authorised but not yet fully processed. It temporarily reduces your available balance until the payment is settled, usually within 1–3 working days." },
  { q: "How do I make a credit card payment?", a: "Log on to Online Banking, go to Cards, select your credit card and choose 'Make a payment'. You can pay the minimum amount, full balance, or a custom amount from any linked account." },
  { q: "How do I transfer money to another account?", a: "Go to Transfer & Pay in the app or Online Banking. Choose Internal Transfer for your own accounts or Domestic Transfer for other UK banks. International transfers are also supported." },
  { q: "How do I freeze or unfreeze my card?", a: "Go to Cards in Online Banking or the app, select the card you want to manage and tap 'Freeze card'. You can unfreeze it at any time using the same option." },
  { q: "What are the daily transfer limits?", a: "Standard current account limits are £10,000 per day for domestic transfers and £25,000 for international transfers. Lumina Premier customers benefit from higher limits." },
  { q: "How do I dispute a transaction?", a: "If you see a transaction you don't recognise, go to Transactions, select the item and tap 'Dispute this transaction'. Our team will investigate and respond within 5 working days." },
  { q: "What is the difference between available and current balance?", a: "Your current balance is the total funds in your account. Your available balance is what you can actually spend — it excludes any pending transactions or holds on your account." },
  { q: "How do I update my personal details?", a: "Log on to Online Banking, go to Profile and select the detail you wish to update. Some changes such as address updates may require identity verification." },
  { q: "How do I apply for a loan?", a: "Go to Loans in Online Banking and check your eligibility. If eligible, you can apply online and receive a decision instantly. Funds are typically transferred within one working day." },
];

function QuestionsSection() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const visible = showAll ? ALL_QUESTIONS : ALL_QUESTIONS.slice(0, 5);

  return (
    <section className="bg-white px-4 py-16 border-t border-[#E3E3E3]">
      {/* Heading */}
      <h2 className="text-[2rem] font-light text-[#333] text-center mb-10" style={{ letterSpacing: "0.02em" }}>
        Questions?
      </h2>

      {/* Search box */}
      <div className="flex border border-[#999] mb-8">
        <input
          type="text"
          placeholder="Enter your question"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 text-[15px] text-[#333] outline-none placeholder-[#999]"
        />
        <button className="bg-[#DB0011] px-4 flex items-center justify-center hover:bg-[#b8000e] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Top questions toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mx-auto text-[#DB0011] text-[15px] font-semibold border-b border-[#DB0011] pb-0.5 mb-6"
      >
        Top questions
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB0011" strokeWidth="2.5" strokeLinecap="round">
          {open ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      </button>

      {/* Accordion */}
      {open && (
        <div>
          <p className="text-[15px] font-bold text-[#333] mb-1">Top questions</p>
          <p className="text-[13px] text-[#767676] mb-4">Displaying {visible.length} out of {ALL_QUESTIONS.length} question(s)</p>

          <div className="border-t border-[#E3E3E3]">
            {visible.map((item, i) => (
              <div key={i} className="border-b border-[#E3E3E3]">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-2 py-4 text-left"
                >
                  <span className="text-[15px] text-[#333] pr-4" style={{ lineHeight: "1.5" }}>{item.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DB0011" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                    {expanded === i ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
                  </svg>
                </button>
                {expanded === i && (
                  <p className="px-2 pb-4 text-[14px] text-[#555]" style={{ lineHeight: "1.75" }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>

          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-5 border border-[#DB0011] text-[#DB0011] font-semibold py-3.5 text-sm hover:bg-red-50 transition-colors"
            >
              Show more questions
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function MenuThick() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="square">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function LuminaDiamond({ white = false }: { white?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      {/* Outer diamond */}
      <path d="M13 1L25 13L13 25L1 13L13 1Z" fill={white ? "white" : "#DB0011"} />
      {/* Inner diamond cutout */}
      <path d="M13 6L20 13L13 20L6 13L13 6Z" fill={white ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.35)"} />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YtIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 576 512" fill="currentColor">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
    </svg>
  );
}
