import type { QuizTopicKind } from '@/lib/data/quizTopics';
import type {
	DailyChallengeCompletion,
	DailyChallengeState
} from '@/lib/utils/challenge';
import {
	buildDailyChallengeState,
	getChallengeDateKey
} from '@/lib/utils/challenge';
import type { PracticeSession } from '@/lib/utils/progress';
import type { MistakeEntry } from '@/lib/utils/review';
import type { TopicObservabilityEvent } from '@/lib/utils/topicObservability';

export interface ManagedDailyChallenge {
	date: string;
	topicSlug: string;
	leaderboardEnabled: boolean;
	status: 'scheduled' | 'active' | 'archived';
	titleOverride?: string | null;
}

export interface LeaderboardEntry {
	userId: string;
	displayName: string;
	avatarUrl: string | null;
	accuracy: number;
	score: number;
	total: number;
	timeSeconds: number;
	averageDistanceMeters: number | null;
	position: number;
	isCurrentUser: boolean;
}

export interface ChallengeLeaderboard {
	challengeDate: string;
	topicSlug: string;
	entries: LeaderboardEntry[];
	myEntry: LeaderboardEntry | null;
}

export interface UserProfile {
	userId: string;
	displayName: string | null;
	avatarUrl: string | null;
	isPublicOnLeaderboard: boolean;
}

export interface AnalyticsSnapshot {
	challengeState: DailyChallengeState;
	challengeCompletions: DailyChallengeCompletion[];
	sessions: PracticeSession[];
	mistakes: MistakeEntry[];
	topicObservability: TopicObservabilityStat[];
	currentChallenge: ManagedDailyChallenge | null;
	leaderboard: ChallengeLeaderboard | null;
	profile: UserProfile | null;
}

export interface TopicObservabilityStat {
	topicSlug: string;
	topicKind: QuizTopicKind | null;
	countryCode: string | null;
	pageViews: number;
	ctaClicks: number;
	playStarts: number;
	completions: number;
	lastEventAt: string | null;
	clickThroughRate: number | null;
	startRate: number | null;
	completionRate: number | null;
}

export const buildAnalyticsSnapshot = (input: {
	challengeCompletions: DailyChallengeCompletion[];
	sessions: PracticeSession[];
	mistakes: MistakeEntry[];
	topicObservabilityEvents?: TopicObservabilityEvent[];
	currentChallenge?: ManagedDailyChallenge | null;
	leaderboard?: ChallengeLeaderboard | null;
	profile?: UserProfile | null;
}): AnalyticsSnapshot => ({
	challengeState: buildDailyChallengeState(input.challengeCompletions),
	challengeCompletions: [...input.challengeCompletions].sort((a, b) =>
		b.date.localeCompare(a.date)
	),
	sessions: [...input.sessions].sort(
		(a, b) =>
			new Date(b.completedAt).getTime() -
			new Date(a.completedAt).getTime()
	),
	mistakes: [...input.mistakes].sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	),
	topicObservability: buildTopicObservabilityStats(
		input.topicObservabilityEvents ?? [],
		input.sessions
	),
	currentChallenge: input.currentChallenge ?? null,
	leaderboard: input.leaderboard ?? null,
	profile: input.profile ?? null
});

export const buildTopicObservabilityStats = (
	events: TopicObservabilityEvent[],
	sessions: PracticeSession[]
) => {
	const grouped = new Map<string, TopicObservabilityStat>();

	for (const event of events) {
		const current = grouped.get(event.topicSlug) ?? {
			topicSlug: event.topicSlug,
			topicKind: event.topicKind,
			countryCode: event.countryCode,
			pageViews: 0,
			ctaClicks: 0,
			playStarts: 0,
			completions: 0,
			lastEventAt: event.createdAt,
			clickThroughRate: null,
			startRate: null,
			completionRate: null
		};

		current.topicKind = current.topicKind ?? event.topicKind;
		current.countryCode = current.countryCode ?? event.countryCode;
		current.lastEventAt =
			current.lastEventAt && current.lastEventAt > event.createdAt
				? current.lastEventAt
				: event.createdAt;

		if (event.eventType === 'page_view') current.pageViews += 1;
		if (event.eventType === 'cta_click') current.ctaClicks += 1;
		if (event.eventType === 'play_start') current.playStarts += 1;

		grouped.set(event.topicSlug, current);
	}

	for (const session of sessions) {
		if (!session.topicSlug) continue;
		const current = grouped.get(session.topicSlug) ?? {
			topicSlug: session.topicSlug,
			topicKind: null,
			countryCode: null,
			pageViews: 0,
			ctaClicks: 0,
			playStarts: 0,
			completions: 0,
			lastEventAt: session.completedAt,
			clickThroughRate: null,
			startRate: null,
			completionRate: null
		};

		current.completions += 1;
		current.lastEventAt =
			current.lastEventAt && current.lastEventAt > session.completedAt
				? current.lastEventAt
				: session.completedAt;
		grouped.set(session.topicSlug, current);
	}

	return [...grouped.values()]
		.map((item) => ({
			...item,
			clickThroughRate:
				item.pageViews > 0
					? Math.round((item.ctaClicks / item.pageViews) * 100)
					: null,
			startRate:
				item.ctaClicks > 0
					? Math.round((item.playStarts / item.ctaClicks) * 100)
					: item.pageViews > 0
						? Math.round((item.playStarts / item.pageViews) * 100)
						: null,
			completionRate:
				item.playStarts > 0
					? Math.round((item.completions / item.playStarts) * 100)
					: null
		}))
		.sort((a, b) => {
			if (b.playStarts !== a.playStarts) return b.playStarts - a.playStarts;
			if (b.pageViews !== a.pageViews) return b.pageViews - a.pageViews;
			return b.completions - a.completions;
		});
};

export const buildSessionStats = (sessions: PracticeSession[]) => {
	const uniqueTopics = new Set(
		sessions
			.map((session) => session.topicSlug)
			.filter((slug): slug is string => Boolean(slug))
	);

	const averageAccuracy =
		sessions.length === 0
			? null
			: Math.round(
					sessions.reduce(
						(total, session) => total + session.accuracy,
						0
					) / sessions.length
				);

	const grouped = sessions.reduce(
		(map, session) => {
			if (!session.topicSlug) return map;

			const current = map.get(session.topicSlug) ?? {
				topicSlug: session.topicSlug,
				plays: 0,
				totalAccuracy: 0,
				bestAccuracy: 0,
				lastPlayedAt: session.completedAt
			};

			current.plays += 1;
			current.totalAccuracy += session.accuracy;
			current.bestAccuracy = Math.max(
				current.bestAccuracy,
				session.accuracy
			);
			current.lastPlayedAt =
				current.lastPlayedAt > session.completedAt
					? current.lastPlayedAt
					: session.completedAt;
			map.set(session.topicSlug, current);
			return map;
		},
		new Map<
			string,
			{
				topicSlug: string;
				plays: number;
				totalAccuracy: number;
				bestAccuracy: number;
				lastPlayedAt: string;
			}
		>()
	);

	const strongestTopic = [...grouped.values()]
		.map((item) => ({
			...item,
			averageAccuracy: Math.round(item.totalAccuracy / item.plays)
		}))
		.sort((a, b) => {
			if (b.averageAccuracy !== a.averageAccuracy) {
				return b.averageAccuracy - a.averageAccuracy;
			}
			return b.plays - a.plays;
		})[0];

	return {
		totalSessions: sessions.length,
		uniqueTopics: uniqueTopics.size,
		averageAccuracy,
		latestSessions: sessions.slice(0, 3),
		strongestTopic
	};
};

export const buildMistakeStats = (mistakes: MistakeEntry[]) => {
	const grouped = mistakes.reduce((map, entry) => {
		const current = map.get(entry.topicSlug) ?? {
			topicSlug: entry.topicSlug,
			entries: [] as MistakeEntry[]
		};
		current.entries.push(entry);
		map.set(entry.topicSlug, current);
		return map;
	}, new Map<string, { topicSlug: string; entries: MistakeEntry[] }>());

	const topics = [...grouped.values()].map((item) => {
		const uniqueMisses = new Set(
			item.entries.map(
				(entry) =>
					`${entry.place.name}-${entry.place.latitude}-${entry.place.longitude}`
			)
		).size;

		return {
			topicSlug: item.topicSlug,
			uniqueMisses,
			lastMissedAt: item.entries[0]?.createdAt ?? null
		};
	});

	const reviewTopic = topics.sort(
		(a, b) => b.uniqueMisses - a.uniqueMisses
	)[0];
	const totalUniqueMistakes = new Set(
		mistakes.map(
			(entry) =>
				`${entry.topicSlug}-${entry.place.name}-${entry.place.latitude}-${entry.place.longitude}`
		)
	).size;
	const averageDistanceMeters =
		mistakes.length === 0
			? null
			: Math.round(
					mistakes.reduce(
						(total, entry) => total + entry.distance,
						0
					) / mistakes.length
				);

	return {
		totalUniqueMistakes,
		reviewTopic,
		averageDistanceMeters
	};
};

export const isChallengeDoneToday = (challengeState: DailyChallengeState) =>
	challengeState.lastCompletedDate === getChallengeDateKey();
