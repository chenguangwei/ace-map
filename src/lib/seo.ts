import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export const SITE_URL = 'https://mapquiz.pro';

const normalizePath = (path: string) => {
	if (!path || path === '/') return '';
	return path.startsWith('/') ? path : `/${path}`;
};

export const buildLocalePath = (locale: string, path: string) => {
	const normalizedPath = normalizePath(path);

	if (locale === routing.defaultLocale) {
		return normalizedPath || '/';
	}

	return `/${locale}${normalizedPath}`;
};

export const buildAbsoluteUrl = (locale: string, path: string) => {
	const localizedPath = buildLocalePath(locale, path);
	return `${SITE_URL}${localizedPath === '/' ? '' : localizedPath}`;
};

export const buildLanguageAlternates = (path: string) => ({
	...Object.fromEntries(
		routing.locales.map((locale) => [
			locale,
			buildAbsoluteUrl(locale, path)
		])
	),
	'x-default': buildAbsoluteUrl(routing.defaultLocale, path)
});

export const buildAlternates = (
	locale: string,
	path: string
): NonNullable<Metadata['alternates']> => ({
	canonical: buildAbsoluteUrl(locale, path),
	languages: buildLanguageAlternates(path)
});

export const buildPageMetadata = ({
	locale,
	path,
	title,
	description,
	keywords,
	openGraphType = 'website'
}: {
	locale: string;
	path: string;
	title: string;
	description: string;
	keywords?: Metadata['keywords'];
	openGraphType?: 'website' | 'article';
}): Metadata => ({
	title,
	description,
	keywords,
	alternates: buildAlternates(locale, path),
	openGraph: {
		title,
		description,
		url: buildAbsoluteUrl(locale, path),
		type: openGraphType,
		siteName: 'MapQuiz.pro'
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description
	}
});
