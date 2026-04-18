import type { QuizTopicKind } from '@/lib/data/quizTopics';
import { dispatchAnalyticsLocalChange } from '@/lib/utils/analyticsEvents';

export const TOPIC_OBSERVABILITY_STORAGE_KEY =
	'ace-map-topic-observability-v1';

export type TopicObservabilityEventType =
	| 'page_view'
	| 'cta_click'
	| 'play_start';

export interface TopicObservabilityEvent {
	topicSlug: string;
	topicKind: QuizTopicKind;
	countryCode: string | null;
	eventType: TopicObservabilityEventType;
	source: string;
	target?: string | null;
	createdAt: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const readTopicObservabilityEvents = (): TopicObservabilityEvent[] => {
	if (!isBrowser()) return [];

	try {
		const item = window.localStorage.getItem(TOPIC_OBSERVABILITY_STORAGE_KEY);
		return item ? (JSON.parse(item) as TopicObservabilityEvent[]) : [];
	} catch {
		return [];
	}
};

export const writeTopicObservabilityEvents = (
	events: TopicObservabilityEvent[]
) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(
		TOPIC_OBSERVABILITY_STORAGE_KEY,
		JSON.stringify(events)
	);
	dispatchAnalyticsLocalChange();
};

export const recordTopicObservabilityEvent = (
	event: Omit<TopicObservabilityEvent, 'createdAt'>
) => {
	const events = readTopicObservabilityEvents();
	const nextEvent: TopicObservabilityEvent = {
		...event,
		createdAt: new Date().toISOString()
	};
	const nextEvents = [nextEvent, ...events].slice(0, 500);
	writeTopicObservabilityEvents(nextEvents);
	return nextEvents;
};
