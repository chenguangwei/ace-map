import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import Navbar from '@/lib/components/Navbar';
import Providers from '@/lib/components/Providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

const localeFontFamilies = {
	zh: [
		'"PingFang SC"',
		'"Hiragino Sans GB"',
		'"Microsoft YaHei"',
		'"Noto Sans CJK SC"',
		'"Source Han Sans SC"',
		'sans-serif'
	].join(', '),
	ja: [
		'"Hiragino Sans"',
		'"Yu Gothic"',
		'Meiryo',
		'"Noto Sans CJK JP"',
		'"Source Han Sans JP"',
		'sans-serif'
	].join(', ')
} as const;

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#09090b' }
	],
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false
};

export const metadata: Metadata = {
	metadataBase: new URL('https://mapquiz.pro'),
	title: 'MapQuiz.pro — World Geography Quiz',
	description: 'Test your world geography knowledge on an interactive map.',
	alternates: { canonical: 'https://mapquiz.pro' },
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://mapquiz.pro/',
		siteName: 'MapQuiz.pro'
	}
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

const RootLayout = async ({
	children,
	params
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const messages = await getMessages();

	const fontVars = [geistSans.variable, geistMono.variable].join(' ');
	const localeFontFamily =
		locale === 'zh' || locale === 'ja'
			? localeFontFamilies[locale]
			: undefined;

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<script src="/theme.js" type="module" />
			</head>
			<body
				className={`${fontVars} antialiased`}
				style={
					localeFontFamily
						? { fontFamily: localeFontFamily }
						: undefined
				}
			>
				<NextIntlClientProvider messages={messages}>
					<Providers>
						<Navbar />
						{children}
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
};

export default RootLayout;
