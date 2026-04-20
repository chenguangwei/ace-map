import '../../globals.css';
import { Geist, Geist_Mono, Noto_Sans_SC, Noto_Sans_JP } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/lib/components/Navbar';
import Providers from '@/lib/components/Providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const notoSansSC = Noto_Sans_SC({ variable: '--font-noto-sc', weight: ['400', '700', '900'] });
const notoSansJP = Noto_Sans_JP({ variable: '--font-noto-jp', weight: ['400', '700', '900'] });

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

	const fontVars = [
		geistSans.variable,
		geistMono.variable,
		locale === 'zh' ? notoSansSC.variable : '',
		locale === 'ja' ? notoSansJP.variable : ''
	].filter(Boolean).join(' ');

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<script src="/theme.js" type="module" />
			</head>
			<body className={`${fontVars} antialiased`}>
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
