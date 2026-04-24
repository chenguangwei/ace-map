'use client';
import { Button } from '@heroui/react';
import { addToast } from '@heroui/toast';
// @ts-expect-error - no types
import confetti from 'canvas-confetti';
import {
	ChartBarStacked,
	Clock,
	Copy,
	Flame,
	Globe,
	Share2,
	Target,
	Trophy,
	Zap
} from 'lucide-react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {
	deriveCampaignRunState,
	evaluateCampaignResult
} from '@/lib/campaigns/runtime';
import AdSlot from '@/lib/components/monetization/AdSlot';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MasteryDashboard from '@/lib/components/quizzes/MasteryDashboard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import {
	type AppLocale,
	buildCampaignPlayHref,
	deriveCampaignRemixDraft,
	getCampaignBySlug
} from '@/lib/data/campaigns';
import { FEATURED_COUNTRIES } from '@/lib/data/countries';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic,
	localizeQuizTopics
} from '@/lib/data/quizTopicI18n';
import {
	buildGameHref,
	getDailyChallengeTopic,
	getQuizTopicBySlug,
	getRecommendedQuizTopics
} from '@/lib/data/quizTopics';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import {
	completeDailyChallenge,
	DAILY_CHALLENGE_STORAGE_KEY,
	type DailyChallengeState,
	initialDailyChallengeState,
	readLastSessionTopic
} from '@/lib/utils/challenge';
import {
	createPracticeSessionId,
	savePracticeSession
} from '@/lib/utils/progress';
import { decodeResult } from '../utils/game';

const count = 200;
const defaults = { origin: { y: -0.7 }, angle: 270 };

const gradients = {
	0: 'from-rose-400/80 to-red-600/80 dark:from-rose-600/80 dark:to-red-800/80',
	50: 'from-yellow-400/80 to-yellow-600/80 dark:from-yellow-600/80 dark:to-yellow-800/80',
	75: 'from-emerald-400/80 to-emerald-600/80 dark:from-emerald-600/80 dark:to-emerald-800/80'
};
const txtColors = {
	0: 'text-rose-800 dark:text-rose-100',
	50: 'text-yellow-800 dark:text-yellow-100',
	75: 'text-emerald-800 dark:text-emerald-100'
};
const shadows = {
	0: 'sm:shadow-rose-500/50',
	50: 'sm:shadow-yellow-500/50',
	75: 'sm:shadow-emerald-500/50'
};

const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

const fire = (particleRatio: number, opts: Record<string, unknown>) => {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio)
	});
};

const Result = (props: {
	code: string;
	campaignSlug?: string;
	remixPrompt?: string;
	topicSlug?: string;
}) => {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('Result');
	const commonT = useTranslations('Common');
	const startT = useTranslations('Start');
	const messages = useMessages() as { QuizTopics?: unknown };
	const quizTopicMessages = (messages.QuizTopics ?? {}) as Partial<
		Record<string, LocalizedQuizTopicMessages | undefined>
	>;
	const gradeMessages = {
		0: { title: t('grade0Title'), message: t('grade0Message') },
		50: { title: t('grade50Title'), message: t('grade50Message') },
		75: { title: t('grade75Title'), message: t('grade75Message') }
	} as const;
	const result = useMemo(() => decodeResult(props.code), [props.code]);
	const sessionIdRef = useRef(createPracticeSessionId());
	const persistedRef = useRef(false);
	const [sessionTopicSlug, setSessionTopicSlug] = useState<string | null>(
		null
	);
	const [copied, setCopied] = useState(false);
	const [challengeState, setChallengeState] =
		useLocalStorage<DailyChallengeState>(
			DAILY_CHALLENGE_STORAGE_KEY,
			initialDailyChallengeState
		);
	const activeCampaign = props.campaignSlug
		? getCampaignBySlug(locale as AppLocale, props.campaignSlug)
		: null;
	const remixDraft =
		activeCampaign && props.remixPrompt
			? deriveCampaignRemixDraft(activeCampaign, props.remixPrompt)
			: null;

	useEffect(() => {
		fire(0.4, { spread: 26, startVelocity: 55 });
		fire(0.2, { spread: 60 });
		fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
		fire(0.5, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
		fire(0.5, { spread: 120, startVelocity: 45 });
	}, []);

	useEffect(() => {
		if (persistedRef.current || !result) return;

		const lastTopicSlug = readLastSessionTopic();
		const completedAt = new Date().toISOString();
		const accuracy =
			result.total === 0
				? 0
				: Math.round((result.score / result.total) * 100);
		const isDailyChallenge =
			lastTopicSlug !== null &&
			lastTopicSlug === getDailyChallengeTopic().slug;
		setSessionTopicSlug(lastTopicSlug);
		if (lastTopicSlug) {
			const nextState = completeDailyChallenge({
				topicSlug: lastTopicSlug,
				score: result.score,
				total: result.total
			});
			setChallengeState(nextState);
		}

		if (result.total > 0) {
			savePracticeSession({
				id: sessionIdRef.current,
				resultCode: props.code,
				topicSlug: lastTopicSlug,
				campaignSlug: props.campaignSlug ?? null,
				campaignRemixPrompt: props.remixPrompt ?? null,
				score: result.score,
				total: result.total,
				accuracy,
				time: result.time ?? 0,
				bestStreak: result.bestStreak ?? 0,
				isDailyChallenge,
				completedAt
			});
		}

		persistedRef.current = true;
	}, [
		props.campaignSlug,
		props.code,
		props.remixPrompt,
		result,
		setChallengeState
	]);

	const accuracy = result
		? Math.round(
				result.total === 0 ? 0 : (result.score / result.total) * 100
			)
		: 0;

	const formattedTime = useMemo(() => {
		const t = result?.time ?? 0;
		const minutes = Math.floor(t / 60);
		const seconds = t - minutes * 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}, [result?.time]);

	const strictnessLabel = useMemo(() => {
		const mode = result?.mode ?? 'india';
		const v = result?.strictness;
		if (mode === 'world') {
			if (v !== undefined && v <= 300000) return t('precisionHigh');
			if (v !== undefined && v <= 800000) return t('precisionMedium');
			return t('precisionLow');
		}
		if (v !== undefined && v <= 50000) return t('precisionHigh');
		if (v !== undefined && v <= 150000) return t('precisionMedium');
		return t('precisionLow');
	}, [result, t]);

	const modeLabel = useMemo(() => {
		const mode = result?.mode ?? 'india';
		if (mode === 'world')
			return {
				icon: <Globe className="size-4" />,
				text: t('worldCountries')
			};
		if (mode === 'country') {
			const country = FEATURED_COUNTRIES.find(
				(c) => c.code === (result?.countryCode ?? 'in')
			);
			return {
				icon: <span>{country?.flag ?? '🌍'}</span>,
				text: country?.name ?? t('countryFallback')
			};
		}
		return { icon: <span>🇮🇳</span>, text: t('indiaMode') };
	}, [result, t]);

	const tier = accuracy >= 75 ? 75 : accuracy >= 50 ? 50 : 0;
	const gradient = gradients[tier];
	const textColor = txtColors[tier];
	const shadow = shadows[tier];
	const messageData = gradeMessages[tier];
	const campaignRunState = useMemo(() => {
		if (!activeCampaign || !result) return null;

		return deriveCampaignRunState({
			campaign: activeCampaign,
			answeredQuestions: result.total,
			totalQuestions: result.total,
			correctAnswers: result.score
		});
	}, [activeCampaign, result]);
	const campaignEvaluation = useMemo(() => {
		if (!activeCampaign) return null;

		return evaluateCampaignResult({
			campaign: activeCampaign,
			accuracy,
			bestStreak: result?.bestStreak ?? 0
		});
	}, [accuracy, activeCampaign, result?.bestStreak]);
	const campaignEndingIntro = useMemo(() => {
		if (!campaignEvaluation) return null;
		return t(
			`campaignStoryEnding${campaignEvaluation.tier[0].toUpperCase()}${campaignEvaluation.tier.slice(1)}Intro`
		);
	}, [campaignEvaluation, t]);
	const campaignEvaluationCopy = useMemo(() => {
		if (!activeCampaign || !campaignEvaluation) return null;

		const templateLabel = capitalize(activeCampaign.templateId);
		const tierLabel = capitalize(campaignEvaluation.tier);

		return {
			title: t(`campaignEval${templateLabel}${tierLabel}Title`),
			body: t(`campaignEval${templateLabel}${tierLabel}Body`, {
				accuracy: campaignEvaluation.accuracy,
				streak: campaignEvaluation.bestStreak
			})
		};
	}, [activeCampaign, campaignEvaluation, t]);

	const categoryText = useMemo(() => {
		if (!result) return '';
		const localizeCategoryValue = (value: string) => {
			switch (value) {
				case 'Asia':
					return startT('continentAsia');
				case 'Europe':
					return startT('continentEurope');
				case 'Americas':
					return startT('continentAmericas');
				case 'Africa':
					return startT('continentAfrica');
				case 'Oceania':
					return startT('continentOceania');
				default:
					return value;
			}
		};
		if (result.category === 'all') return t('allCategories');
		if (Array.isArray(result.category))
			return result.category.map(localizeCategoryValue).join(', ');
		return localizeCategoryValue(String(result.category));
	}, [result, startT, t]);

	const recommendedTopics = useMemo(
		() =>
			result
				? localizeQuizTopics(
						getRecommendedQuizTopics({
							mode: result.mode,
							countryCode: result.countryCode,
							category: result.category,
							limit: 3
						}),
						quizTopicMessages
					)
				: [],
		[result, quizTopicMessages]
	);
	const currentTopic = useMemo(() => {
		if (!sessionTopicSlug) return null;
		const topic = getQuizTopicBySlug(sessionTopicSlug);
		return topic
			? localizeQuizTopic(topic, quizTopicMessages[sessionTopicSlug])
			: null;
	}, [quizTopicMessages, sessionTopicSlug]);
	const dailyChallengeTopic = useMemo(() => {
		const topic = getDailyChallengeTopic();
		return localizeQuizTopic(topic, quizTopicMessages?.[topic.slug]);
	}, [quizTopicMessages]);
	const isDailyChallengeResult =
		sessionTopicSlug !== null &&
		sessionTopicSlug === dailyChallengeTopic.slug;
	const shareUrl = useMemo(() => {
		const origin =
			typeof window !== 'undefined'
				? window.location.origin
				: 'https://mapquiz.pro';
		const url = new URL(locale === 'en' ? '/' : `/${locale}`, origin);
		url.searchParams.set('code', props.code);
		if (props.campaignSlug) {
			url.searchParams.set('campaign', props.campaignSlug);
		}
		if (props.remixPrompt?.trim()) {
			url.searchParams.set('remix', props.remixPrompt.trim());
		}
		if (props.topicSlug) {
			url.searchParams.set('topic', props.topicSlug);
		}
		return url.toString();
	}, [
		locale,
		props.campaignSlug,
		props.code,
		props.remixPrompt,
		props.topicSlug
	]);
	const shareTitle = isDailyChallengeResult
		? t('shareTitleDaily')
		: t('shareTitleTopic', {
				topic: currentTopic?.title ?? 'MapQuiz.pro'
			});
	const shareText = isDailyChallengeResult
		? challengeState.currentStreak > 0
			? t('shareTextDailyWithStreak', {
					accuracy,
					streak: challengeState.currentStreak
				})
			: t('shareTextDaily', { accuracy })
		: t('shareTextTopic', {
				accuracy,
				topic: currentTopic?.title ?? modeLabel.text
			});

	if (!result) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-default-500">
				{t('invalidCode')}
			</div>
		);
	}

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
			setCopied(true);
			addToast({
				color: 'success',
				title: t('shareCopyTitle'),
				description: t('shareCopyDescription')
			});
			window.setTimeout(() => setCopied(false), 1800);
		} catch {
			addToast({
				color: 'danger',
				title: t('shareCopyFailedTitle'),
				description: t('shareCopyFailedDescription')
			});
		}
	};

	const handleShare = async () => {
		if (!navigator.share) {
			await handleCopy();
			return;
		}

		try {
			await navigator.share({
				title: shareTitle,
				text: shareText,
				url: shareUrl
			});
		} catch {
			// Ignore cancellation and share-sheet failures.
		}
	};

	return (
		<div className="w-full max-w-5xl px-4">
			<div
				className={`overflow-hidden sm:mx-4 sm:grid sm:grid-cols-2 sm:rounded-3xl sm:shadow-2xl ${shadow}`}
			>
				{/* Score panel */}
				<div
					className={`grid content-start items-center justify-center gap-4 rounded-b-3xl bg-linear-to-b px-10 py-8 text-center sm:rounded-3xl ${gradient} ${textColor}`}
				>
					<h1 className="text-xl font-semibold">{t('yourResult')}</h1>

					<div
						className={`mx-auto grid aspect-square w-36 place-content-center rounded-full bg-linear-to-b shadow-inner ${gradient}`}
					>
						<span className="text-5xl font-bold">{accuracy}%</span>
					</div>

					<h2 className="text-2xl font-semibold">
						{messageData.title}
					</h2>
					<p className="text-sm opacity-90">{messageData.message}</p>

					{/* Best streak */}
					{(result.bestStreak ?? 0) >= 3 && (
						<div className="mt-1 flex items-center justify-center gap-1.5">
							<Flame className="size-4 text-orange-400" />
							<span className="text-sm font-medium">
								{t('bestStreakInline', {
									count: result.bestStreak
								})}
							</span>
						</div>
					)}
				</div>

				{/* Summary panel */}
				<div className="flex flex-col gap-5 bg-zinc-50/90 p-6 dark:bg-zinc-950/90">
					<h1 className="text-xl font-bold">{t('summary')}</h1>

					<div className="flex flex-col gap-3">
						<SummaryRow
							icon={<Target className="size-5" />}
							label={t('accuracy')}
							value={`${accuracy}% (${result.score}/${result.total})`}
						/>
						<SummaryRow
							icon={<Clock className="size-5" />}
							label={t('time')}
							value={formattedTime}
						/>
						<SummaryRow
							icon={<Flame className="size-5" />}
							label={t('precision')}
							value={strictnessLabel}
						/>
						<SummaryRow
							icon={modeLabel.icon}
							label={t('mode')}
							value={modeLabel.text}
						/>
						<SummaryRow
							icon={<ChartBarStacked className="size-5" />}
							label={t('categories')}
							value={
								<span className="max-w-[160px] line-clamp-2 text-right text-sm text-default-600 dark:text-default-400">
									{categoryText}
								</span>
							}
						/>
						{(result.bestStreak ?? 0) > 0 && (
							<SummaryRow
								icon={<Zap className="size-5" />}
								label={t('bestStreak')}
								value={`${result.bestStreak}×`}
							/>
						)}
					</div>

					<div className="mt-auto flex gap-2">
						<Button
							radius="full"
							fullWidth
							variant="flat"
							onPress={() => router.push('/')}
						>
							{t('changeMode')}
						</Button>
						<Button
							radius="full"
							fullWidth
							color="success"
							onPress={() => {
								// Re-start same game
								const mode = result.mode ?? 'india';
								const catParam =
									result.category === 'all'
										? 'all'
										: encodeURIComponent(
												(
													result.category as string[]
												).join(',')
											);
								let url = `/game?mode=${mode}&category=${catParam}&strictness=${result.strictness}`;
								if (mode === 'country' && result.countryCode) {
									url += `&country=${result.countryCode}`;
								}
								if (props.topicSlug) {
									url += `&topic=${props.topicSlug}`;
								}
								if (props.campaignSlug) {
									url += `&campaign=${props.campaignSlug}`;
								}
								if (props.remixPrompt?.trim()) {
									url += `&remix=${encodeURIComponent(props.remixPrompt.trim())}`;
								}
								router.push(url);
							}}
						>
							{t('playAgain')}
						</Button>
					</div>
				</div>
			</div>

			<section className="mt-8 rounded-[30px] border border-sky-200/70 bg-[linear-gradient(145deg,rgba(224,242,254,0.65),rgba(255,255,255,0.96))] p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
							{t('shareableResultEyebrow')}
						</p>
						<h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
							{isDailyChallengeResult
								? t('shareScore')
								: t('shareableResultTitle')}
						</h2>
						<p className="mt-2 text-sm leading-6 text-slate-600">
							{shareText}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
								{currentTopic?.title ?? modeLabel.text}
							</span>
							<span className="rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
								{t('accuracyChip', { accuracy })}
							</span>
							{isDailyChallengeResult &&
								challengeState.currentStreak > 0 && (
									<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
										<Flame className="size-3.5" />
										{t('streakChip', {
											days: challengeState.currentStreak
										})}
									</span>
								)}
						</div>
					</div>

					<div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white/88 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
						<div className="flex items-center gap-3">
							<span className="rounded-2xl bg-sky-100 p-3 text-sky-700">
								{isDailyChallengeResult ? (
									<Trophy className="size-5" />
								) : (
									<Share2 className="size-5" />
								)}
							</span>
							<div>
								<p className="text-sm font-bold text-slate-950">
									{shareTitle}
								</p>
								<p className="text-xs text-slate-500">
									{t('shareableResultDescription')}
								</p>
							</div>
						</div>

						<p className="mt-4 line-clamp-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
							{shareText}
						</p>

						<p className="mt-3 truncate text-xs font-medium text-slate-400">
							{shareUrl}
						</p>

						<div className="mt-4 flex gap-2">
							<Button
								radius="full"
								fullWidth
								color="primary"
								onPress={handleShare}
								startContent={<Share2 className="size-4" />}
							>
								{commonT('share')}
							</Button>
							<Button
								radius="full"
								fullWidth
								variant="flat"
								onPress={handleCopy}
								startContent={<Copy className="size-4" />}
							>
								{copied ? t('copied') : commonT('copy')}
							</Button>
						</div>
					</div>
				</div>
			</section>

			{activeCampaign && (
				<section className="mt-8 rounded-[30px] border border-violet-200/80 bg-[linear-gradient(145deg,rgba(245,243,255,0.68),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(76,29,149,0.08)]">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<div className="max-w-2xl">
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-700">
								{t('campaignEyebrow')}
							</p>
							<h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
								{remixDraft?.title ?? activeCampaign.title}
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{remixDraft?.summary ?? activeCampaign.summary}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<span className="rounded-full border border-violet-200 bg-white/88 px-3 py-1 text-xs font-semibold text-violet-800">
									{activeCampaign.templateLabel}
								</span>
								<span className="rounded-full border border-violet-200 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
									{t('campaignDurationChip', {
										count: activeCampaign.durationMinutes
									})}
								</span>
								{props.remixPrompt && (
									<span className="rounded-full border border-violet-200 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
										{t('campaignRemixChip')}
									</span>
								)}
								{campaignRunState && (
									<span className="rounded-full border border-violet-200 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
										{t('campaignMissionProgressChip', {
											current:
												campaignRunState.completedMissions,
											total: campaignRunState.missionCount
										})}
									</span>
								)}
							</div>
							{props.remixPrompt && (
								<p className="mt-4 text-sm font-semibold text-violet-800">
									{t('campaignPromptLine', {
										prompt: props.remixPrompt
									})}
								</p>
							)}
							{campaignEvaluation && (
								<div className="mt-4 rounded-[22px] border border-violet-200/80 bg-white/75 p-4">
									<p className="text-sm font-semibold text-slate-950">
										{campaignEvaluationCopy?.title}
									</p>
									<p className="mt-1 text-sm leading-6 text-slate-600">
										{campaignEvaluationCopy?.body}
									</p>
									<p className="mt-2 text-xs font-semibold text-violet-800">
										{t('campaignPerformanceLine', {
											accuracy:
												campaignEvaluation.accuracy,
											streak: campaignEvaluation.bestStreak
										})}
									</p>
								</div>
							)}
							{activeCampaign.story.epilogue && (
								<div className="mt-4 rounded-[22px] border border-slate-200/80 bg-slate-950/95 p-4 text-white">
									<p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-200/90">
										{t('campaignStoryEndingEyebrow')}
									</p>
									<p className="mt-2 text-sm font-semibold text-white">
										{t('campaignStoryEndingTitle')}
									</p>
									{campaignEndingIntro && (
										<p className="mt-2 text-sm leading-6 text-violet-100">
											{campaignEndingIntro}
										</p>
									)}
									<p className="mt-3 text-sm leading-7 text-slate-200">
										{activeCampaign.story.epilogue}
									</p>
								</div>
							)}
						</div>

						<div className="flex flex-wrap gap-2">
							<Link
								href={`/campaign/${activeCampaign.slug}`}
								className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
							>
								{t('returnToCampaign')}
							</Link>
							<Link
								href={
									remixDraft?.playHref ??
									buildCampaignPlayHref(activeCampaign, {
										remixPrompt: props.remixPrompt ?? null
									})
								}
								className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
							>
								{t('playCampaignAgain')}
							</Link>
						</div>
					</div>
				</section>
			)}

			{recommendedTopics.length > 0 && (
				<section className="mt-8">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
							{t('nextQuizIdeas')}
						</h2>
						<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
							{t('nextQuizIdeasDescription')}
						</p>
					</div>

					<div className="mt-5 grid gap-4 md:grid-cols-3">
						{recommendedTopics.map((topic) => (
							<article
								key={topic.slug}
								className="rounded-[24px] border border-sky-200/70 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/80"
							>
								<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
									{topic.badge}
								</p>
								<h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-slate-50">
									{topic.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
									{topic.description}
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<Link
										href={`/quiz/${topic.slug}`}
										className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950"
									>
										{t('openTopic')}
									</Link>
									<Link
										href={buildGameHref(topic.gameConfig)}
										className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-100"
									>
										{t('playNow')}
									</Link>
								</div>
							</article>
						))}
					</div>
				</section>
			)}

			<div className="mt-8">
				<AdSlot
					slot="result-bottom"
					description="Reserved post-result slot for future ads or premium upgrade prompts, placed after the core feedback loop."
				/>
			</div>

			<div className="mt-8">
				<DailyChallengeCard />
			</div>

			<div className="mt-8">
				<MasteryDashboard
					title={t('masteryTitle')}
					description={t('masteryDesc')}
				/>
			</div>

			<div className="mt-8">
				<MistakesReviewPanel title={t('retryMissed')} />
			</div>
		</div>
	);
};

const SummaryRow = ({
	icon,
	label,
	value
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}) => (
	<div className="flex items-center justify-between gap-3">
		<div className="flex gap-2 items-center text-default-600 dark:text-default-400 shrink-0">
			{icon}
			<span className="text-sm">{label}</span>
		</div>
		{typeof value === 'string' ? (
			<span className="font-semibold text-sm text-right">{value}</span>
		) : (
			value
		)}
	</div>
);

export default Result;
