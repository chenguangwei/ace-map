import { dispatchAnalyticsLocalChange } from '@/lib/utils/analyticsEvents';

export const RECENT_TOPICS_STORAGE_KEY = 'ace-map-recent-topics';
export const PRACTICE_HISTORY_STORAGE_KEY = 'ace-map-practice-history';

export interface RecentTopicEntry {
	slug: string;
	lastVisitedAt: string;
}

export interface PracticeSession {
	id: string;
	resultCode: string;
	topicSlug: string | null;
	campaignSlug?: string | null;
	campaignRemixPrompt?: string | null;
	score: number;
	total: number;
	accuracy: number;
	time: number;
	bestStreak: number;
	isDailyChallenge: boolean;
	completedAt: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const createPracticeSessionId = () => {
	if (
		typeof crypto !== 'undefined' &&
		typeof crypto.randomUUID === 'function'
	) {
		return crypto.randomUUID();
	}

	return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizePracticeSession = (
	session: Omit<PracticeSession, 'id'> & { id?: string },
	index: number
): PracticeSession => ({
	id:
		session.id ??
		`legacy-${session.resultCode}-${session.completedAt}-${index}`.replaceAll(
			/\s+/g,
			'-'
		),
	campaignSlug: session.campaignSlug ?? null,
	campaignRemixPrompt: session.campaignRemixPrompt ?? null,
	...session
});

export const readPracticeSessions = (): PracticeSession[] => {
	if (!isBrowser()) return [];

	try {
		const item = window.localStorage.getItem(PRACTICE_HISTORY_STORAGE_KEY);
		return item
			? (
					JSON.parse(item) as Array<
						Omit<PracticeSession, 'id'> & { id?: string }
					>
				).map(normalizePracticeSession)
			: [];
	} catch {
		return [];
	}
};

export const writePracticeSessions = (sessions: PracticeSession[]) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(
		PRACTICE_HISTORY_STORAGE_KEY,
		JSON.stringify(sessions)
	);
	dispatchAnalyticsLocalChange();
};

export const savePracticeSession = (
	session: Omit<PracticeSession, 'id'> & { id?: string }
) => {
	const sessions = readPracticeSessions();
	const nextSession = normalizePracticeSession(session, 0);
	const nextSessions = [
		nextSession,
		...sessions.filter((existing) => existing.id !== nextSession.id)
	].slice(0, 40);

	writePracticeSessions(nextSessions);
	return nextSessions;
};
