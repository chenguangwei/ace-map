import type { MetadataRoute } from 'next';
import { quizTopics } from '@/lib/data/quizTopics';

const SITE_URL = 'https://ace-map.vercel.app';

const sitemap = (): MetadataRoute.Sitemap => [
	{
		url: SITE_URL,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: 1
	},
	{
		url: `${SITE_URL}/quizzes`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: 0.9
	},
	{
		url: `${SITE_URL}/game`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: 0.7
	},
	...quizTopics.map((topic) => ({
		url: `${SITE_URL}/quiz/${topic.slug}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority:
			topic.section === 'popular'
				? 0.95
				: topic.kind === 'root'
					? 0.85
					: 0.75
	}))
];

export default sitemap;
