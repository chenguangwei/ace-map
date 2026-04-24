import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAllCampaignSlugs } from '@/lib/data/campaigns';
import { getAllBlogSlugs } from '@/lib/data/content';
import { quizTopics } from '@/lib/data/quizTopics';
import { buildAbsoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
	const staticRoutes = ['', '/quizzes', '/campaigns', '/blog', '/faq'];
	const slugRoutes = quizTopics.map((t) => `/quiz/${t.slug}`);
	const campaignRoutes = getAllCampaignSlugs().map(
		(slug) => `/campaign/${slug}`
	);
	const blogRoutes = getAllBlogSlugs().map((slug) => `/blog/${slug}`);
	const allRoutes = [
		...staticRoutes,
		...slugRoutes,
		...campaignRoutes,
		...blogRoutes
	];

	return allRoutes.flatMap((route) =>
		routing.locales.map((locale) => ({
			url: buildAbsoluteUrl(locale, route || '/'),
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: route === '' ? 1 : 0.8
		}))
	);
}
