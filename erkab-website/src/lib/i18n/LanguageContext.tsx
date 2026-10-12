'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { Locale, DEFAULT_LOCALE } from './config';
import { messages, TranslationDictionary } from './messages';

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
  t: TranslationDictionary;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('erkab_locale_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('erkab_locale_change', callback);
  };
}

function getSnapshot(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const val = localStorage.getItem('erkab_locale');
    if (val === 'en' || val === 'am') return val;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  toggleLocale: () => {},
  t: (messages[DEFAULT_LOCALE] as unknown) as TranslationDictionary,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = (newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('erkab_locale', newLocale);
        window.dispatchEvent(new Event('erkab_locale_change'));
      } catch {
        // ignore
      }
    }
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'am' : 'en';
    setLocale(next);
  };

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t: (messages[locale] as unknown) as TranslationDictionary,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
