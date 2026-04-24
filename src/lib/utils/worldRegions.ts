import { worldPlaces } from '@/lib/data/regions';
import { WORLD_REGION_METRICS } from '@/lib/data/worldRegionMetrics';
import type { Place } from '@/lib/utils/places';

export const normalizeWorldRegionName = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

const WORLD_REGION_NAME_ALIASES: Record<string, string> = {
	'united states of america': 'United States',
	'united republic of tanzania': 'Tanzania',
	'democratic republic of the congo': 'DR Congo',
	'republic of the congo': 'Republic of Congo',
	'united arab emirates': 'UAE',
	macedonia: 'North Macedonia'
};

const WORLD_FEATURE_NAME_BY_PLACE_NAME = new Map<string, string>(
	Object.entries(WORLD_REGION_NAME_ALIASES).map(
		([featureName, placeName]) => [
			normalizeWorldRegionName(placeName),
			featureName
		]
	)
);

const WORLD_PLACES = worldPlaces.flatMap((group) => group.places);

const WORLD_PLACE_INDEX = new Map<string, Place>(
	WORLD_PLACES.map((place) => [normalizeWorldRegionName(place.name), place])
);

export const WORLD_MICRO_REGION_RULES = {
	// Narrow countries and island chains are easy to miss even when they span
	// several degrees north-south, so width and height both need their own caps.
	maxWidthDegrees: 2.4,
	maxHeightDegrees: 1.8,
	// Area catches compact shapes that are not extremely narrow in either axis.
	maxBoundingArea: 2.2
} as const;

export interface WorldRegionSelection {
	label: string;
	place: Place;
	selectionKey: string;
}

export const resolveWorldPlaceSelection = (
	place: Place | null
): WorldRegionSelection | null => {
	if (!place) return null;

	return {
		label: place.name,
		place,
		selectionKey: normalizeWorldRegionName(place.name)
	};
};

export const resolveWorldFeatureSelection = (
	featureName: string
): WorldRegionSelection | null => {
	const place = resolveWorldRegionPlace(featureName);
	if (!place) return null;

	return {
		label: place.name,
		place,
		selectionKey: normalizeWorldRegionName(place.name)
	};
};

export const resolveWorldFeatureNameForPlace = (
	place: Place | null
): string | null => {
	if (!place) return null;

	return (
		WORLD_FEATURE_NAME_BY_PLACE_NAME.get(
			normalizeWorldRegionName(place.name)
		) ?? place.name
	);
};

export const resolveWorldRegionPlace = (featureName: string): Place | null => {
	const normalizedFeatureName = normalizeWorldRegionName(featureName);
	const canonicalName =
		WORLD_REGION_NAME_ALIASES[normalizedFeatureName] ?? featureName;
	return (
		WORLD_PLACE_INDEX.get(normalizeWorldRegionName(canonicalName)) ?? null
	);
};

export const isWorldMicroRegionName = (name: string) => {
	const metrics = WORLD_REGION_METRICS[normalizeWorldRegionName(name)];
	if (!metrics) return false;

	return (
		metrics.width <= WORLD_MICRO_REGION_RULES.maxWidthDegrees ||
		metrics.height <= WORLD_MICRO_REGION_RULES.maxHeightDegrees ||
		metrics.area <= WORLD_MICRO_REGION_RULES.maxBoundingArea
	);
};

export const isWorldMicroRegionPlace = (place: Place | null) =>
	Boolean(place && isWorldMicroRegionName(place.name));

export const worldMicroRegionFeatureCollection = {
	type: 'FeatureCollection',
	features: WORLD_PLACES.filter((place) =>
		isWorldMicroRegionPlace(place)
	).map((place) => {
		return {
			type: 'Feature' as const,
			properties: {
				name: resolveWorldFeatureNameForPlace(place) ?? place.name,
				label: place.name
			},
			geometry: {
				type: 'Point' as const,
				coordinates: [place.longitude, place.latitude]
			}
		};
	})
};
