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

type SupportedCountryCode =
	| 'au'
	| 'br'
	| 'ca'
	| 'cn'
	| 'de'
	| 'es'
	| 'fr'
	| 'gb'
	| 'id'
	| 'in'
	| 'it'
	| 'jp'
	| 'kr'
	| 'mx'
	| 'ru'
	| 'us';

interface CountryRegionSelectionConfig {
	enabledCategory: string;
	parsePlaceRegionLabel: (place: Place) => string | null;
	normalizeFeatureName: (featureName: string) => string;
	toFeatureName: (featureName: string) => string;
	toDisplayLabel: (featureName: string) => string;
}

interface CountryRegionConfig {
	countryCode: SupportedCountryCode;
	featureNameProperty: string;
	geojsonPath: string;
	selection?: CountryRegionSelectionConfig;
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

const buildAliasSelectionConfig = ({
	aliases,
	enabledCategory,
	parsePlaceRegionLabel
}: {
	aliases?: Record<string, string>;
	enabledCategory: string;
	parsePlaceRegionLabel: (place: Place) => string | null;
}): CountryRegionSelectionConfig => {
	const normalizedAliases = new Map(
		Object.entries(aliases ?? {}).map(([displayLabel, featureName]) => [
			normalizeRegionName(displayLabel),
			featureName
		])
	);
	const displayLabels = new Map(
		Object.entries(aliases ?? {}).map(([displayLabel, featureName]) => [
			normalizeRegionName(featureName),
			displayLabel
		])
	);

	return {
		enabledCategory,
		parsePlaceRegionLabel,
		toFeatureName: (featureName) =>
			normalizedAliases.get(normalizeRegionName(featureName)) ??
			featureName,
		normalizeFeatureName: (featureName) => {
			const normalized = normalizeRegionName(featureName);
			return normalizeRegionName(
				normalizedAliases.get(normalized) ?? featureName
			);
		},
		toDisplayLabel: (featureName) =>
			displayLabels.get(normalizeRegionName(featureName)) ?? featureName
	};
};

const COUNTRY_REGION_CONFIGS: Record<
	SupportedCountryCode,
	CountryRegionConfig
> = {
	us: {
		countryCode: 'us',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/us-states.geojson'
	},
	de: {
		countryCode: 'de',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/de-states.geojson'
	},
	jp: {
		countryCode: 'jp',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/jp-prefectures.geojson'
	},
	cn: {
		countryCode: 'cn',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/cn-provinces.geojson'
	},
	in: {
		countryCode: 'in',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/in-states.geojson'
	},
	gb: {
		countryCode: 'gb',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/gb-nations.geojson'
	},
	fr: {
		countryCode: 'fr',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/fr-regions.geojson'
	},
	it: {
		countryCode: 'it',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/it-regions.geojson'
	},
	es: {
		countryCode: 'es',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/es-communities.geojson'
	},
	au: {
		countryCode: 'au',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/au-states.geojson'
	},
	ca: {
		countryCode: 'ca',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/ca-provinces.geojson'
	},
	br: {
		countryCode: 'br',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/br-states.geojson'
	},
	mx: {
		countryCode: 'mx',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/mx-states.geojson'
	},
	id: {
		countryCode: 'id',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/id-provinces.geojson'
	},
	kr: {
		countryCode: 'kr',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/kr-provinces.geojson',
		selection: buildAliasSelectionConfig({
			enabledCategory: 'Provinces',
			parsePlaceRegionLabel: (place) => place.name,
			aliases: {
				'Gangwon Province': 'Gangwon',
				'Gyeonggi Province': 'Gyeonggi',
				'Jeju Island': 'Jeju'
			}
		})
	},
	ru: {
		countryCode: 'ru',
		featureNameProperty: 'name',
		geojsonPath: '/data/admin/ru-federal-subjects.geojson'
	}
};

const COUNTRY_REGION_INDEX = new Map<SupportedCountryCode, Map<string, Place>>(
	(Object.values(COUNTRY_REGION_CONFIGS) as CountryRegionConfig[]).map(
		(config) => {
			const selection = config.selection;
			const places = selection
				? (getCountryRegions(config.countryCode).find(
						(group) => group.category === selection.enabledCategory
					)?.places ?? [])
				: [];

			return [
				config.countryCode,
				new Map(
					places.flatMap((place) => {
						const regionLabel =
							selection?.parsePlaceRegionLabel(place);
						if (!selection || !regionLabel) return [];

						return [
							[
								selection.normalizeFeatureName(regionLabel),
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

const buildCountryRegionSource = (
	countryCode: string
): CountryRegionSource => ({
	featureNameProperty:
		getCountryRegionConfig(countryCode)?.featureNameProperty ?? 'name',
	geojsonPath: getCountryRegionConfig(countryCode)?.geojsonPath ?? '',
	hoverLayerId: `${countryCode}-admin-region-hover-outline`,
	hitLayerId: `${countryCode}-admin-region-hit-fill`,
	selectedFillLayerId: `${countryCode}-admin-region-selected-fill`,
	selectedOutlineLayerId: `${countryCode}-admin-region-selected-outline`,
	sourceId: `${countryCode}-admin-region-polygons`
});

export const getCountryRegionStaticSource = (
	countryCode: string
): CountryRegionSource | null => {
	if (!getCountryRegionConfig(countryCode)) return null;
	return buildCountryRegionSource(countryCode);
};

export const getCountryRegionSource = (
	countryCode: string,
	place: Place | null
): CountryRegionSource | null => {
	if (!resolveCountryPlaceSelection(countryCode, place)) return null;
	return buildCountryRegionSource(countryCode);
};

export const resolveCountryPlaceSelection = (
	countryCode: string,
	place: Place | null
): CountryRegionSelection | null => {
	if (!place) return null;

	const config = getCountryRegionConfig(countryCode);
	const selection = config?.selection;
	if (!config || !selection) return null;

	const regionLabel = selection.parsePlaceRegionLabel(place);
	if (!regionLabel) return null;

	const selectionKey = selection.normalizeFeatureName(regionLabel);
	const canonicalPlace = COUNTRY_REGION_INDEX.get(config.countryCode)?.get(
		selectionKey
	);

	if (!canonicalPlace) return null;

	return {
		featureName: selection.toFeatureName(regionLabel),
		label: selection.toDisplayLabel(selection.toFeatureName(regionLabel)),
		place: canonicalPlace,
		selectionKey
	};
};

export const resolveCountryFeatureSelection = (
	countryCode: string,
	featureName: string
): CountryRegionSelection | null => {
	const config = getCountryRegionConfig(countryCode);
	const selection = config?.selection;
	if (!config || !selection) return null;

	const selectionKey = selection.normalizeFeatureName(featureName);
	const place = COUNTRY_REGION_INDEX.get(config.countryCode)?.get(
		selectionKey
	);

	if (!place) return null;

	return {
		featureName,
		label: selection.toDisplayLabel(featureName),
		place,
		selectionKey
	};
};
