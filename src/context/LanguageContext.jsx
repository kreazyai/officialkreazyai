// ─────────────────────────────────────────────────────────────────────────────
// KREAZY AI - TRILINGUAL LOCALIZATION CONTEXT PROVIDER
// Manages reactive language state across the entire website
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, SUPPORTED_LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'kreazy_website_lang';

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'bn' || saved === 'es')) {
        return saved;
      }
      // Check browser language
      const browserLang = navigator?.language?.slice(0, 2)?.toLowerCase();
      if (browserLang === 'bn') return 'bn';
      if (browserLang === 'es') return 'es';
    } catch {}
    return 'en';
  });

  const setLang = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'bn' && newLang !== 'es') return;
    setCurrentLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch (err) {
      console.warn('Failed to save language choice:', err);
    }
  }, []);

  // Update html lang attribute on mount or change
  useEffect(() => {
    try {
      document.documentElement.lang = currentLang;
    } catch {}
  }, [currentLang]);

  // Translation helper: resolves dot-notation keys like "nav.solutions" or "hero.badge"
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');

    // 1. Try current language
    let current = translations[currentLang];
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined) return current;

    // 2. Fallback to English
    let fallbackObj = translations.en;
    for (const part of parts) {
      if (fallbackObj && typeof fallbackObj === 'object' && part in fallbackObj) {
        fallbackObj = fallbackObj[part];
      } else {
        fallbackObj = undefined;
        break;
      }
    }

    if (fallbackObj !== undefined) return fallbackObj;

    return fallback || path;
  }, [currentLang]);

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const value = {
    currentLang,
    setLang,
    t,
    languages: SUPPORTED_LANGUAGES,
    currentLangInfo
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
