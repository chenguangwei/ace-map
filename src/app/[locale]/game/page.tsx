import 'maplibre-gl/dist/maplibre-gl.css';
import { Skeleton } from '@heroui/skeleton';
import type { Metadata } from 'next';
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from 'next-intl/server';
import React from 'react';
import { Link } from '@/i18n/navigation';
import Main from '@/lib/components/game/Main';
import AdSlot from '@/lib/components/monetization/AdSlot';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import {
	type AppLocale,
	deriveCampaignRemixDraft,
	getCampaignBySlug
} from '@/lib/data/campaigns';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
import {
	getQuizTopicBySlug,
	getRecommendedQuizTopics
} from '@/lib/data/quizTopics';
import { buildPageMetadata } from '@/lib/seo';
import type { GameMode } from '@/lib/utils/places';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'GamePage' });
	const title = `${t('nextGeographyQuizIdeas')} | MapQuiz.pro`;
	const description = t('sessionFollowupDescription');

	return buildPageMetadata({
		locale,
		path: '/game',
		title,
		description
	});
};

const page = async ({
	searchParams,
	params
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: 'GamePage' });
	const messages = (await getMessages()) as { QuizTopics?: unknown };
	const quizTopicMessages = (messages.QuizTopics ?? {}) as Partial<
		Record<string, LocalizedQuizTopicMessages | undefined>
	>;
	const resolved = await searchParams;
	const topicParam =
		typeof resolved.topic === 'string' ? resolved.topic : undefined;
	const campaignParam =
		typeof resolved.campaign === 'string' ? resolved.campaign : undefined;
	const remixPrompt =
		typeof resolved.remix === 'string' ? resolved.remix : undefined;
	const sourceTopic = topicParam ? getQuizTopicBySlug(topicParam) : null;
	const currentCampaign = campaignParam
		? getCampaignBySlug(locale as AppLocale, campaignParam)
		: null;
	const remixDraft =
		currentCampaign && remixPrompt
			? deriveCampaignRemixDraft(currentCampaign, remixPrompt)
			: null;
	const activeMission =
		currentCampaign?.missionPreviews.find(
			(mission) => mission.quizSlug === sourceTopic?.slug
		) ??
		currentCampaign?.missionPreviews[0] ??
		null;
	const localizedSourceTopic = sourceTopic
		? localizeQuizTopic(sourceTopic, quizTopicMessages[sourceTopic.slug])
		: null;
	const modeParam =
		typeof resolved.mode === 'string' &&
		['india', 'world', 'country'].includes(resolved.mode)
			? (resolved.mode as GameMode)
			: undefined;
	const recommendedTopics = sourceTopic
		? getRecommendedQuizTopics({
				currentSlug: sourceTopic.slug,
				limit: 3
			})
		: getRecommendedQuizTopics({
				mode: modeParam,
				countryCode:
					typeof resolved.country === 'string'
						? resolved.country
						: undefined,
				category:
					typeof resolved.category === 'string'
						? resolved.category === 'all'
							? 'all'
							: resolved.category.split(',')
						: undefined,
				limit: 3
			});

	return (
		<main className="bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.86),_rgba(241,245,249,0.94))]">
			<section className="flex h-[calc(100dvh-var(--navbar-height))] flex-col items-center justify-center">
				<React.Suspense
					fallback={
						<>
							<Skeleton className="grow size-full" />
							<Skeleton className="w-full h-24" />
						</>
					}
				>
					<Main
						topicSlug={topicParam}
						campaignSlug={currentCampaign?.slug}
						remixPrompt={remixPrompt}
					/>
				</React.Suspense>
			</section>

			<section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
				{currentCampaign && (
					<div className="mb-8 rounded-[34px] border border-violet-200/80 bg-[linear-gradient(145deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_50px_rgba(76,29,149,0.08)] backdrop-blur-sm sm:p-8">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<div className="max-w-3xl">
								<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-700">
									{t('campaignEyebrow')}
								</p>
								<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
									{remixDraft?.title ?? currentCampaign.title}
								</h2>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									{remixDraft?.summary ??
										currentCampaign.summary}
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<span className="rounded-full border border-violet-200 bg-white/85 px-3 py-1 text-xs font-semibold text-violet-800">
										{currentCampaign.templateLabel}
									</span>
									<span className="rounded-full border border-violet-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700">
										{t('campaignDuration', {
											count: currentCampaign.durationMinutes
										})}
									</span>
									{activeMission && (
										<span className="rounded-full border border-violet-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700">
											{t('campaignMissionChip', {
												mission: activeMission.title
											})}
										</span>
									)}
								</div>
								{remixPrompt && (
									<p className="mt-4 text-sm font-semibold text-violet-800">
										{t('campaignRemixPrompt', {
											prompt: remixPrompt
										})}
									</p>
								)}
							</div>
							<div className="flex flex-wrap gap-3">
								<Link
									href={`/campaign/${currentCampaign.slug}`}
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('returnToCampaign')}
								</Link>
								{sourceTopic && (
									<Link
										href={`/quiz/${sourceTopic.slug}`}
										className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
									>
										{t('openSourceTopic')}
									</Link>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="rounded-[34px] border border-sky-200/70 bg-white/84 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-2xl">
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
								{t('continueSessionEyebrow')}
							</p>
							<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
								{localizedSourceTopic
									? t('moreLike', {
											topic: localizedSourceTopic.title
										})
									: t('nextGeographyQuizIdeas')}
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{t('sessionFollowupDescription')}
							</p>
						</div>
						<Link
							href="/quizzes"
							className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
						>
							{t('browseAllQuizPages')}
						</Link>
					</div>

					<div className="mt-8 grid gap-5 md:grid-cols-3">
						{recommendedTopics.map((topic) => (
							<QuizTopicCard
								key={topic.slug}
								topic={topic}
								compact
							/>
						))}
					</div>
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
					<div className="space-y-6">
						<RecentPracticePanel
							currentSlug={sourceTopic?.slug}
							title={t('resumePracticeTitle')}
							description={t('resumePracticeDescription')}
						/>
						<MistakesReviewPanel
							topicSlug={sourceTopic?.slug}
							title={
								localizedSourceTopic
									? t('mistakesInTopic', {
											topic: localizedSourceTopic.shortTitle
										})
									: undefined
							}
						/>
					</div>
					<AdSlot
						slot="game-exit-rail"
						description="Reserved placement for result-safe ads or premium upsells after the main game interaction."
					/>
				</div>
			</section>
		</main>
	);
};

export default page;
