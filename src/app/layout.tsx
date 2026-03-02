import './globals.css';
import type { Metadata } from 'next';
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

export const metadata: Metadata = {
	title: 'Ace Map',
	description: 'Ace Map is a map practicing for class 10 CBSE students',
	authors: [
		{
			name: 'NaviTheCoderboi',
			url: 'https://github.com/navithecoderboi'
		}
	],
	keywords: [
		'Ace Map',
		'Map',
		'Class 10',
		'CBSE',
		'Geography',
		'India',
		'World',
		'Map Practice',
		'Map Quiz',
		'Map Game',
		'Map Learning',
		'Map Practice for Class 10',
		'Map Quiz for Class 10',
		'Map Game for Class 10',
		'Map Learning for Class 10'
	],
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://ace-map.vercel.app/',
		siteName: 'Ace Map',
		title: 'Ace Map',
		description: 'Ace Map is a map practicing for class 10 CBSE students'
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
				<script src="/theme.js" type="module"></script>
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
