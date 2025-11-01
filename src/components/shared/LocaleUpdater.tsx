'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * LocaleUpdater Component
 * 
 * This component updates the HTML lang attribute dynamically based on the current locale.
 * It should be placed in the layout to ensure the lang attribute is always in sync with the current locale.
 * 
 * Usage:
 * ```tsx
 * <LocaleUpdater />
 * ```
 */
export default function LocaleUpdater() {
  const locale = useLocale();

  useEffect(() => {
    // Update the HTML lang attribute
    document.documentElement.lang = locale;
    
    // Also update the dir attribute for RTL languages if needed
    // For now, all supported languages are LTR
    document.documentElement.dir = 'ltr';
  }, [locale]);

  // This component doesn't render anything
  return null;
}

