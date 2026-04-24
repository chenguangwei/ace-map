import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
	it('only publishes canonical locale URLs', () => {
		const urls = sitemap().map((entry) => entry.url);

		expect(urls).toContain('https://mapquiz.pro');
		expect(urls).toContain('https://mapquiz.pro/zh');
		expect(urls).toContain('https://mapquiz.pro/ja');
		expect(urls).not.toContain('https://mapquiz.pro/en');
		expect(urls.every((url) => !url.includes('/en/'))).toBe(true);
	});
});
