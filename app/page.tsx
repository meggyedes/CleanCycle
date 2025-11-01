import { redirect } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

// Redirect root to default locale
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

