import type { GameMode } from '@/lib/utils/places';

export type MapBounds = {
	west: number;
	south: number;
	east: number;
	north: number;
};

export interface MapScope {
	id: string;
	label: string;
	bounds: MapBounds;
}

const CONTINENT_BOUNDS: Record<string, MapBounds> = {
	Asia: { west: 24, south: -11, east: 150, north: 72 },
	Europe: { west: -25, south: 34, east: 45, north: 72 },
	Americas: { west: -170, south: -56, east: -30, north: 74 },
	Africa: { west: -20, south: -36, east: 55, north: 38 },
	Oceania: { west: 110, south: -50, east: 180, north: 10 }
};

const COUNTRY_BOUNDS: Record<string, MapBounds> = {
	in: { west: 68.176645, south: 7.965535, east: 97.402561, north: 35.49401 },
	us: { west: -125, south: 24, east: -66.5, north: 49.5 },
	cn: { west: 73.675379, south: 18.197701, east: 135.026311, north: 53.4588 },
	gb: { west: -8.6, south: 49.9, east: 2.1, north: 59.2 },
	jp: { west: 128.5, south: 30, east: 146, north: 46.5 },
	de: { west: 5.988658, south: 47.302488, east: 15.016996, north: 54.983104 },
	fr: { west: -5.7, south: 41, east: 9.8, north: 51.6 },
	au: {
		west: 113.338953,
		south: -43.634597,
		east: 153.569469,
		north: -10.668186
	},
	br: {
		west: -73.987235,
		south: -33.768378,
		east: -34.729993,
		north: 5.244486
	},
	kr: {
		west: 126.117398,
		south: 34.390046,
		east: 129.468304,
		north: 38.612243
	},
	ca: {
		west: -140.99778,
		south: 41.675105,
		east: -52.648099,
		north: 83.23324
	},
	ru: { west: 19, south: 41, east: 180, north: 82 },
	it: { west: 6.749955, south: 36.619987, east: 18.480247, north: 47.115393 },
	es: { west: -9.392884, south: 35.94685, east: 3.039484, north: 43.748338 },
	mx: {
		west: -117.12776,
		south: 14.538829,
		east: -86.811982,
		north: 32.72083
	},
	id: {
		west: 95.293026,
		south: -10.359987,
		east: 141.033852,
		north: 5.479821
	}
};

export const getMapScopeForGame = ({
	mode,
	countryCode,
	category
}: {
	mode: GameMode;
	countryCode: string;
	category: 'all' | string[];
}): MapScope | null => {
	if (mode === 'country') {
		const bounds = COUNTRY_BOUNDS[countryCode];
		if (!bounds) return null;

		return {
			id: `country-${countryCode}`,
			label: countryCode.toUpperCase(),
			bounds
		};
	}

	if (mode === 'world' && category !== 'all' && category.length === 1) {
		const selected = category[0];
		const bounds = CONTINENT_BOUNDS[selected];
		if (!bounds) return null;

		return {
			id: `continent-${selected.toLowerCase()}`,
			label: selected,
			bounds
		};
	}

	return null;
};

export const mapBoundsToLngLatBounds = (
	bounds: MapBounds
): [[number, number], [number, number]] => [
	[bounds.west, bounds.south],
	[bounds.east, bounds.north]
];

export const mapBoundsToFeatureCollection = (scope: MapScope) => ({
	type: 'FeatureCollection' as const,
	features: [
		{
			type: 'Feature' as const,
			properties: {
				id: scope.id,
				label: scope.label
			},
			geometry: {
				type: 'Polygon' as const,
				coordinates: [
					[
						[scope.bounds.west, scope.bounds.south],
						[scope.bounds.east, scope.bounds.south],
						[scope.bounds.east, scope.bounds.north],
						[scope.bounds.west, scope.bounds.north],
						[scope.bounds.west, scope.bounds.south]
					]
				]
			}
		}
	]
});
