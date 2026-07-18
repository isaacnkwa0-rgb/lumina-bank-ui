"use client";

import { useLanguage } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "EN", flag: "🇬🇧", label: "EN" },
  { code: "ES", flag: "🇪🇸", label: "ES" },
  { code: "FR", flag: "🇫🇷", label: "FR" },
  { code: "PT", flag: "🇵🇹", label: "PT" },
  { code: "DE", flag: "🇩🇪", label: "DE" },
];

interface LanguageSwitcherProps {
  /** When true, renders a compact select appropriate for tight nav bars */
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className = "" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  if (compact) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          aria-label="Select language"
          className="appearance-none bg-transparent text-[#333] text-xs font-semibold pr-4 pl-1 py-1 border border-[#E3E3E3] rounded focus:outline-none focus:border-[#DB0011] cursor-pointer hover:border-[#DB0011] transition-colors"
          style={{ minWidth: "70px" }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          className="pointer-events-none absolute right-1 text-[#DB0011]"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }

  // Full selector — used inside settings / profile
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <span className="text-lg">{current.flag}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        aria-label="Select language"
        className="appearance-none flex-1 bg-transparent text-sm text-[#333] font-medium pr-6 focus:outline-none cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.code} — {l.code === "EN" ? "English" : l.code === "ES" ? "Español" : l.code === "FR" ? "Français" : l.code === "PT" ? "Português" : "Deutsch"}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none text-[#DB0011] flex-shrink-0"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
