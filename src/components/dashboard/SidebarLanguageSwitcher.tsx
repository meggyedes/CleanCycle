'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/config/routing';
import { useState, useTransition } from 'react';
import { locales, localeNames, localeFlagIcons, type Locale } from '@/config/i18n';

export default function SidebarLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setIsOpen(false);
    startTransition(() => {
      // Use push instead of replace to ensure proper page reload with new locale
      router.push(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        aria-label="Change language"
      >
        <span className={`fi fi-${localeFlagIcons[locale as Locale]}`} style={{ fontSize: '1rem' }}></span>
        <span className="font-medium text-gray-700 text-xs">{localeNames[locale as Locale]}</span>
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                disabled={isPending}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  locale === loc ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                }`}
              >
                <span className={`fi fi-${localeFlagIcons[loc]}`} style={{ fontSize: '1rem' }}></span>
                <span className="font-medium text-xs">{localeNames[loc]}</span>
                {locale === loc && (
                  <svg
                    className="w-4 h-4 ml-auto text-teal-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

