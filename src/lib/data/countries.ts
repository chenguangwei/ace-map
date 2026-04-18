export type Continent = 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';

export interface CountryDef {
	code: string; // ISO 3166-1 alpha-2
	name: string;
	nativeName: string;
	flag: string; // emoji
	center: { latitude: number; longitude: number };
	zoom: number; // default map zoom
	continent: Continent;
	featured: boolean; // shown prominently in country selector
	/** Multiplier applied to base strictness distances (default 1) */
	strictnessMultiplier: number;
}

export const FEATURED_COUNTRIES: CountryDef[] = [
	{
		code: 'in',
		name: 'India',
		nativeName: 'भारत',
		flag: '🇮🇳',
		center: { latitude: 23.5937, longitude: 78.9629 },
		zoom: 4.5,
		continent: 'asia',
		featured: true,
		strictnessMultiplier: 1
	},
	{
		code: 'us',
		name: 'United States',
		nativeName: 'United States',
		flag: '🇺🇸',
		center: { latitude: 38.0, longitude: -97.0 },
		zoom: 3.5,
		continent: 'americas',
		featured: true,
		strictnessMultiplier: 2
	},
	{
		code: 'cn',
		name: 'China',
		nativeName: '中国',
		flag: '🇨🇳',
		center: { latitude: 35.0, longitude: 103.0 },
		zoom: 3.5,
		continent: 'asia',
		featured: true,
		strictnessMultiplier: 1.8
	},
	{
		code: 'gb',
		name: 'United Kingdom',
		nativeName: 'United Kingdom',
		flag: '🇬🇧',
		center: { latitude: 55.3781, longitude: -3.436 },
		zoom: 5.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 0.6
	},
	{
		code: 'jp',
		name: 'Japan',
		nativeName: '日本',
		flag: '🇯🇵',
		center: { latitude: 36.2048, longitude: 138.2529 },
		zoom: 5,
		continent: 'asia',
		featured: true,
		strictnessMultiplier: 0.7
	},
	{
		code: 'de',
		name: 'Germany',
		nativeName: 'Deutschland',
		flag: '🇩🇪',
		center: { latitude: 51.1657, longitude: 10.4515 },
		zoom: 5.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 0.6
	},
	{
		code: 'fr',
		name: 'France',
		nativeName: 'France',
		flag: '🇫🇷',
		center: { latitude: 46.2276, longitude: 2.2137 },
		zoom: 5.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 0.7
	},
	{
		code: 'au',
		name: 'Australia',
		nativeName: 'Australia',
		flag: '🇦🇺',
		center: { latitude: -25.2744, longitude: 133.7751 },
		zoom: 3.5,
		continent: 'oceania',
		featured: true,
		strictnessMultiplier: 2.5
	},
	{
		code: 'br',
		name: 'Brazil',
		nativeName: 'Brasil',
		flag: '🇧🇷',
		center: { latitude: -14.235, longitude: -51.9253 },
		zoom: 3.5,
		continent: 'americas',
		featured: true,
		strictnessMultiplier: 2
	},
	{
		code: 'kr',
		name: 'South Korea',
		nativeName: '대한민국',
		flag: '🇰🇷',
		center: { latitude: 35.9078, longitude: 127.7669 },
		zoom: 6.5,
		continent: 'asia',
		featured: true,
		strictnessMultiplier: 0.5
	},
	{
		code: 'ca',
		name: 'Canada',
		nativeName: 'Canada',
		flag: '🇨🇦',
		center: { latitude: 56.1304, longitude: -106.3468 },
		zoom: 3,
		continent: 'americas',
		featured: true,
		strictnessMultiplier: 2.5
	},
	{
		code: 'ru',
		name: 'Russia',
		nativeName: 'Россия',
		flag: '🇷🇺',
		center: { latitude: 61.524, longitude: 105.3188 },
		zoom: 2.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 4
	},
	{
		code: 'it',
		name: 'Italy',
		nativeName: 'Italia',
		flag: '🇮🇹',
		center: { latitude: 41.8719, longitude: 12.5674 },
		zoom: 5.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 0.7
	},
	{
		code: 'es',
		name: 'Spain',
		nativeName: 'España',
		flag: '🇪🇸',
		center: { latitude: 40.4637, longitude: -3.7492 },
		zoom: 5.5,
		continent: 'europe',
		featured: true,
		strictnessMultiplier: 0.8
	},
	{
		code: 'mx',
		name: 'Mexico',
		nativeName: 'México',
		flag: '🇲🇽',
		center: { latitude: 23.6345, longitude: -102.5528 },
		zoom: 4.5,
		continent: 'americas',
		featured: true,
		strictnessMultiplier: 1.5
	},
	{
		code: 'id',
		name: 'Indonesia',
		nativeName: 'Indonesia',
		flag: '🇮🇩',
		center: { latitude: -0.7893, longitude: 113.9213 },
		zoom: 4,
		continent: 'asia',
		featured: true,
		strictnessMultiplier: 2
	}
];

export const getCountryByCode = (code: string): CountryDef | undefined =>
	FEATURED_COUNTRIES.find((c) => c.code === code);

export const CONTINENT_LABELS: Record<Continent, string> = {
	asia: 'Asia',
	europe: 'Europe',
	americas: 'Americas',
	africa: 'Africa',
	oceania: 'Oceania'
};
