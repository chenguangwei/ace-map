import { routing } from '@/i18n/routing';
import { quizTopics } from '@/lib/data/quizTopics';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://mapquiz.pro';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/quizzes'];
  const slugRoutes = quizTopics.map((t) => `/quiz/${t.slug}`);
  const allRoutes = [...staticRoutes, ...slugRoutes];

  return allRoutes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url:
        locale === routing.defaultLocale
          ? `${SITE_URL}${route}`
          : `${SITE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8
    }))
  );
}
