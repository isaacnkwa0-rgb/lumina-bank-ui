"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import translations, { type Language, type TranslationKey } from "./translations";
import { usersApi } from "@/lib/api";
import { getToken } from "@/lib/auth";

const LANG_KEY = "lumina_lang";
const SUPPORTED: Language[] = ["EN", "ES", "FR", "PT", "DE"];

function isLanguage(v: unknown): v is Language {
  return typeof v === "string" && (SUPPORTED as string[]).includes(v);
}

function loadLang(): Language {
  if (typeof window === "undefined") return "EN";
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // ignore
  }
  return "EN";
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translate a key, with optional {placeholder} substitution */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "EN",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");
  // Track whether we've initialised from localStorage (client-side only)
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first client render
  useEffect(() => {
    setLangState(loadLang());
    setHydrated(true);
  }, []);

  const setLang = useCallback(
    (next: Language) => {
      if (!SUPPORTED.includes(next)) return;
      setLangState(next);
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch {
        // ignore
      }
      // Sync to API only when authenticated — avoids redirect on landing page
      if (getToken()) {
        usersApi.updateProfile({ preferredLanguage: next }).catch(() => {});
      }
    },
    []
  );

  /**
   * Sync language from user profile after login / profile load.
   * Call this from any component that has the user object.
   */
  const syncFromProfile = useCallback(
    (preferredLanguage: string | undefined | null) => {
      if (isLanguage(preferredLanguage)) {
        setLangState(preferredLanguage);
        try {
          localStorage.setItem(LANG_KEY, preferredLanguage);
        } catch {
          // ignore
        }
      }
    },
    []
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const map = translations[lang] ?? translations["EN"];
      let str: string = map[key] ?? translations["EN"][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  // Expose syncFromProfile on the context value through a separate internal key
  // We attach it to the window for convenient access from useAuth / login flows.
  useEffect(() => {
    if (!hydrated) return;
    (window as unknown as Record<string, unknown>).__luminaSyncLang = syncFromProfile;
    return () => {
      delete (window as unknown as Record<string, unknown>).__luminaSyncLang;
    };
  }, [hydrated, syncFromProfile]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export { LanguageContext };
export type { Language, TranslationKey };
