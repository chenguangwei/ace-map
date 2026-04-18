import { getDailyChallengeTopic } from '@/lib/data/quizTopics';
import { dispatchAnalyticsLocalChange } from '@/lib/utils/analyticsEvents';

export const DAILY_CHALLENGE_STORAGE_KEY = 'ace-map-daily-challenge';
export const LAST_SESSION_TOPIC_KEY = 'ace-map-last-session-topic';

export interface DailyChallengeCompletion {
	date: string;
	topicSlug: string;
	score: number;
	total: number;
	accuracy: number;
	completedAt: string;
}

export interface DailyChallengeState {
	currentStreak: number;
	bestStreak: number;
	lastCompletedDate: string | null;
	lastTopicSlug: string | null;
	lastAccuracy: number | null;
	completions: DailyChallengeCompletion[];
}

export const initialDailyChallengeState: DailyChallengeState = {
	currentStreak: 0,
	bestStreak: 0,
	lastCompletedDate: null,
	lastTopicSlug: null,
	lastAccuracy: null,
	completions: []
};

const isBrowser = () => typeof window !== 'undefined';

export const getChallengeDateKey = (date = new Date()) =>
	date.toISOString().slice(0, 10);

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T00:00:00.000Z`);

const diffDays = (a: string, b: string) =>
	Math.round(
		(parseDateKey(a).getTime() - parseDateKey(b).getTime()) / 86_400_000
	);

export const readDailyChallengeState = (): DailyChallengeState => {
	if (!isBrowser()) return initialDailyChallengeState;

	try {
		const item = window.localStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY);
		return item
			? ({
					...initialDailyChallengeState,
					...JSON.parse(item)
				} as DailyChallengeState)
			: initialDailyChallengeState;
	} catch {
		return initialDailyChallengeState;
	}
};

export const writeDailyChallengeState = (state: DailyChallengeState) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(
		DAILY_CHALLENGE_STORAGE_KEY,
		JSON.stringify(state)
	);
	dispatchAnalyticsLocalChange();
};

export const saveLastSessionTopic = (topicSlug: string | null) => {
	if (!isBrowser()) return;
	if (!topicSlug) {
		window.localStorage.removeItem(LAST_SESSION_TOPIC_KEY);
		return;
	}
	window.localStorage.setItem(LAST_SESSION_TOPIC_KEY, topicSlug);
};

export const readLastSessionTopic = () => {
	if (!isBrowser()) return null;
	return window.localStorage.getItem(LAST_SESSION_TOPIC_KEY);
};

export const buildDailyChallengeState = (
	completions: DailyChallengeCompletion[]
): DailyChallengeState => {
	const sorted = [...completions].sort((a, b) =>
		b.date.localeCompare(a.date)
	);
	if (sorted.length === 0) return initialDailyChallengeState;

	let currentStreak = 1;
	for (let index = 1; index < sorted.length; index += 1) {
		if (diffDays(sorted[index - 1].date, sorted[index].date) === 1) {
			currentStreak += 1;
			continue;
		}
		break;
	}

	let bestStreak = 1;
	let runningStreak = 1;
	for (let index = 1; index < sorted.length; index += 1) {
		if (diffDays(sorted[index - 1].date, sorted[index].date) === 1) {
			runningStreak += 1;
			bestStreak = Math.max(bestStreak, runningStreak);
			continue;
		}

		runningStreak = 1;
	}

	const latest = sorted[0];
	const todayDateKey = getChallengeDateKey();
	if (diffDays(todayDateKey, latest.date) > 1) {
		currentStreak = 0;
	}

	return {
		currentStreak,
		bestStreak,
		lastCompletedDate: latest.date,
		lastTopicSlug: latest.topicSlug,
		lastAccuracy: latest.accuracy,
		completions: sorted
	};
};

export const completeDailyChallenge = (input: {
	topicSlug: string;
	score: number;
	total: number;
	date?: Date;
}) => {
	const todayTopic = getDailyChallengeTopic(input.date);
	if (input.topicSlug !== todayTopic.slug) return readDailyChallengeState();

	const state = readDailyChallengeState();
	const dateKey = getChallengeDateKey(input.date);
	const accuracy =
		input.total === 0 ? 0 : Math.round((input.score / input.total) * 100);
	const existingToday = state.completions.find(
		(completion) => completion.date === dateKey
	);

	const completions = existingToday
		? state.completions.map((completion) =>
				completion.date === dateKey
					? {
							...completion,
							score: Math.max(completion.score, input.score),
							total: Math.max(completion.total, input.total),
							accuracy: Math.max(completion.accuracy, accuracy),
							completedAt: new Date().toISOString()
						}
					: completion
			)
		: [
				{
					date: dateKey,
					topicSlug: input.topicSlug,
					score: input.score,
					total: input.total,
					accuracy,
					completedAt: new Date().toISOString()
				},
				...state.completions
			].slice(0, 30);

	const currentStreak = existingToday
		? state.currentStreak
		: state.lastCompletedDate === null
			? 1
			: diffDays(dateKey, state.lastCompletedDate) === 1
				? state.currentStreak + 1
				: 1;

	const nextState: DailyChallengeState = {
		...buildDailyChallengeState(completions),
		currentStreak,
		bestStreak: Math.max(state.bestStreak, currentStreak),
		lastCompletedDate: dateKey,
		lastTopicSlug: input.topicSlug,
		lastAccuracy: existingToday
			? Math.max(state.lastAccuracy ?? 0, accuracy)
			: accuracy
	};

	writeDailyChallengeState(nextState);
	return nextState;
};
