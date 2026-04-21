'use client';

import {
	Award,
	BarChart3,
	Flame,
	RotateCcw,
	Sparkles,
	Target
} from 'lucide-react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import {
	buildMistakeStats,
	buildSessionStats,
	isChallengeDoneToday
} from '@/lib/analytics/metrics';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
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

const formatDate = (value: string, locale: string) =>
	new Intl.DateTimeFormat(locale, {
		month: 'short',
		day: 'numeric'
	}).format(new Date(value));

const MasteryDashboard = ({
	title,
	description,
	className = ''
}: {
	title?: string;
	description?: string;
	className?: string;
}) => {
	const t = useTranslations('MasteryDashboard');
	const locale = useLocale();
	const messages = useMessages() as {
		QuizTopics?: Record<string, LocalizedQuizTopicMessages>;
	};
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
	const strongestTopic = useMemo(() => {
		if (!sessionStats.strongestTopic) return null;
		const topic = getQuizTopicBySlug(sessionStats.strongestTopic.topicSlug);
		return topic
			? localizeQuizTopic(topic, messages.QuizTopics?.[topic.slug])
			: null;
	}, [messages.QuizTopics, sessionStats.strongestTopic]);
	const reviewTopic = useMemo(() => {
		if (!mistakeStats.reviewTopic) return null;
		const topic = getQuizTopicBySlug(mistakeStats.reviewTopic.topicSlug);
		return topic
			? localizeQuizTopic(topic, messages.QuizTopics?.[topic.slug])
			: null;
	}, [messages.QuizTopics, mistakeStats.reviewTopic]);
	const challengeDoneToday = isChallengeDoneToday(effectiveChallengeState);

	if (!isMounted) return null;

	const resolvedTitle = title ?? t('title');
	const resolvedDescription = description ?? t('description');

	return (
		<section
			className={`rounded-[32px] border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(5,150,105,0.10)] ${className}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
						{t('eyebrow')}
					</p>
					<h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
						{resolvedTitle}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{resolvedDescription}
					</p>
				</div>
				<Link
					href="/quizzes"
					className="inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-400"
				>
					{t('browseMoreTopics')}
				</Link>
			</div>

			<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				<StatCard
					icon={<BarChart3 className="size-4" />}
					label={t('stats.sessionsLogged')}
					value={String(sessionStats.totalSessions)}
					helper={t('stats.sessionsLoggedHelper')}
				/>
				<StatCard
					icon={<Target className="size-4" />}
					label={t('stats.topicsExplored')}
					value={String(sessionStats.uniqueTopics)}
					helper={t('stats.topicsExploredHelper')}
				/>
				<StatCard
					icon={<Award className="size-4" />}
					label={t('stats.averageAccuracy')}
					value={
						sessionStats.averageAccuracy !== null
							? `${sessionStats.averageAccuracy}%`
							: t('stats.noData')
					}
					helper={t('stats.averageAccuracyHelper')}
				/>
				<StatCard
					icon={<RotateCcw className="size-4" />}
					label={t('stats.openMistakes')}
					value={String(mistakeStats.totalUniqueMistakes)}
					helper={t('stats.openMistakesHelper')}
				/>
				<StatCard
					icon={<Flame className="size-4" />}
					label={t('stats.distanceFeedback')}
					value={
						mistakeStats.averageDistanceMeters !== null
							? t('stats.distanceKm', {
									value: Math.round(
										mistakeStats.averageDistanceMeters /
											1000
									)
								})
							: t('stats.noData')
					}
					helper={t('stats.distanceFeedbackHelper')}
				/>
			</div>

			<div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
				<div className="rounded-[26px] border border-emerald-200/70 bg-white/88 p-5">
					<div className="flex items-center gap-2 text-emerald-800">
						<Sparkles className="size-4" />
						<p className="text-sm font-bold uppercase tracking-[0.18em]">
							{t('bestMomentum.eyebrow')}
						</p>
					</div>

					{strongestTopic && sessionStats.strongestTopic ? (
						<div className="mt-4">
							<h3 className="text-xl font-bold text-slate-950">
								{strongestTopic.title}
							</h3>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{t('bestMomentum.summary', {
									accuracy:
										sessionStats.strongestTopic
											.averageAccuracy,
									plays: sessionStats.strongestTopic.plays
								})}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
									{t('bestMomentum.bestAccuracy', {
										accuracy:
											sessionStats.strongestTopic
												.bestAccuracy
									})}
								</span>
								<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
									{t('bestMomentum.lastPlayed', {
										date: formatDate(
											sessionStats.strongestTopic
												.lastPlayedAt,
											locale
										)
									})}
								</span>
							</div>
							<div className="mt-4 flex flex-wrap gap-3">
								<Link
									href={`/quiz/${strongestTopic.slug}`}
									className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
								>
									{t('openTopic')}
								</Link>
								<Link
									href={`${buildGameHref(strongestTopic.gameConfig)}&topic=${strongestTopic.slug}`}
									className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
								>
									{t('playAgain')}
								</Link>
							</div>
						</div>
					) : (
						<EmptyState text={t('bestMomentum.empty')} />
					)}
				</div>

				<div className="space-y-6">
					<div className="rounded-[26px] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.96))] p-5">
						<div className="flex items-center gap-2 text-amber-800">
							<Flame className="size-4" />
							<p className="text-sm font-bold uppercase tracking-[0.18em]">
								{t('dailyHabit.eyebrow')}
							</p>
						</div>
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							<div className="rounded-[22px] border border-amber-200/70 bg-white/85 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
									{t('dailyHabit.currentStreak')}
								</p>
								<p className="mt-2 text-2xl font-black text-slate-950">
									{effectiveChallengeState.currentStreak}
								</p>
							</div>
							<div className="rounded-[22px] border border-amber-200/70 bg-white/85 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
									{t('dailyHabit.bestStreak')}
								</p>
								<p className="mt-2 text-2xl font-black text-slate-950">
									{effectiveChallengeState.bestStreak}
								</p>
							</div>
						</div>
						<p className="mt-4 text-sm leading-6 text-slate-600">
							{challengeDoneToday
								? t('dailyHabit.doneToday')
								: t('dailyHabit.notDoneToday')}
						</p>
					</div>

					<div className="rounded-[26px] border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,255,255,0.96))] p-5">
						<div className="flex items-center gap-2 text-rose-800">
							<RotateCcw className="size-4" />
							<p className="text-sm font-bold uppercase tracking-[0.18em]">
								{t('needsReview.eyebrow')}
							</p>
						</div>

						{reviewTopic && mistakeStats.reviewTopic ? (
							<div className="mt-4">
								<h3 className="text-lg font-bold text-slate-950">
									{reviewTopic.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									{t('needsReview.uniqueMissesWaiting', {
										count: mistakeStats.reviewTopic
											.uniqueMisses
									})}
								</p>
								{mistakeStats.reviewTopic.lastMissedAt && (
									<p className="mt-2 text-xs font-semibold text-rose-700">
										{t('needsReview.lastMissSaved', {
											date: formatDate(
												mistakeStats.reviewTopic
													.lastMissedAt,
												locale
											)
										})}
									</p>
								)}
								<div className="mt-4 flex flex-wrap gap-3">
									<Link
										href={`${buildGameHref(reviewTopic.gameConfig)}&topic=${reviewTopic.slug}&review=mistakes`}
										className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
									>
										{t('reviewMisses')}
									</Link>
									<Link
										href={`/quiz/${reviewTopic.slug}`}
										className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
									>
										{t('openTopic')}
									</Link>
								</div>
							</div>
						) : (
							<EmptyState text={t('needsReview.empty')} />
						)}
					</div>
				</div>
			</div>

			{(sessionStats.latestSessions.length > 0 || latestRecentTopic) && (
				<div className="mt-6 rounded-[26px] border border-slate-200 bg-white/88 p-5">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="text-xl font-bold text-slate-950">
								{t('recentMomentum.title')}
							</h3>
							<p className="mt-1 text-sm leading-6 text-slate-600">
								{t('recentMomentum.description')}
							</p>
						</div>
						{latestRecentTopic &&
							getQuizTopicBySlug(latestRecentTopic.slug) && (
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
									{t('recentMomentum.lastOpenedTopic', {
										title: localizeQuizTopic(
											getQuizTopicBySlug(
												latestRecentTopic.slug
											)!,
											messages.QuizTopics?.[
												latestRecentTopic.slug
											]
										).shortTitle
									})}
								</p>
							)}
					</div>

					<div className="mt-4 grid gap-3 md:grid-cols-3">
						{sessionStats.latestSessions.map((session) => {
							const topic = session.topicSlug
								? getQuizTopicBySlug(session.topicSlug)
								: null;
							const localizedTopic = topic
								? localizeQuizTopic(
										topic,
										messages.QuizTopics?.[topic.slug]
									)
								: null;

							return (
								<div
									key={session.id}
									className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
								>
									<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
										{session.isDailyChallenge
											? t('recentMomentum.dailyChallenge')
											: (localizedTopic?.badge ??
												t(
													'recentMomentum.quizSession'
												))}
									</p>
									<h4 className="mt-2 text-base font-bold text-slate-950">
										{localizedTopic?.title ??
											t('recentMomentum.freePlaySession')}
									</h4>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										{t('recentMomentum.sessionSummary', {
											accuracy: session.accuracy,
											score: session.score,
											total: session.total
										})}
									</p>
									<p className="mt-3 text-xs font-semibold text-slate-400">
										{t('recentMomentum.finished', {
											date: formatDate(
												session.completedAt,
												locale
											)
										})}
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
