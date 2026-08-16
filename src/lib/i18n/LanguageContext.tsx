"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  LanguageCode,
  LanguageMeta,
  SUPPORTED_LANGUAGES,
  translations,
} from "./translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentMeta: LanguageMeta;
  languages: LanguageMeta[];
  dir: "ltr" | "rtl";
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "fooddrop_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
      } else {
        // Optional: Detect browser language
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === "bn" || browserLang === "ar" || browserLang === "es") {
          setLanguageState(browserLang as LanguageCode);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Update HTML document attributes whenever language changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
      document.documentElement.lang = language;
      document.documentElement.dir = meta.dir;
    }
  }, [language]);

  const setLanguage = (newLang: LanguageCode) => {
    if (!translations[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      window.dispatchEvent(new Event("fooddrop-language-change"));
    } catch (e) {
      // ignore
    }
  };

  // Translation lookup function
  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const currentMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentMeta,
        languages: SUPPORTED_LANGUAGES,
        dir: currentMeta.dir,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      language: "en" as LanguageCode,
      setLanguage: () => {},
      currentMeta: SUPPORTED_LANGUAGES[0],
      languages: SUPPORTED_LANGUAGES,
      dir: "ltr" as const,
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
}
