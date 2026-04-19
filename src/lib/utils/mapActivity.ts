import type {
	AnalyticsSnapshot,
	TopicObservabilityStat
} from '@/lib/analytics/metrics';
import {
	CONTINENT_LABELS,
	type Continent,
	FEATURED_COUNTRIES,
	getCountryByCode
} from '@/lib/data/countries';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';

export type MapDisplayMode = 'play' | 'pulse' | 'terrain';

export interface ActivityHotspot {
	id: string;
	label: string;
	latitude: number;
	longitude: number;
	playerCount: number;
	playStarts: number;
	completions: number;
	heat: number;
	modeLabel: string;
	regionType: 'country' | 'continent';
}

const CONTINENT_CENTERS: Record<
	Continent,
	{ latitude: number; longitude: number }
> = {
	asia: { latitude: 29, longitude: 95 },
	europe: { latitude: 52, longitude: 15 },
	americas: { latitude: 14, longitude: -88 },
	africa: { latitude: 6, longitude: 20 },
	oceania: { latitude: -23, longitude: 142 }
};

const mapTopicToAnchor = (topicStat: TopicObservabilityStat) => {
	const topic = getQuizTopicBySlug(topicStat.topicSlug);
	const countryCode = topicStat.countryCode ?? topic?.countryCode ?? null;

	if (countryCode) {
		const country = getCountryByCode(countryCode);
		if (country) {
			return {
				id: `country-${country.code}`,
				label: country.name,
				latitude: country.center.latitude,
				longitude: country.center.longitude,
				regionType: 'country' as const
			};
		}
	}

	const continent = topic?.countryCode
		? getCountryByCode(topic.countryCode)?.continent
		: null;

	if (continent) {
		return {
			id: `continent-${continent}`,
			label: CONTINENT_LABELS[continent],
			latitude: CONTINENT_CENTERS[continent].latitude,
			longitude: CONTINENT_CENTERS[continent].longitude,
			regionType: 'continent' as const
		};
	}

	return null;
};

const roundHeat = (value: number) => Math.max(0.18, Math.min(1, value));

const buildHotspotFromTopic = (topic: TopicObservabilityStat) => {
	const anchor = mapTopicToAnchor(topic);
	if (!anchor) return null;

	const playerCount = Math.max(
		1,
		Math.round(topic.playStarts * 1.6 + topic.completions * 0.8)
	);

	const rawHeat =
		topic.playStarts * 0.12 +
		topic.completions * 0.08 +
		topic.pageViews * 0.03;

	return {
		...anchor,
		playerCount,
		playStarts: topic.playStarts,
		completions: topic.completions,
		heat: roundHeat(rawHeat),
		modeLabel:
			topic.playStarts >= 4
				? 'Flash'
				: topic.completions >= 2
					? 'Challenge'
					: 'Scout'
	} satisfies ActivityHotspot;
};

const buildFallbackHotspots = (): ActivityHotspot[] =>
	FEATURED_COUNTRIES.slice(0, 8).map((country, index) => ({
		id: `fallback-${country.code}`,
		label: country.name,
		latitude: country.center.latitude,
		longitude: country.center.longitude,
		playerCount: 6 + ((index * 3) % 11),
		playStarts: 4 + (index % 5),
		completions: 2 + (index % 4),
		heat: roundHeat(0.24 + index * 0.07),
		modeLabel: index % 3 === 0 ? 'Terrain' : 'Flash',
		regionType: 'country'
	}));

export const buildActivityHotspots = (
	snapshot: AnalyticsSnapshot | null
): ActivityHotspot[] => {
	if (!snapshot) return buildFallbackHotspots();

	const merged = new Map<string, ActivityHotspot>();

	for (const topic of snapshot.topicObservability) {
		const hotspot = buildHotspotFromTopic(topic);
		if (!hotspot) continue;

		const existing = merged.get(hotspot.id);
		if (!existing) {
			merged.set(hotspot.id, hotspot);
			continue;
		}

		existing.playerCount += hotspot.playerCount;
		existing.playStarts += hotspot.playStarts;
		existing.completions += hotspot.completions;
		existing.heat = roundHeat(existing.heat + hotspot.heat * 0.45);
		if (hotspot.playStarts > existing.playStarts) {
			existing.modeLabel = hotspot.modeLabel;
		}
	}

	const next = [...merged.values()].sort((a, b) => b.heat - a.heat);
	return next.length > 0 ? next.slice(0, 12) : buildFallbackHotspots();
};

export const buildActivityPulseCollection = (
	hotspots: ActivityHotspot[],
	pulseTick: number
) => ({
	type: 'FeatureCollection' as const,
	features: hotspots.map((hotspot, index) => {
		const phase = ((pulseTick + index * 12) % 48) / 48;
		const energy = 0.55 + hotspot.heat * 0.75;
		const warm = hotspot.completions >= hotspot.playStarts * 0.5;
		const coreColor = warm ? '#f97316' : '#22d3ee';
		const ringColor = warm ? '#fdba74' : '#7dd3fc';
		const haloColor = warm ? '#fb923c' : '#38bdf8';

		return {
			type: 'Feature' as const,
			properties: {
				id: hotspot.id,
				label: hotspot.label,
				playerCount: hotspot.playerCount,
				playStarts: hotspot.playStarts,
				completions: hotspot.completions,
				heat: hotspot.heat,
				modeLabel: hotspot.modeLabel,
				regionType: hotspot.regionType,
				coreColor,
				ringColor,
				haloColor,
				coreRadius: 7 + hotspot.heat * 8,
				ringRadius: 18 + hotspot.heat * 20 + phase * 24,
				haloRadius: 26 + hotspot.heat * 32 + phase * 12,
				ringWidth: 1.6 + hotspot.heat * 1.8,
				ringOpacity: 0.2 + (1 - phase) * 0.55 * energy,
				haloOpacity: 0.1 + (1 - phase * 0.7) * 0.22 * energy
			},
			geometry: {
				type: 'Point' as const,
				coordinates: [hotspot.longitude, hotspot.latitude]
			}
		};
	})
});
