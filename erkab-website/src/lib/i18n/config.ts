export type Locale = 'en' | 'am';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'am'];

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'EN' },
  am: { label: 'አማርኛ', flag: 'አማ' },
};
