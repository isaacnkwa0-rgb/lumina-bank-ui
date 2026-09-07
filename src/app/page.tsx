"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronRight, Landmark, CalendarDays, RefreshCw, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const products = [
    { labelKey: "products.currentAccounts" as const, href: "/current-account" },
    { labelKey: "products.savingsAccounts" as const, href: "/savings" },
    { labelKey: "products.creditCards" as const, href: "/credit-cards" },
    { labelKey: "products.loans" as const, href: "/personal-loans" },
    { labelKey: "products.mortgages" as const, href: "/mortgages" },
    { labelKey: "products.investments" as const, href: "/wealth" },
    { labelKey: "products.internationalBanking" as const, href: "/international" },
    { labelKey: "products.insurance" as const, href: "/insurance-products" },
  ];

  const menuLinks = [
    { key: "menu.currentAccounts", href: "/current-account" },
    { key: "menu.savings",         href: "/savings" },
    { key: "menu.creditCards",     href: "/credit-cards" },
    { key: "menu.loans",           href: "/personal-loans" },
    { key: "menu.mortgages",       href: "/mortgages" },
    { key: "menu.investments",     href: "/wealth" },
    { key: "menu.international",   href: "/international" },
    { key: "menu.insurance",       href: "/insurance-products" },
    { key: "menu.helpSupport",     href: "mailto:support@luminabank.online" },
  ] as const;

  const desktopNav = [
    { label: "Current Accounts", href: "/current-account" },
    { label: "Savings",          href: "/savings" },
    { label: "Mortgages",        href: "/mortgages" },
    { label: "Loans",            href: "/personal-loans" },
    { label: "Investments",      href: "/wealth" },
    { label: "Insurance",        href: "/insurance-products" },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', Arial, sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E3E3E3] h-14 flex items-center px-4 gap-2 lg:h-16 lg:px-10 lg:gap-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1 -ml-1 text-[#333] lg:hidden"
          aria-label={t("nav.openMenu")}
        >
          <MenuThick />
        </button>

        {/* Logo */}
        <div className="flex-1 flex items-center justify-center gap-2.5 lg:flex-none lg:justify-start lg:mr-10">
          <LuminaDiamond />
          <span className="font-bold text-[#333] text-lg tracking-tight">Lumina</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 flex-1">
          {desktopNav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] text-[#444] hover:text-[#DB0011] transition-colors font-medium whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        <LanguageSwitcher compact className="mr-2 lg:mr-3" />

        <Link
          href="/login"
          className="bg-[#DB0011] text-white text-xs font-semibold px-4 h-8 flex items-center hover:bg-[#b8000e] transition-colors whitespace-nowrap"
        >
          {t("nav.logOn")}
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
              {menuLinks.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-4 text-base text-[#333] border-b border-[#E3E3E3] hover:bg-[#F8F8F8]"
                >
                  {t(key)}
                  <ChevronRight size={18} className="text-[#DB0011]" />
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-[#E3E3E3]">
              <Link
                href="/login"
                className="block bg-[#DB0011] text-white text-center font-semibold py-3 text-sm hover:bg-[#b8000e]"
              >
                {t("nav.logOnFull")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-white lg:flex lg:items-stretch lg:min-h-[580px]">
        {/* Image — full-width mobile, left 58% desktop */}
        <div className="w-full lg:w-[58%] lg:flex-shrink-0 lg:overflow-hidden lg:h-[580px]">
          <Image
            src="/hero.jpeg"
            alt="Customer paying with phone at shop"
            width={1224}
            height={816}
            className="w-full h-auto block lg:h-full lg:w-full lg:object-cover lg:object-center"
            priority
          />
        </div>

        {/* Text panel — overlapping card on mobile, right column on desktop */}
        <div className="relative -mt-6 mx-4 bg-white px-4 pt-5 pb-6 lg:mt-0 lg:mx-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-16 lg:border-l lg:border-[#E3E3E3]">
          <h3
            className="text-[1.95rem] font-light text-[#333] mb-4 lg:text-[2.5rem] lg:leading-tight"
            style={{ letterSpacing: "0.04em", wordSpacing: "0.1em", lineHeight: "1.2" }}
          >
            {t("hero.heading")}
          </h3>
          <p className="text-[15px] text-[#333] mb-6 lg:text-base lg:max-w-sm" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            {t("hero.body")}
          </p>
          <div>
            <Link
              href="/register"
              className="inline-block bg-[#DB0011] text-white font-semibold py-3 px-8 text-sm hover:bg-[#b8000e] transition-colors lg:py-4 lg:px-10 lg:text-base"
            >
              {t("hero.applyNow")}
            </Link>
          </div>
          <p className="text-[12px] text-[#555] mt-3 leading-[1.7]">
            {t("hero.disclaimer")}{" "}
            <Link href="/terms" className="underline text-[#555]">{t("hero.viewTerms")}</Link>{" "}
            {t("hero.offerMayBeWithdrawn")}
          </p>
        </div>
      </section>

      {/* ── PREMIER + FUNDS CARDS ── */}
      <div className="px-4 py-5 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:px-10 lg:py-10 lg:max-w-7xl lg:mx-auto">
        <div className="bg-white border border-[#E3E3E3] px-4 py-5 lg:px-8 lg:py-8 hover:shadow-sm transition-shadow">
          <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.7rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
            {t("premier.heading")}
          </h2>
          <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            {t("premier.body")}
          </p>
          <Link href="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011] transition-colors">
            {t("premier.link")} <ChevronRight size={16} className="text-[#DB0011]" />
          </Link>
        </div>

        <div className="bg-white border border-[#E3E3E3] px-4 py-5 lg:px-8 lg:py-8 hover:shadow-sm transition-shadow">
          <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.7rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
            {t("buyManage.heading")}
          </h2>
          <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
            {t("buyManage.body")}
          </p>
          <Link href="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011] transition-colors">
            {t("buyManage.link")} <ChevronRight size={16} className="text-[#DB0011]" />
          </Link>
        </div>
      </div>

      <div className="h-2 bg-[#F0F0F0]" />

      {/* ── PRODUCTS LIST ── */}
      <section className="px-4 lg:max-w-7xl lg:mx-auto lg:px-10 lg:grid lg:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.labelKey}
            href={product.href}
            className="flex items-center py-5 border-b border-[#E3E3E3] hover:opacity-70 transition-opacity lg:px-4 lg:hover:opacity-100 lg:hover:bg-[#F8F8F8] lg:hover:text-[#DB0011]"
          >
            <span className="text-[1.35rem] font-normal text-[#333]" style={{ letterSpacing: "0.01em" }}>{t(product.labelKey)}</span>
            <ChevronRight size={20} className="text-[#DB0011] flex-shrink-0 ml-1" />
          </Link>
        ))}
      </section>

      <div className="h-10" />

      {/* ── LOOKING FOR HELP ── */}
      <section className="px-4 lg:max-w-7xl lg:mx-auto lg:px-10">
        <div className="border border-[#E3E3E3] lg:flex lg:items-stretch">
          <div className="lg:w-[45%] lg:flex-shrink-0 lg:overflow-hidden">
            <Image
              src="/family.jpeg"
              alt="Happy family"
              width={1080}
              height={720}
              className="w-full h-auto block lg:h-full lg:object-cover lg:object-center"
            />
          </div>
          <div className="px-4 py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-14">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.9rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              {t("help.heading")}
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              {t("help.body")}
            </p>
            <div className="space-y-2">
              <Link href="/forgot-password" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
                {t("help.digitalReset")} <ChevronRight size={14} className="text-[#DB0011]" />
              </Link>
              <Link href="/login" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
                {t("help.managingAccount")} <ChevronRight size={14} className="text-[#DB0011]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-6" />

      {/* ── GROWING YOUR MONEY ── */}
      <section className="px-4 lg:max-w-7xl lg:mx-auto lg:px-10">
        <div className="border border-[#E3E3E3] lg:flex lg:flex-row-reverse lg:items-stretch">
          <div className="lg:w-[45%] lg:flex-shrink-0 lg:overflow-hidden">
            <Image
              src="/growth.jpeg"
              alt="Coins in a jar with a growing plant"
              width={1224}
              height={688}
              className="w-full h-auto block lg:h-full lg:object-cover lg:object-center"
            />
          </div>
          <div className="px-4 py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-14">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.9rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              {t("growMoney.heading")}
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              {t("growMoney.body")}
            </p>
            <Link href="/login" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
              {t("growMoney.link")} <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-6" />

      {/* ── SMALL BUSINESS ── */}
      <section className="px-4 lg:max-w-7xl lg:mx-auto lg:px-10">
        <div className="border border-[#E3E3E3] lg:flex lg:items-stretch">
          <div className="lg:w-[45%] lg:flex-shrink-0 lg:overflow-hidden">
            <Image
              src="/business.jpeg"
              alt="Small business owner at counter"
              width={1200}
              height={675}
              className="w-full h-auto block lg:h-full lg:object-cover lg:object-center"
            />
          </div>
          <div className="px-4 py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-14">
            <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.9rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
              {t("smallBiz.heading")}
            </h2>
            <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
              {t("smallBiz.body")}
            </p>
            <Link href="/register" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
              {t("smallBiz.link")} <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY BANK WITH LUMINA ── */}
      <section className="bg-[#F4F4F4] border-t border-b border-[#E3E3E3] px-4 py-8 lg:px-10 lg:py-16">
        <div className="lg:max-w-7xl lg:mx-auto">
          <h2 className="text-[1.45rem] font-light text-[#333] mb-7 lg:text-[1.9rem] lg:mb-10" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
            {t("whyLumina.heading")}
          </h2>
          <div className="space-y-7 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0">
            {([
              { icon: Landmark,    descKey: "whyLumina.reason1" },
              { icon: CalendarDays, descKey: "whyLumina.reason2" },
              { icon: RefreshCw,  descKey: "whyLumina.reason3" },
              { icon: Send,        descKey: "whyLumina.reason4" },
            ] as const).map(({ icon: Icon, descKey }) => (
              <div key={descKey} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#DB0011] rounded-full flex items-center justify-center">
                  <Icon size={18} className="text-[#DB0011]" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] text-[#333] pt-1.5" style={{ lineHeight: "1.8", letterSpacing: "0.01em" }}>{t(descKey)}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#DB0011] mt-7 hover:underline lg:mt-10"
          >
            {t("whyLumina.learnMore")} <ChevronRight size={15} className="text-[#DB0011]" />
          </Link>
        </div>
      </section>

      {/* ── DISCOVER OTHER WAYS ── */}
      <div className="px-4 pt-16 pb-12 text-center">
        <h2 className="text-[1.45rem] font-light text-[#333] lg:text-[2rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.55" }}>
          {t("discover.heading")}
        </h2>
      </div>

      {/* ── SECURITY + INVESTING — stacked mobile, side-by-side desktop ── */}
      <div className="space-y-4 px-4 pb-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:max-w-7xl lg:mx-auto lg:px-10 lg:pb-10">
        {/* Security */}
        <div className="border border-[#E3E3E3] lg:flex lg:flex-col">
          <div className="lg:overflow-hidden">
            <Image
              src="/shield.jpeg"
              alt="Security shield"
              width={740}
              height={560}
              className="w-full h-auto block lg:h-[260px] lg:object-cover lg:object-center"
            />
          </div>
          <div className="px-4 py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:px-8 lg:py-8">
            <div>
              <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.65rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
                {t("security.heading")}
              </h2>
              <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
                {t("security.body")}
              </p>
            </div>
            <Link href="/register" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
              {t("security.link")} <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>

        {/* Investing */}
        <div className="border border-[#E3E3E3] lg:flex lg:flex-col">
          <div className="lg:overflow-hidden">
            <Image
              src="/investing.jpeg"
              alt="Man investing on tablet"
              width={770}
              height={514}
              className="w-full h-auto block lg:h-[260px] lg:object-cover lg:object-center"
            />
          </div>
          <div className="px-4 py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:px-8 lg:py-8">
            <div>
              <p className="text-[11px] font-semibold text-[#333] uppercase tracking-widest mb-2">{t("investing.tag")}</p>
              <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.65rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
                {t("investing.heading")}
              </h2>
              <p className="text-[15px] text-[#333] mb-4" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
                {t("investing.body")}
              </p>
            </div>
            <Link href="/login" className="flex items-center gap-1 text-sm font-semibold text-[#333] hover:text-[#DB0011]">
              {t("investing.link")} <ChevronRight size={14} className="text-[#DB0011]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── PRE-CARD DIVIDER TEXT ── */}
      <div className="px-4 py-7 border-t border-[#E3E3E3] lg:max-w-7xl lg:mx-auto lg:px-10 lg:py-12">
        <h2 className="text-[1.45rem] font-light text-[#333] mb-2 lg:text-[1.9rem]" style={{ letterSpacing: "0.03em", wordSpacing: "0.08em", lineHeight: "1.2" }}>
          {t("cards.heading")}
        </h2>
        <p className="text-[15px] text-[#333]" style={{ lineHeight: "1.9", letterSpacing: "0.01em" }}>
          {t("cards.body")}
        </p>
      </div>

      {/* ── LUMINA CARD ── */}
      <section className="lg:max-w-7xl lg:mx-auto lg:px-10 lg:pb-10">
        <div className="lg:border lg:border-[#E3E3E3] lg:overflow-hidden">
          <Image
            src="/card.jpeg"
            alt="Lumina Business Visa Card"
            width={1366}
            height={768}
            className="w-full h-auto block lg:h-[400px] lg:object-cover lg:object-center"
          />
        </div>
        <div className="bg-[#1A1A1A] px-5 py-6 lg:px-10 lg:py-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <p className="text-[#DB0011] text-xs font-semibold uppercase tracking-widest mb-2">{t("cards.featured")}</p>
            <h2 className="text-[1.5rem] font-light text-white mb-3 lg:text-[2rem]" style={{ letterSpacing: "0.03em", lineHeight: "1.25" }}>
              {t("cards.cardName").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="text-[14px] text-white/70 mb-5 lg:mb-0 lg:max-w-md" style={{ lineHeight: "1.85", letterSpacing: "0.01em" }}>
              {t("cards.cardBody")}
            </p>
          </div>
          <Link
            href="/register"
            className="inline-block bg-[#DB0011] text-white font-semibold py-3 px-7 text-sm hover:bg-[#b8000e] transition-colors lg:flex-shrink-0 lg:py-4 lg:px-10 lg:text-base"
          >
            {t("cards.applyNow")}
          </Link>
        </div>
      </section>

      {/* ── QUESTIONS ── */}
      <QuestionsSection />

      {/* ── FSCS MEMBERSHIP ── */}
      <section className="bg-white px-4 py-12 text-center border-t border-[#E3E3E3]">
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
        <p className="text-[15px] text-[#333] max-w-xs mx-auto lg:max-w-lg" style={{ lineHeight: "1.8", letterSpacing: "0.01em" }}>
          {t("fscs.body")}
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="h-1 bg-[#DB0011]" />
        <div className="bg-[#1A1A1A] px-5 pt-10 pb-8 lg:px-10 lg:pt-14 lg:pb-12">
          <div className="lg:max-w-7xl lg:mx-auto">

            <div className="flex items-center gap-2.5 mb-8 lg:mb-12">
              <LuminaDiamond />
              <span className="text-white font-semibold text-base tracking-tight">Lumina</span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 mb-10 lg:grid-cols-4 lg:gap-x-16 lg:mb-12">
              {/* Banking col A */}
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">{t("footer.banking")}</p>
                {([
                  { key: "footer.currentAccounts", href: "/current-account" },
                  { key: "footer.savings",          href: "/savings" },
                  { key: "footer.creditCards",      href: "/credit-cards" },
                  { key: "footer.mortgages",        href: "/mortgages" },
                ] as const).map(({ key, href }) => (
                  <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                ))}
                {/* Banking col B — visible mobile only, hidden desktop */}
                <div className="mt-2.5 lg:hidden">
                  {([
                    { key: "footer.loans",        href: "/personal-loans" },
                    { key: "footer.investments",  href: "/wealth" },
                    { key: "footer.international",href: "/international" },
                    { key: "footer.insurance",    href: "/insurance-products" },
                  ] as const).map(({ key, href }) => (
                    <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                  ))}
                </div>
              </div>

              {/* Banking col B — desktop only */}
              <div className="hidden lg:block">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3 invisible">.</p>
                {([
                  { key: "footer.loans",        href: "/personal-loans" },
                  { key: "footer.investments",  href: "/wealth" },
                  { key: "footer.international",href: "/international" },
                  { key: "footer.insurance",    href: "/insurance-products" },
                ] as const).map(({ key, href }) => (
                  <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                ))}
              </div>

              {/* Company col */}
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">{t("footer.company")}</p>
                {([
                  { key: "footer.aboutLumina",    href: "/about" },
                  { key: "footer.helpFaqs",       href: "/login" },
                  { key: "footer.securityCentre", href: "/security" },
                  { key: "footer.careers",        href: "/careers" },
                ] as const).map(({ key, href }) => (
                  <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                ))}
              </div>

              {/* Legal col — desktop only */}
              <div className="hidden lg:block">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3 invisible">.</p>
                {([
                  { key: "footer.privacyPolicy",  href: "/privacy" },
                  { key: "footer.termsOfUse",     href: "/terms" },
                  { key: "footer.complaints",     href: "/complaints" },
                ] as const).map(({ key, href }) => (
                  <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                ))}
              </div>
            </div>

            {/* Legal links — mobile only (desktop shows in 4th col above) */}
            <div className="grid grid-cols-2 gap-x-6 mb-10 lg:hidden">
              <div>
                {([
                  { key: "footer.privacyPolicy",  href: "/privacy" },
                  { key: "footer.termsOfUse",     href: "/terms" },
                  { key: "footer.complaints",     href: "/complaints" },
                ] as const).map(({ key, href }) => (
                  <Link key={key} href={href} className="block text-white/75 text-[13px] mb-2.5 hover:text-white transition-colors" style={{ lineHeight: "1.4" }}>{t(key)}</Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-5 mb-8">
              <a href="#" aria-label="Facebook" className="text-white/50 hover:text-white transition-colors"><FbIcon /></a>
              <a href="#" aria-label="X" className="text-white/50 hover:text-white transition-colors"><XIcon /></a>
              <a href="#" aria-label="YouTube" className="text-white/50 hover:text-white transition-colors"><YtIcon /></a>
            </div>

            <div className="h-px bg-white/10 mb-6" />

            <p className="text-white/40 text-[11px] leading-relaxed mb-3">{t("footer.legal1")}</p>
            <p className="text-white/40 text-[11px] leading-relaxed mb-5">{t("footer.legal2")}</p>
            <p className="text-white/30 text-[11px]">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuestionsSection() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  const ALL_QUESTIONS = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
    { q: t("faq.q9"), a: t("faq.a9") },
    { q: t("faq.q10"), a: t("faq.a10") },
  ];

  const visible = showAll ? ALL_QUESTIONS : ALL_QUESTIONS.slice(0, 5);

  return (
    <section className="bg-white px-4 py-16 border-t border-[#E3E3E3] lg:px-10">
      <div className="lg:max-w-3xl lg:mx-auto">
        <h2 className="text-[2rem] font-light text-[#333] text-center mb-10" style={{ letterSpacing: "0.02em" }}>
          {t("questions.heading")}
        </h2>

        <div className="flex border border-[#999] mb-8">
          <input
            type="text"
            placeholder={t("questions.placeholder")}
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

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 mx-auto text-[#DB0011] text-[15px] font-semibold border-b border-[#DB0011] pb-0.5 mb-6"
        >
          {t("questions.topQuestions")}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB0011" strokeWidth="2.5" strokeLinecap="round">
            {open ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
        </button>

        {open && (
          <div>
            <p className="text-[15px] font-bold text-[#333] mb-1">{t("questions.topQuestions")}</p>
            <p className="text-[13px] text-[#767676] mb-4">
              {t("questions.displaying", { visible: visible.length, total: ALL_QUESTIONS.length })}
            </p>
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
                {t("questions.showMore")}
              </button>
            )}
          </div>
        )}
      </div>
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
      <path d="M13 1L25 13L13 25L1 13L13 1Z" fill={white ? "white" : "#DB0011"} />
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
