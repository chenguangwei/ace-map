import { getCountryRegions } from '@/lib/data/regions';
import type { Place } from '@/lib/utils/places';

const normalizeRegionName = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

type SupportedCountryCode = 'de' | 'us';

interface CountryRegionConfig {
	countryCode: SupportedCountryCode;
	enabledCategory: string;
	geojsonPath: string;
	featureNameProperty: string;
	parsePlaceRegionLabel: (place: Place) => string | null;
	normalizeFeatureName: (featureName: string) => string;
	toDisplayLabel: (featureName: string) => string;
}

export interface CountryRegionSource {
	featureNameProperty: string;
	geojsonPath: string;
	hoverLayerId: string;
	hitLayerId: string;
	selectedFillLayerId: string;
	selectedOutlineLayerId: string;
	sourceId: string;
}

export interface CountryRegionSelection {
	featureName: string;
	label: string;
	place: Place;
	selectionKey: string;
}

const US_REGION_ALIASES: Record<string, string> = {
	'd c': 'district of columbia',
	dc: 'district of columbia',
	'washington d c': 'district of columbia',
	'washington dc': 'district of columbia'
};

const DE_STATE_LABEL_TO_FEATURE: Record<string, string> = {
	'baden wurttemberg': 'Baden-Württemberg',
	bavaria: 'Bayern',
	berlin: 'Berlin',
	brandenburg: 'Brandenburg',
	bremen: 'Bremen',
	hamburg: 'Hamburg',
	hesse: 'Hessen',
	'lower saxony': 'Niedersachsen',
	'mecklenburg vorpommern': 'Mecklenburg-Vorpommern',
	'north rhine westphalia': 'Nordrhein-Westfalen',
	'rhineland palatinate': 'Rheinland-Pfalz',
	saarland: 'Saarland',
	saxony: 'Sachsen',
	'saxony anhalt': 'Sachsen-Anhalt',
	'schleswig holstein': 'Schleswig-Holstein',
	thuringia: 'Thüringen'
};

const DE_FEATURE_TO_DISPLAY_LABEL = new Map<string, string>(
	Object.entries(DE_STATE_LABEL_TO_FEATURE).map(([label, featureName]) => [
		normalizeRegionName(featureName),
		label
			.split(' ')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ')
	])
);

const COUNTRY_REGION_CONFIGS: Record<
	SupportedCountryCode,
	CountryRegionConfig
> = {
	us: {
		countryCode: 'us',
		enabledCategory: 'State Capitals',
		geojsonPath: '/data/admin/us-states.geojson',
		featureNameProperty: 'name',
		parsePlaceRegionLabel: (place) => {
			if (place.name === 'Washington D.C.') {
				return 'District of Columbia';
			}

			const segments = place.name.split(',');
			const regionName = segments.at(-1)?.trim() ?? null;
			return regionName && regionName.length > 0 ? regionName : null;
		},
		normalizeFeatureName: (featureName) => {
			const normalized = normalizeRegionName(featureName);
			return US_REGION_ALIASES[normalized] ?? normalized;
		},
		toDisplayLabel: (featureName) =>
			featureName === 'District of Columbia'
				? 'District of Columbia'
				: featureName
	},
	de: {
		countryCode: 'de',
		enabledCategory: 'Federal State Capitals',
		geojsonPath: '/data/admin/de-states.geojson',
		featureNameProperty: 'name',
		parsePlaceRegionLabel: (place) => {
			const match = place.name.match(/\(([^)]+)\)\s*$/);
			return match?.[1]?.trim() ?? null;
		},
		normalizeFeatureName: (featureName) => {
			const normalized = normalizeRegionName(featureName);
			const mappedFeature = DE_STATE_LABEL_TO_FEATURE[normalized];
			return normalizeRegionName(mappedFeature ?? featureName);
		},
		toDisplayLabel: (featureName) =>
			DE_FEATURE_TO_DISPLAY_LABEL.get(normalizeRegionName(featureName)) ??
			featureName
	}
};

const COUNTRY_REGION_INDEX = new Map<SupportedCountryCode, Map<string, Place>>(
	(Object.values(COUNTRY_REGION_CONFIGS) as CountryRegionConfig[]).map(
		(config) => {
			const places =
				getCountryRegions(config.countryCode).find(
					(group) => group.category === config.enabledCategory
				)?.places ?? [];

			return [
				config.countryCode,
				new Map(
					places.flatMap((place) => {
						const regionLabel = config.parsePlaceRegionLabel(place);
						if (!regionLabel) return [];

						return [
							[
								config.normalizeFeatureName(regionLabel),
								place
							] as const
						];
					})
				)
			] as const;
		}
	)
);

const getCountryRegionConfig = (
	countryCode: string
): CountryRegionConfig | null =>
	COUNTRY_REGION_CONFIGS[countryCode as SupportedCountryCode] ?? null;

export const getCountryRegionSource = (
	countryCode: string,
	place: Place | null
): CountryRegionSource | null => {
	if (!resolveCountryPlaceSelection(countryCode, place)) return null;

	return {
		featureNameProperty:
			getCountryRegionConfig(countryCode)?.featureNameProperty ?? 'name',
		geojsonPath: getCountryRegionConfig(countryCode)?.geojsonPath ?? '',
		hoverLayerId: `${countryCode}-admin-region-hover-outline`,
		hitLayerId: `${countryCode}-admin-region-hit-fill`,
		selectedFillLayerId: `${countryCode}-admin-region-selected-fill`,
		selectedOutlineLayerId: `${countryCode}-admin-region-selected-outline`,
		sourceId: `${countryCode}-admin-region-polygons`
	};
};

export const resolveCountryPlaceSelection = (
	countryCode: string,
	place: Place | null
): CountryRegionSelection | null => {
	if (!place) return null;

	const config = getCountryRegionConfig(countryCode);
	if (!config) return null;

	const regionLabel = config.parsePlaceRegionLabel(place);
	if (!regionLabel) return null;

	const selectionKey = config.normalizeFeatureName(regionLabel);
	const canonicalPlace = COUNTRY_REGION_INDEX.get(config.countryCode)?.get(
		selectionKey
	);

	if (!canonicalPlace) return null;

	const featureName =
		countryCode === 'de'
			? (DE_STATE_LABEL_TO_FEATURE[normalizeRegionName(regionLabel)] ??
				regionLabel)
			: regionLabel;

	return {
		featureName,
		label: config.toDisplayLabel(featureName),
		place: canonicalPlace,
		selectionKey
	};
};

export const resolveCountryFeatureSelection = (
	countryCode: string,
	featureName: string
): CountryRegionSelection | null => {
	const config = getCountryRegionConfig(countryCode);
	if (!config) return null;

	const selectionKey = config.normalizeFeatureName(featureName);
	const place = COUNTRY_REGION_INDEX.get(config.countryCode)?.get(
		selectionKey
	);

	if (!place) return null;

	return {
		featureName,
		label: config.toDisplayLabel(featureName),
		place,
		selectionKey
	};
};
