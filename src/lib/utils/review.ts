import { dispatchAnalyticsLocalChange } from '@/lib/utils/analyticsEvents';
import type { Place, PlaceItems } from '@/lib/utils/places';

export const MISTAKE_STORAGE_KEY = 'ace-map-mistakes';

export interface MistakeEntry {
	topicSlug: string;
	place: Place;
	distance: number;
	createdAt: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const readMistakeEntries = (): MistakeEntry[] => {
	if (!isBrowser()) return [];

	try {
		const item = window.localStorage.getItem(MISTAKE_STORAGE_KEY);
		return item ? (JSON.parse(item) as MistakeEntry[]) : [];
	} catch {
		return [];
	}
};

export const writeMistakeEntries = (entries: MistakeEntry[]) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(MISTAKE_STORAGE_KEY, JSON.stringify(entries));
	dispatchAnalyticsLocalChange();
};

export const saveMistakeEntry = (entry: MistakeEntry) => {
	const entries = readMistakeEntries();
	const deduped = entries.filter(
		(existing) =>
			!(
				existing.topicSlug === entry.topicSlug &&
				existing.place.name === entry.place.name &&
				existing.place.latitude === entry.place.latitude &&
				existing.place.longitude === entry.place.longitude
			)
	);

	writeMistakeEntries([entry, ...deduped].slice(0, 40));
};

export const getMistakesForTopic = (topicSlug: string) =>
	readMistakeEntries().filter((entry) => entry.topicSlug === topicSlug);

export const clearMistakesForTopic = (topicSlug: string) => {
	writeMistakeEntries(
		readMistakeEntries().filter((entry) => entry.topicSlug !== topicSlug)
	);
};

export const buildMistakePlaceSource = (
	entries: MistakeEntry[]
): PlaceItems[] => {
	const uniquePlaces = entries.reduce((places, entry) => {
		const exists = places.some(
			(place) =>
				place.name === entry.place.name &&
				place.latitude === entry.place.latitude &&
				place.longitude === entry.place.longitude
		);
		if (!exists) places.push(entry.place);
		return places;
	}, [] as Place[]);

	return uniquePlaces.length > 0
		? [
				{
					category: 'Mistakes Review',
					places: uniquePlaces
				}
			]
		: [];
};
