'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  zh: '中文',
  ja: '日本語'
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: string) => {
    // Strip current locale prefix from pathname if present
    let path = pathname;
    for (const l of routing.locales) {
      if (l !== routing.defaultLocale && path.startsWith(`/${l}`)) {
        path = path.slice(`/${l}`.length) || '/';
        break;
      }
    }
    // Add new locale prefix if not default
    const newPath = newLocale === routing.defaultLocale ? path : `/${newLocale}${path}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleSwitch(l)}
          className={`rounded px-2 py-1 text-xs font-semibold transition ${
            l === locale
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
              : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
