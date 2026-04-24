import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.mapbox.com',
				pathname: '/styles/v1/mapbox/**'
			}
		]
	},
	async redirects() {
		return [
			{
				source: '/:path*',
				has: [{ type: 'host', value: 'www.mapquiz.pro' }],
				destination: 'https://mapquiz.pro/:path*',
				permanent: true
			}
		];
	},
	async headers() {
		return [
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'X-Robots-Tag',
						value: 'noindex'
					}
				]
			},
			{
				source: '/favicon.ico',
				headers: [
					{
						key: 'X-Robots-Tag',
						value: 'noindex'
					}
				]
			}
		];
	}
};

export default withNextIntl(nextConfig);
