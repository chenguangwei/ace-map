'use client';

import type { Provider, Session, SupabaseClient, User } from '@supabase/supabase-js';
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import {
	type AnalyticsSnapshot,
	type ChallengeLeaderboard,
	type LeaderboardEntry,
	type ManagedDailyChallenge,
	type UserProfile,
	buildAnalyticsSnapshot
} from '@/lib/analytics/metrics';
import {
	getDailyChallengeTopic,
	getQuizTopicBySlug
} from '@/lib/data/quizTopics';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { ANALYTICS_LOCAL_CHANGE_EVENT } from '@/lib/utils/analyticsEvents';
import {
	type DailyChallengeCompletion,
	getChallengeDateKey,
	readDailyChallengeState
} from '@/lib/utils/challenge';
import {
	createPracticeSessionId,
	type PracticeSession,
	readPracticeSessions
} from '@/lib/utils/progress';
import { type MistakeEntry, readMistakeEntries } from '@/lib/utils/review';
import { readTopicObservabilityEvents } from '@/lib/utils/topicObservability';

const LOCAL_MIGRATION_KEY = 'ace-map-analytics-migration-v1';

type AnalyticsStatus = 'disabled' | 'loading' | 'ready' | 'error';

interface AnalyticsContextValue {
	enabled: boolean;
	status: AnalyticsStatus;
	user: User | null;
	profile: UserProfile | null;
	isAnonymous: boolean;
	snapshot: AnalyticsSnapshot | null;
	refresh: () => Promise<void>;
	signInWithProvider: (provider: Provider) => Promise<void>;
	recordChallengeScore: (input: {
		challengeDate: string;
		topicSlug: string;
		score: number;
		total: number;
		accuracy: number;
		timeSeconds: number;
		averageDistanceMeters: number | null;
	}) => Promise<void>;
	resolveMistake: (entry: MistakeEntry) => Promise<void>;
	clearTopicMistakes: (topicSlug: string) => Promise<void>;
}

const noop = async () => {};

const AnalyticsContext = createContext<AnalyticsContextValue>({
	enabled: false,
	status: 'disabled',
	user: null,
	profile: null,
	isAnonymous: false,
	snapshot: null,
	refresh: noop,
	signInWithProvider: noop,
	recordChallengeScore: noop,
	resolveMistake: noop,
	clearTopicMistakes: noop
});

const mapSessionRow = (row: Record<string, unknown>): PracticeSession => ({
	id: String(row.client_session_id),
	resultCode: String(row.result_code),
	topicSlug: row.topic_slug ? String(row.topic_slug) : null,
	score: Number(row.score),
	total: Number(row.total),
	accuracy: Number(row.accuracy),
	time: Number(row.time_seconds),
	bestStreak: Number(row.best_streak),
	isDailyChallenge: Boolean(row.is_daily_challenge),
	completedAt: String(row.completed_at)
});

const mapChallengeCompletionRow = (
	row: Record<string, unknown>
): DailyChallengeCompletion => ({
	date: String(row.challenge_date),
	topicSlug: String(row.topic_slug),
	score: Number(row.score),
	total: Number(row.total),
	accuracy: Number(row.accuracy),
	completedAt: String(row.completed_at)
});

const mapMistakeRow = (row: Record<string, unknown>): MistakeEntry => ({
	topicSlug: String(row.topic_slug),
	place: {
		name: String(row.place_name),
		latitude: Number(row.place_latitude),
		longitude: Number(row.place_longitude)
	},
	distance: Number(row.distance_meters),
	createdAt: String(row.created_at)
});

const mapProfileRow = (row: Record<string, unknown>): UserProfile => ({
	userId: String(row.user_id),
	displayName: row.display_name ? String(row.display_name) : null,
	avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
	isPublicOnLeaderboard:
		row.is_public_on_leaderboard === undefined
			? true
			: Boolean(row.is_public_on_leaderboard)
});

const buildFallbackChallenge = (): ManagedDailyChallenge => ({
	date: getChallengeDateKey(),
	topicSlug: getDailyChallengeTopic().slug,
	leaderboardEnabled: true,
	status: 'active'
});

const buildLocalSnapshot = () =>
	buildAnalyticsSnapshot({
		challengeCompletions: readDailyChallengeState().completions,
		sessions: readPracticeSessions(),
		mistakes: readMistakeEntries(),
		topicObservabilityEvents: readTopicObservabilityEvents(),
		currentChallenge: buildFallbackChallenge()
	});

const readMigrationFlag = (userId: string) => {
	if (typeof window === 'undefined') return false;
	return (
		window.localStorage.getItem(`${LOCAL_MIGRATION_KEY}:${userId}`) === 'done'
	);
};

const writeMigrationFlag = (userId: string) => {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(`${LOCAL_MIGRATION_KEY}:${userId}`, 'done');
};

const deriveDisplayName = (user: User) => {
	const metadata = user.user_metadata ?? {};
	const options = [
		metadata.display_name,
		metadata.full_name,
		metadata.name,
		metadata.user_name,
		metadata.preferred_username,
		user.email?.split('@')[0]
	].filter((value): value is string => typeof value === 'string' && value.length > 0);

	return options[0] ?? 'Explorer';
};

const deriveAvatarUrl = (user: User) => {
	const metadata = user.user_metadata ?? {};
	const avatar = [
		metadata.avatar_url,
		metadata.picture
	].find((value): value is string => typeof value === 'string' && value.length > 0);

	return avatar ?? null;
};

const syncUserProfile = async (
	client: SupabaseClient,
	user: User
): Promise<UserProfile> => {
	const profile: UserProfile = {
		userId: user.id,
		displayName: deriveDisplayName(user),
		avatarUrl: deriveAvatarUrl(user),
		isPublicOnLeaderboard: !Boolean(user.is_anonymous)
	};

	const response = await client.from('user_profiles').upsert(
		{
			user_id: profile.userId,
			display_name: profile.displayName,
			avatar_url: profile.avatarUrl,
			is_public_on_leaderboard: profile.isPublicOnLeaderboard
		},
		{
			onConflict: 'user_id',
			ignoreDuplicates: false
		}
	);

	if (response.error) throw response.error;
	return profile;
};

const fetchUserProfile = async (client: SupabaseClient, userId: string) => {
	const response = await client
		.from('user_profiles')
		.select('*')
		.eq('user_id', userId)
		.maybeSingle();

	if (response.error) throw response.error;
	return response.data ? mapProfileRow(response.data as Record<string, unknown>) : null;
};

const mapManagedChallengeRow = (
	row: Record<string, unknown>
): ManagedDailyChallenge => ({
	date: String(row.challenge_date),
	topicSlug: String(row.topic_slug),
	leaderboardEnabled: Boolean(row.leaderboard_enabled),
	status: String(row.status) as ManagedDailyChallenge['status'],
	titleOverride: row.title_override ? String(row.title_override) : null
});

const fetchManagedChallenge = async (
	client: SupabaseClient
): Promise<ManagedDailyChallenge> => {
	const today = getChallengeDateKey();
	const response = await client
		.from('daily_challenges')
		.select('*')
		.eq('challenge_date', today)
		.maybeSingle();

	if (response.error) throw response.error;
	if (!response.data) return buildFallbackChallenge();

	return mapManagedChallengeRow(response.data as Record<string, unknown>);
};

const isBetterScore = (
	nextScore: {
		accuracy: number;
		score: number;
		total: number;
		timeSeconds: number;
		averageDistanceMeters: number | null;
	},
	currentScore: {
		accuracy: number;
		score: number;
		total: number;
		time_seconds: number;
		average_distance_meters: number | null;
	}
) => {
	if (nextScore.accuracy !== Number(currentScore.accuracy)) {
		return nextScore.accuracy > Number(currentScore.accuracy);
	}

	const currentCorrectRatio =
		Number(currentScore.total) === 0
			? 0
			: Number(currentScore.score) / Number(currentScore.total);
	const nextCorrectRatio =
		nextScore.total === 0 ? 0 : nextScore.score / nextScore.total;
	if (nextCorrectRatio !== currentCorrectRatio) {
		return nextCorrectRatio > currentCorrectRatio;
	}

	if (nextScore.timeSeconds !== Number(currentScore.time_seconds)) {
		return nextScore.timeSeconds < Number(currentScore.time_seconds);
	}

	const currentDistance =
		currentScore.average_distance_meters === null
			? Number.POSITIVE_INFINITY
			: Number(currentScore.average_distance_meters);
	const nextDistance =
		nextScore.averageDistanceMeters === null
			? Number.POSITIVE_INFINITY
			: nextScore.averageDistanceMeters;

	return nextDistance < currentDistance;
};

const upsertPracticeSessions = async (
	client: SupabaseClient,
	userId: string,
	sessions: PracticeSession[]
) => {
	if (sessions.length === 0) return;

	const response = await client.from('game_sessions').upsert(
		sessions.map((session) => ({
			user_id: userId,
			client_session_id: session.id,
			result_code: session.resultCode,
			topic_slug: session.topicSlug,
			score: session.score,
			total: session.total,
			accuracy: session.accuracy,
			time_seconds: session.time,
			best_streak: session.bestStreak,
			is_daily_challenge: session.isDailyChallenge,
			completed_at: session.completedAt
		})),
		{
			onConflict: 'user_id,client_session_id',
			ignoreDuplicates: false
		}
	);

	if (response.error) throw response.error;
};

const upsertChallengeCompletions = async (
	client: SupabaseClient,
	userId: string,
	completions: DailyChallengeCompletion[]
) => {
	if (completions.length === 0) return;

	const response = await client.from('daily_challenge_completions').upsert(
		completions.map((completion) => ({
			user_id: userId,
			challenge_date: completion.date,
			topic_slug: completion.topicSlug,
			score: completion.score,
			total: completion.total,
			accuracy: completion.accuracy,
			completed_at: completion.completedAt
		})),
		{
			onConflict: 'user_id,challenge_date',
			ignoreDuplicates: false
		}
	);

	if (response.error) throw response.error;
};

const upsertMistakes = async (
	client: SupabaseClient,
	userId: string,
	mistakes: MistakeEntry[]
) => {
	if (mistakes.length === 0) return;

	const response = await client.from('mistake_entries').upsert(
		mistakes.map((entry) => ({
			user_id: userId,
			topic_slug: entry.topicSlug,
			place_name: entry.place.name,
			place_latitude: entry.place.latitude,
			place_longitude: entry.place.longitude,
			distance_meters: entry.distance,
			resolved: false,
			created_at: entry.createdAt,
			resolved_at: null
		})),
		{
			onConflict:
				'user_id,topic_slug,place_name,place_latitude,place_longitude',
			ignoreDuplicates: false
		}
	);

	if (response.error) throw response.error;
};

const upsertChallengeScore = async (
	client: SupabaseClient,
	userId: string,
	score: {
		challengeDate: string;
		topicSlug: string;
		score: number;
		total: number;
		accuracy: number;
		timeSeconds: number;
		averageDistanceMeters: number | null;
	}
) => {
	const existingResponse = await client
		.from('daily_challenge_scores')
		.select('*')
		.eq('user_id', userId)
		.eq('challenge_date', score.challengeDate)
		.maybeSingle();

	if (existingResponse.error) throw existingResponse.error;

	if (
		existingResponse.data &&
		!isBetterScore(
			score,
			existingResponse.data as Record<string, unknown> as {
				accuracy: number;
				score: number;
				total: number;
				time_seconds: number;
				average_distance_meters: number | null;
			}
		)
	) {
		return;
	}

	const response = await client.from('daily_challenge_scores').upsert(
		{
			user_id: userId,
			challenge_date: score.challengeDate,
			topic_slug: score.topicSlug,
			score: score.score,
			total: score.total,
			accuracy: score.accuracy,
			time_seconds: score.timeSeconds,
			average_distance_meters: score.averageDistanceMeters
		},
		{
			onConflict: 'user_id,challenge_date',
			ignoreDuplicates: false
		}
	);

	if (response.error) throw response.error;
};

const fetchLeaderboard = async (
	client: SupabaseClient,
	userId: string,
	challenge: ManagedDailyChallenge
): Promise<ChallengeLeaderboard | null> => {
	if (!challenge.leaderboardEnabled) return null;

	const response = await client
		.from('daily_challenge_scores')
		.select(
			'user_id, challenge_date, topic_slug, score, total, accuracy, time_seconds, average_distance_meters, user_profiles(display_name, avatar_url, is_public_on_leaderboard)'
		)
		.eq('challenge_date', challenge.date)
		.eq('topic_slug', challenge.topicSlug);

	if (response.error) throw response.error;

	const rows = (response.data ?? []) as Array<Record<string, unknown>>;
	const normalized = rows
		.map((row) => {
			const relatedProfiles = Array.isArray(row.user_profiles)
				? (row.user_profiles[0] as Record<string, unknown> | undefined)
				: (row.user_profiles as Record<string, unknown> | null);
			const profile = relatedProfiles
				? {
						displayName:
							typeof relatedProfiles.display_name === 'string'
								? relatedProfiles.display_name
								: null,
						avatarUrl:
							typeof relatedProfiles.avatar_url === 'string'
								? relatedProfiles.avatar_url
								: null,
						isPublicOnLeaderboard:
							relatedProfiles.is_public_on_leaderboard === undefined
								? true
								: Boolean(
										relatedProfiles.is_public_on_leaderboard
									)
				  }
				: {
						displayName: null,
						avatarUrl: null,
						isPublicOnLeaderboard: false
				  };

			return {
				userId: String(row.user_id),
				displayName:
					profile.displayName ??
					(String(row.user_id).slice(0, 8) === userId.slice(0, 8)
						? 'You'
						: 'Player'),
				avatarUrl: profile.avatarUrl,
				isPublicOnLeaderboard: profile.isPublicOnLeaderboard,
				accuracy: Number(row.accuracy),
				score: Number(row.score),
				total: Number(row.total),
				timeSeconds: Number(row.time_seconds),
				averageDistanceMeters:
					row.average_distance_meters === null
						? null
						: Number(row.average_distance_meters)
			};
		})
		.sort((a, b) => {
			if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
			if (b.score !== a.score) return b.score - a.score;
			if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
			const distanceA =
				a.averageDistanceMeters === null
					? Number.POSITIVE_INFINITY
					: a.averageDistanceMeters;
			const distanceB =
				b.averageDistanceMeters === null
					? Number.POSITIVE_INFINITY
					: b.averageDistanceMeters;
			return distanceA - distanceB;
		});

	const ranked = normalized.map((entry, index) => ({
		...entry,
		position: index + 1,
		isCurrentUser: entry.userId === userId
	}));

	const myEntry =
		ranked.find((entry) => entry.userId === userId) ?? null;
	const entries = ranked.filter(
		(entry) => entry.isPublicOnLeaderboard || entry.isCurrentUser
	);

	return {
		challengeDate: challenge.date,
		topicSlug: challenge.topicSlug,
		entries: entries.slice(0, 10) as LeaderboardEntry[],
		myEntry: myEntry as LeaderboardEntry | null
	};
};

const fetchRemoteSnapshot = async (
	client: SupabaseClient,
	userId: string,
	profile: UserProfile | null
): Promise<AnalyticsSnapshot> => {
	const [sessionsResponse, challengesResponse, mistakesResponse, currentChallenge] =
		await Promise.all([
			client
				.from('game_sessions')
				.select('*')
				.eq('user_id', userId)
				.order('completed_at', { ascending: false }),
			client
				.from('daily_challenge_completions')
				.select('*')
				.eq('user_id', userId)
				.order('challenge_date', { ascending: false }),
			client
				.from('mistake_entries')
				.select('*')
				.eq('user_id', userId)
				.eq('resolved', false)
				.order('created_at', { ascending: false }),
			fetchManagedChallenge(client)
		]);

	if (sessionsResponse.error) throw sessionsResponse.error;
	if (challengesResponse.error) throw challengesResponse.error;
	if (mistakesResponse.error) throw mistakesResponse.error;

	const leaderboard = await fetchLeaderboard(client, userId, currentChallenge);

	return buildAnalyticsSnapshot({
		challengeCompletions: (challengesResponse.data ?? []).map((row) =>
			mapChallengeCompletionRow(row as Record<string, unknown>)
		),
		sessions: (sessionsResponse.data ?? []).map((row) =>
			mapSessionRow(row as Record<string, unknown>)
		),
		mistakes: (mistakesResponse.data ?? []).map((row) =>
			mapMistakeRow(row as Record<string, unknown>)
		),
		topicObservabilityEvents: readTopicObservabilityEvents(),
		currentChallenge,
		leaderboard,
		profile
	});
};

const syncLocalAnalytics = async (client: SupabaseClient, userId: string) => {
	await Promise.all([
		upsertPracticeSessions(client, userId, readPracticeSessions()),
		upsertChallengeCompletions(
			client,
			userId,
			readDailyChallengeState().completions
		),
		upsertMistakes(client, userId, readMistakeEntries())
	]);
};

const migrateLocalAnalytics = async (
	client: SupabaseClient,
	userId: string
) => {
	if (readMigrationFlag(userId)) return;

	await syncLocalAnalytics(client, userId);
	writeMigrationFlag(userId);
};

const ensureAnonymousUser = async (client: SupabaseClient) => {
	const {
		data: { session }
	} = await client.auth.getSession();
	if (session?.user) return session.user;

	const anonymousAuth = await client.auth.signInAnonymously();
	if (anonymousAuth.error) throw anonymousAuth.error;
	return anonymousAuth.data.user;
};

const AnalyticsProvider = ({ children }: PropsWithChildren) => {
	const configured = isSupabaseConfigured();
	const bootstrapRef = useRef(false);
	const [client, setClient] = useState<SupabaseClient | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [status, setStatus] = useState<AnalyticsStatus>(
		configured ? 'loading' : 'disabled'
	);
	const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);

	const refresh = useCallback(async () => {
		if (!client || !user) return;
		const latestProfile = (await fetchUserProfile(client, user.id)) ??
			(await syncUserProfile(client, user));
		setProfile(latestProfile);
		const nextSnapshot = await fetchRemoteSnapshot(client, user.id, latestProfile);
		setSnapshot(nextSnapshot);
	}, [client, user]);

	useEffect(() => {
		if (!configured) {
			setSnapshot(buildLocalSnapshot());
			return;
		}

		if (bootstrapRef.current) return;
		bootstrapRef.current = true;

		const nextClient = getSupabaseBrowserClient();
		if (!nextClient) {
			setStatus('disabled');
			setSnapshot(buildLocalSnapshot());
			return;
		}

		setClient(nextClient);

		const bootstrap = async () => {
			try {
				const nextUser = await ensureAnonymousUser(nextClient);
				if (!nextUser) {
					throw new Error('Anonymous user bootstrap returned null');
				}

				setUser(nextUser);
				const nextProfile = await syncUserProfile(nextClient, nextUser);
				setProfile(nextProfile);
				await migrateLocalAnalytics(nextClient, nextUser.id);
				const nextSnapshot = await fetchRemoteSnapshot(
					nextClient,
					nextUser.id,
					nextProfile
				);
				setSnapshot(nextSnapshot);
				setStatus('ready');
			} catch (error) {
				console.error('Failed to bootstrap analytics', error);
				setSnapshot(buildLocalSnapshot());
				setStatus('error');
			}
		};

		void bootstrap();

		const {
			data: { subscription }
		} = nextClient.auth.onAuthStateChange(
			(_event: string, session: Session | null) => {
				void (async () => {
					const sessionUser = session?.user ?? null;
					setUser(sessionUser);
					if (!sessionUser) return;
					const nextProfile = await syncUserProfile(nextClient, sessionUser);
					setProfile(nextProfile);
					const nextSnapshot = await fetchRemoteSnapshot(
						nextClient,
						sessionUser.id,
						nextProfile
					);
					setSnapshot(nextSnapshot);
				})().catch((error) => {
					console.error('Failed to refresh auth state', error);
				});
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [configured]);

	useEffect(() => {
		if (!client || !user) return;

		const handleLocalChange = () => {
			void syncLocalAnalytics(client, user.id)
				.then(refresh)
				.catch((error) => {
					console.error('Failed to sync local analytics', error);
				});
		};

		window.addEventListener(ANALYTICS_LOCAL_CHANGE_EVENT, handleLocalChange);
		return () => {
			window.removeEventListener(
				ANALYTICS_LOCAL_CHANGE_EVENT,
				handleLocalChange
			);
		};
	}, [client, refresh, user]);

	const signInWithProvider = useCallback(
		async (provider: Provider) => {
			if (!client) return;
			const redirectTo =
				typeof window !== 'undefined' ? window.location.href : undefined;
			const authAction =
				user?.is_anonymous === true
					? client.auth.linkIdentity({
							provider,
							options: { redirectTo }
					  })
					: client.auth.signInWithOAuth({
							provider,
							options: { redirectTo }
					  });

			const response = await authAction;
			if (response.error) throw response.error;
		},
		[client, user]
	);

	const recordChallengeScore = useCallback(
		async (input: {
			challengeDate: string;
			topicSlug: string;
			score: number;
			total: number;
			accuracy: number;
			timeSeconds: number;
			averageDistanceMeters: number | null;
		}) => {
			if (!client || !user) return;
			await upsertChallengeScore(client, user.id, input);
			await refresh();
		},
		[client, refresh, user]
	);

	const resolveMistake = useCallback(
		async (entry: MistakeEntry) => {
			if (!client || !user) return;

			const response = await client
				.from('mistake_entries')
				.update({
					resolved: true,
					resolved_at: new Date().toISOString()
				})
				.eq('user_id', user.id)
				.eq('topic_slug', entry.topicSlug)
				.eq('place_name', entry.place.name)
				.eq('place_latitude', entry.place.latitude)
				.eq('place_longitude', entry.place.longitude);

			if (response.error) throw response.error;
			await refresh();
		},
		[client, refresh, user]
	);

	const clearTopicMistakes = useCallback(
		async (topicSlug: string) => {
			if (!client || !user) return;

			const response = await client
				.from('mistake_entries')
				.update({
					resolved: true,
					resolved_at: new Date().toISOString()
				})
				.eq('user_id', user.id)
				.eq('topic_slug', topicSlug)
				.eq('resolved', false);

			if (response.error) throw response.error;
			await refresh();
		},
		[client, refresh, user]
	);

	const value = useMemo<AnalyticsContextValue>(
		() => ({
			enabled: configured,
			status,
			user,
			profile,
			isAnonymous: Boolean(user?.is_anonymous),
			snapshot,
			refresh,
			signInWithProvider,
			recordChallengeScore,
			resolveMistake,
			clearTopicMistakes
		}),
		[
			clearTopicMistakes,
			configured,
			profile,
			recordChallengeScore,
			refresh,
			resolveMistake,
			signInWithProvider,
			snapshot,
			status,
			user
		]
	);

	return (
		<AnalyticsContext.Provider value={value}>
			{children}
		</AnalyticsContext.Provider>
	);
};

export const useAnalytics = () => useContext(AnalyticsContext);

export default AnalyticsProvider;
