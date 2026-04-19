import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.mapbox.com',
				pathname: '/styles/v1/mapbox/**'
			}
		]
	}
};

export default nextConfig;
