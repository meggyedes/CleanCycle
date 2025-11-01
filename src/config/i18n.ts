import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Támogatott nyelvek
export const locales = ['en', 'hu', 'nl', 'de', 'fr', 'it', 'be', 'bg', 'sk'] as const;
export type Locale = (typeof locales)[number];

// Alapértelmezett nyelv
export const defaultLocale: Locale = 'en';

// Nyelv nevek (natív)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  hu: 'Magyar',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  be: 'Vlaams', // Belga (flamand)
  bg: 'Български',
  sk: 'Slovenčina',
};

// Nyelv zászlók (emoji - backward compatibility)
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  hu: '🇭🇺',
  nl: '🇳🇱',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  be: '🇧🇪',
  bg: '🇧🇬',
  sk: '🇸🇰',
};

// Flag-icons CSS osztályok (ISO 3166-1-alpha-2 kódok)
export const localeFlagIcons: Record<Locale, string> = {
  en: 'gb', // Great Britain
  hu: 'hu', // Hungary
  nl: 'nl', // Netherlands
  de: 'de', // Germany
  fr: 'fr', // France
  it: 'it', // Italy
  be: 'be', // Belgium
  bg: 'bg', // Bulgaria
  sk: 'sk', // Slovakia
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../../locales/${validLocale}.json`)).default,
  };
});

