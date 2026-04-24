import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { buildAbsoluteUrl, buildAlternates, buildLocalePath } from '@/lib/seo';

describe('seo routing', () => {
	it('keeps default-locale URLs unprefixed', () => {
		expect(buildLocalePath('en', '/')).toBe('/');
		expect(buildLocalePath('en', '/blog')).toBe('/blog');
		expect(buildAbsoluteUrl('en', '/quiz/world-map-quiz')).toBe(
			'https://mapquiz.pro/quiz/world-map-quiz'
		);
	});

	it('prefixes non-default locales and publishes hreflang alternates', () => {
		expect(buildLocalePath('zh', '/')).toBe('/zh');
		expect(buildAbsoluteUrl('ja', '/faq')).toBe(
			'https://mapquiz.pro/ja/faq'
		);

		expect(buildAlternates('zh', '/faq')).toEqual({
			canonical: 'https://mapquiz.pro/zh/faq',
			languages: {
				en: 'https://mapquiz.pro/faq',
				zh: 'https://mapquiz.pro/zh/faq',
				ja: 'https://mapquiz.pro/ja/faq',
				'x-default': 'https://mapquiz.pro/faq'
			}
		});
	});

	it('disables locale detection so crawlers never get redirected by language', () => {
		expect(routing.localeDetection).toBe(false);
	});
});
