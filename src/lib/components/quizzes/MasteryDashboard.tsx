'use client';

import {
	Award,
	BarChart3,
	Flame,
	RotateCcw,
	Sparkles,
	Target
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
	buildMistakeStats,
	buildSessionStats,
	isChallengeDoneToday
} from '@/lib/analytics/metrics';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import { buildGameHref, getQuizTopicBySlug } from '@/lib/data/quizTopics';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import {
	DAILY_CHALLENGE_STORAGE_KEY,
	type DailyChallengeState,
	initialDailyChallengeState
} from '@/lib/utils/challenge';
import {
	PRACTICE_HISTORY_STORAGE_KEY,
	type PracticeSession,
	RECENT_TOPICS_STORAGE_KEY,
	type RecentTopicEntry
} from '@/lib/utils/progress';
import { MISTAKE_STORAGE_KEY, type MistakeEntry } from '@/lib/utils/review';

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	});

const MasteryDashboard = ({
	title = 'Mastery dashboard',
	description = 'Track your geography practice with one consistent metrics layer, then jump into the most useful next session.',
	className = ''
}: {
	title?: string;
	description?: string;
	className?: string;
}) => {
	const isMounted = useIsMounted();
	const analytics = useAnalytics();
	const [challengeState] = useLocalStorage<DailyChallengeState>(
		DAILY_CHALLENGE_STORAGE_KEY,
		initialDailyChallengeState
	);
	const [mistakes] = useLocalStorage<MistakeEntry[]>(MISTAKE_STORAGE_KEY, []);
	const [recentTopics] = useLocalStorage<RecentTopicEntry[]>(
		RECENT_TOPICS_STORAGE_KEY,
		[]
	);
	const [sessions] = useLocalStorage<PracticeSession[]>(
		PRACTICE_HISTORY_STORAGE_KEY,
		[]
	);

	const effectiveChallengeState =
		analytics.snapshot?.challengeState ?? challengeState;
	const effectiveMistakes = analytics.snapshot?.mistakes ?? mistakes;
	const effectiveSessions = analytics.snapshot?.sessions ?? sessions;

	const sessionStats = useMemo(
		() => buildSessionStats(effectiveSessions),
		[effectiveSessions]
	);
	const mistakeStats = useMemo(
		() => buildMistakeStats(effectiveMistakes),
		[effectiveMistakes]
	);

	const latestRecentTopic = useMemo(
		() => recentTopics.find((entry) => getQuizTopicBySlug(entry.slug)),
		[recentTopics]
	);
	const strongestTopic = sessionStats.strongestTopic
		? getQuizTopicBySlug(sessionStats.strongestTopic.topicSlug)
		: null;
	const reviewTopic = mistakeStats.reviewTopic
		? getQuizTopicBySlug(mistakeStats.reviewTopic.topicSlug)
		: null;
	const challengeDoneToday = isChallengeDoneToday(effectiveChallengeState);

	if (!isMounted) return null;

	return (
		<section
			className={`rounded-[32px] border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(5,150,105,0.10)] ${className}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
						Unified Metrics
					</p>
					<h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
						{title}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{description}
					</p>
				</div>
				<Link
					href="/quizzes"
					className="inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-400"
				>
					Browse more topics
				</Link>
			</div>

			<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				<StatCard
					icon={<BarChart3 className="size-4" />}
					label="Sessions logged"
					value={String(sessionStats.totalSessions)}
					helper="Completed quiz sessions"
				/>
				<StatCard
					icon={<Target className="size-4" />}
					label="Topics explored"
					value={String(sessionStats.uniqueTopics)}
					helper="Unique topic slugs completed"
				/>
				<StatCard
					icon={<Award className="size-4" />}
					label="Average accuracy"
					value={
						sessionStats.averageAccuracy !== null
							? `${sessionStats.averageAccuracy}%`
							: 'No data'
					}
					helper="Across all completed sessions"
				/>
				<StatCard
					icon={<RotateCcw className="size-4" />}
					label="Open mistakes"
					value={String(mistakeStats.totalUniqueMistakes)}
					helper="Unresolved missed locations"
				/>
				<StatCard
					icon={<Flame className="size-4" />}
					label="Distance feedback"
					value={
						mistakeStats.averageDistanceMeters !== null
							? `${Math.round(mistakeStats.averageDistanceMeters / 1000)} km`
							: 'No data'
					}
					helper="Average distance on open mistakes"
				/>
			</div>

			<div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
				<div className="rounded-[26px] border border-emerald-200/70 bg-white/88 p-5">
					<div className="flex items-center gap-2 text-emerald-800">
						<Sparkles className="size-4" />
						<p className="text-sm font-bold uppercase tracking-[0.18em]">
							Best Momentum
						</p>
					</div>

					{strongestTopic && sessionStats.strongestTopic ? (
						<div className="mt-4">
							<h3 className="text-xl font-bold text-slate-950">
								{strongestTopic.title}
							</h3>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								Your strongest topic so far with{' '}
								{sessionStats.strongestTopic.averageAccuracy}%
								average accuracy across{' '}
								{sessionStats.strongestTopic.plays} session
								{sessionStats.strongestTopic.plays === 1
									? ''
									: 's'}
								.
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
									Best{' '}
									{sessionStats.strongestTopic.bestAccuracy}%
								</span>
								<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
									Last played{' '}
									{formatDate(
										sessionStats.strongestTopic.lastPlayedAt
									)}
								</span>
							</div>
							<div className="mt-4 flex flex-wrap gap-3">
								<Link
									href={`/quiz/${strongestTopic.slug}`}
									className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
								>
									Open topic
								</Link>
								<Link
									href={`${buildGameHref(strongestTopic.gameConfig)}&topic=${strongestTopic.slug}`}
									className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
								>
									Play again
								</Link>
							</div>
						</div>
					) : (
						<EmptyState text="Finish a few quiz sessions and this panel will surface your strongest topic automatically." />
					)}
				</div>

				<div className="space-y-6">
					<div className="rounded-[26px] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.96))] p-5">
						<div className="flex items-center gap-2 text-amber-800">
							<Flame className="size-4" />
							<p className="text-sm font-bold uppercase tracking-[0.18em]">
								Daily Habit
							</p>
						</div>
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							<div className="rounded-[22px] border border-amber-200/70 bg-white/85 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
									Current streak
								</p>
								<p className="mt-2 text-2xl font-black text-slate-950">
									{effectiveChallengeState.currentStreak}
								</p>
							</div>
							<div className="rounded-[22px] border border-amber-200/70 bg-white/85 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
									Best streak
								</p>
								<p className="mt-2 text-2xl font-black text-slate-950">
									{effectiveChallengeState.bestStreak}
								</p>
							</div>
						</div>
						<p className="mt-4 text-sm leading-6 text-slate-600">
							{challengeDoneToday
								? 'Today is already marked complete. Keep the loop going with another topic or review your misses.'
								: 'You have not closed today’s challenge yet. A quick run here keeps the habit active.'}
						</p>
					</div>

					<div className="rounded-[26px] border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,255,255,0.96))] p-5">
						<div className="flex items-center gap-2 text-rose-800">
							<RotateCcw className="size-4" />
							<p className="text-sm font-bold uppercase tracking-[0.18em]">
								Needs Review
							</p>
						</div>

						{reviewTopic && mistakeStats.reviewTopic ? (
							<div className="mt-4">
								<h3 className="text-lg font-bold text-slate-950">
									{reviewTopic.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									You still have{' '}
									{mistakeStats.reviewTopic.uniqueMisses}{' '}
									unique missed locations waiting here.
								</p>
								{mistakeStats.reviewTopic.lastMissedAt && (
									<p className="mt-2 text-xs font-semibold text-rose-700">
										Last miss saved{' '}
										{formatDate(
											mistakeStats.reviewTopic
												.lastMissedAt
										)}
									</p>
								)}
								<div className="mt-4 flex flex-wrap gap-3">
									<Link
										href={`${buildGameHref(reviewTopic.gameConfig)}&topic=${reviewTopic.slug}&review=mistakes`}
										className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
									>
										Review misses
									</Link>
									<Link
										href={`/quiz/${reviewTopic.slug}`}
										className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
									>
										Open topic
									</Link>
								</div>
							</div>
						) : (
							<EmptyState text="Wrong answers will start filling this panel automatically once you miss a few locations." />
						)}
					</div>
				</div>
			</div>

			{(sessionStats.latestSessions.length > 0 || latestRecentTopic) && (
				<div className="mt-6 rounded-[26px] border border-slate-200 bg-white/88 p-5">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="text-xl font-bold text-slate-950">
								Recent momentum
							</h3>
							<p className="mt-1 text-sm leading-6 text-slate-600">
								Use your latest sessions to decide whether to
								repeat a strong topic or clean up your misses.
							</p>
						</div>
						{latestRecentTopic &&
							getQuizTopicBySlug(latestRecentTopic.slug) && (
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
									Last opened{' '}
									{
										getQuizTopicBySlug(
											latestRecentTopic.slug
										)?.shortTitle
									}
								</p>
							)}
					</div>

					<div className="mt-4 grid gap-3 md:grid-cols-3">
						{sessionStats.latestSessions.map((session) => {
							const topic = session.topicSlug
								? getQuizTopicBySlug(session.topicSlug)
								: null;

							return (
								<div
									key={session.id}
									className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
								>
									<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
										{session.isDailyChallenge
											? 'Daily challenge'
											: (topic?.badge ?? 'Quiz session')}
									</p>
									<h4 className="mt-2 text-base font-bold text-slate-950">
										{topic?.title ?? 'Free play session'}
									</h4>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										{session.accuracy}% accuracy ·{' '}
										{session.score}/{session.total} correct
									</p>
									<p className="mt-3 text-xs font-semibold text-slate-400">
										Finished{' '}
										{formatDate(session.completedAt)}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
};

const StatCard = ({
	icon,
	label,
	value,
	helper
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	helper: string;
}) => (
	<div className="rounded-[24px] border border-emerald-200/70 bg-white/88 p-4">
		<div className="flex items-center gap-2 text-emerald-800">
			{icon}
			<p className="text-xs font-bold uppercase tracking-[0.18em]">
				{label}
			</p>
		</div>
		<p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
			{value}
		</p>
		<p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
	</div>
);

const EmptyState = ({ text }: { text: string }) => (
	<p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
);

export default MasteryDashboard;
