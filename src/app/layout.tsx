import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import Navbar from '@/lib/components/Navbar';
import Providers from '@/lib/components/Providers';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

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
	description:
		'Test your world geography knowledge. Guess countries, cities, and landmarks on an interactive map. Supports India (CBSE), World Countries, and 15+ countries.',
	authors: [
		{
			name: 'NaviTheCoderboi',
			url: 'https://github.com/navithecoderboi'
		}
	],
	keywords: [
		'map quiz',
		'geography quiz',
		'world map game',
		'country guessing game',
		'map practice',
		'India map CBSE',
		'world countries quiz',
		'geography learning',
		'interactive map',
		'state capitals quiz',
		'MapQuiz'
	],
	alternates: {
		canonical: 'https://mapquiz.pro'
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://mapquiz.pro/',
		siteName: 'MapQuiz.pro',
		title: 'MapQuiz.pro — World Geography Quiz',
		description:
			'Test your world geography knowledge on an interactive map. 15+ countries, world mode, and India CBSE mode.'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'MapQuiz.pro — World Geography Quiz',
		description:
			'Interactive geography quiz with 15+ countries and world mode.'
	},
	category: 'Geography'
};

const RootLayout = ({
	children
}: Readonly<{
	children: ReactNode;
}>) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script src="/theme.js" type="module" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<Navbar />
					{children}
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
