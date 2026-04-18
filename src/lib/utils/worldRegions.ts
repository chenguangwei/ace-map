import { worldPlaces } from '@/lib/data/regions';
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

const WORLD_PLACE_INDEX = new Map<string, Place>(
	worldPlaces.flatMap((group) =>
		group.places.map((place) => [
			normalizeWorldRegionName(place.name),
			place
		])
	)
);

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
