import { getCountryByCode } from '@/lib/data/countries';
import type { GameMode } from './places';

export interface MapViewState {
	latitude: number;
	longitude: number;
	zoom: number;
}

const DEFAULT_WORLD_VIEW: MapViewState = {
	latitude: 15,
	longitude: -80,
	zoom: 2.2
};

const DEFAULT_INDIA_VIEW: MapViewState = {
	latitude: 23.5937,
	longitude: 78.9629,
	zoom: 4.5
};

const WORLD_CATEGORY_VIEWS: Record<string, MapViewState> = {
	Asia: { latitude: 30, longitude: 96, zoom: 2.45 },
	Europe: { latitude: 53, longitude: 15, zoom: 3.15 },
	Americas: { latitude: 14, longitude: -86, zoom: 2.15 },
	Africa: { latitude: 6, longitude: 20, zoom: 2.65 },
	Oceania: { latitude: -23, longitude: 145, zoom: 3.05 }
};

export const getMapViewForGame = ({
	mode,
	countryCode,
	category
}: {
	mode: GameMode;
	countryCode: string;
	category: 'all' | string[];
}): MapViewState => {
	if (mode === 'country') {
		const country = getCountryByCode(countryCode);
		if (country) {
			return {
				latitude: country.center.latitude,
				longitude: country.center.longitude,
				zoom: country.zoom
			};
		}
	}

	if (mode === 'world') {
		if (category !== 'all' && category.length === 1) {
			return WORLD_CATEGORY_VIEWS[category[0]] ?? DEFAULT_WORLD_VIEW;
		}
		return DEFAULT_WORLD_VIEW;
	}

	return DEFAULT_INDIA_VIEW;
};
