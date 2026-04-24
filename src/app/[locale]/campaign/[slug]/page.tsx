import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import CampaignCard from '@/lib/components/campaigns/CampaignCard';
import CampaignRemixStudio from '@/lib/components/campaigns/CampaignRemixStudio';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import {
	type AppLocale,
	getAllCampaignSlugs,
	getCampaignBySlug
} from '@/lib/data/campaigns';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
import { buildGameHref, getQuizTopicBySlug } from '@/lib/data/quizTopics';
import { buildAbsoluteUrl, buildPageMetadata, SITE_URL } from '@/lib/seo';

export const generateStaticParams = () =>
	routing.locales.flatMap((locale) =>
		getAllCampaignSlugs().map((slug) => ({ locale, slug }))
	);

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> => {
	const { locale, slug } = await params;
	const campaign = getCampaignBySlug(locale as AppLocale, slug);
	if (!campaign) {
		return { title: 'Campaign | MapQuiz.pro' };
	}

	return buildPageMetadata({
		locale,
		path: `/campaign/${slug}`,
		title: campaign.seoTitle,
		description: campaign.seoDescription,
		openGraphType: 'article'
	});
};

const CampaignPage = async ({
	params
}: {
	params: Promise<{ locale: string; slug: string }>;
}) => {
	const { locale, slug } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({
		locale,
		namespace: 'CampaignPage'
	});
	const messages = (await getMessages()) as {
		QuizTopics?: Record<string, LocalizedQuizTopicMessages>;
	};
	const campaign = getCampaignBySlug(locale as AppLocale, slug);
	if (!campaign) notFound();

	const launchTopic = getQuizTopicBySlug(campaign.launchQuizSlug);
	if (!launchTopic) notFound();

	const launchHref = `${buildGameHref(launchTopic.gameConfig)}&topic=${launchTopic.slug}&campaign=${campaign.slug}`;
	const relatedTopics = campaign.relatedQuizSlugs
		.map((topicSlug) => getQuizTopicBySlug(topicSlug))
		.filter((topic) => topic !== null)
		.map((topic) =>
			localizeQuizTopic(topic, messages.QuizTopics?.[topic.slug])
		);
	const pageJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: campaign.title,
		description: campaign.seoDescription,
		url: buildAbsoluteUrl(locale, `/campaign/${campaign.slug}`),
		isPartOf: {
			'@type': 'WebSite',
			name: 'MapQuiz.pro',
			url: SITE_URL
		}
	};

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<script type="application/ld+json">
				{JSON.stringify(pageJsonLd)}
			</script>

			<nav className="mb-6">
				<Link
					href="/campaigns"
					className="inline-flex items-center rounded-full border border-slate-300 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
				>
					{t('backToCampaigns')}
				</Link>
			</nav>

			<section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<div className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700">
						{campaign.templateLabel}
					</span>
					<h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
						{campaign.title}
					</h1>
					<p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
						{campaign.summary}
					</p>

					<div className="mt-5 flex flex-wrap gap-2">
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							{t('minutesLabel', {
								count: campaign.durationMinutes
							})}
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							{t('missionsLabel', {
								count: campaign.missionCount
							})}
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							{campaign.difficultyLabel}
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							{campaign.audienceLabel}
						</span>
					</div>

					<p className="mt-6 text-sm leading-7 text-slate-700">
						{campaign.premise}
					</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href={launchHref}
							className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							{t('launchCampaign')}
						</Link>
						<Link
							href={`/quiz/${launchTopic.slug}`}
							className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
						>
							{t('openLaunchTopic')}
						</Link>
					</div>
				</div>

				<CampaignCard
					campaign={campaign}
					labels={{
						viewCampaign: t('viewCampaign'),
						playFirstMission: t('playFirstMission'),
						minutesLabel: (minutes) =>
							t('minutesLabel', { count: minutes }),
						missionsLabel: (count) => t('missionsLabel', { count }),
						remixLabel: t('remixExamples')
					}}
					compact
				/>
			</section>

			<section className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
				<div className="xl:col-span-2 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-8">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
						{t('storyEyebrow')}
					</p>
					<div className="mt-4 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
						<div className="rounded-[24px] border border-slate-200 bg-white/88 p-5">
							<h2 className="text-2xl font-bold tracking-tight text-slate-950">
								{t('storyPrologue')}
							</h2>
							<p className="mt-4 text-sm leading-7 text-slate-700">
								{campaign.story.prologue}
							</p>
						</div>
						<div className="rounded-[24px] border border-slate-200 bg-slate-50/88 p-5">
							<h2 className="text-2xl font-bold tracking-tight text-slate-950">
								{t('storyEpilogue')}
							</h2>
							<p className="mt-4 text-sm leading-7 text-slate-700">
								{campaign.story.epilogue}
							</p>
						</div>
					</div>
					<div className="mt-6">
						<h2 className="text-2xl font-bold tracking-tight text-slate-950">
							{t('storyFactions')}
						</h2>
						<div className="mt-4 grid gap-4 md:grid-cols-3">
							{campaign.story.factions.map((faction) => (
								<div
									key={faction.name}
									className="rounded-[22px] border border-slate-200 bg-white/88 p-4"
								>
									<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
										{faction.role}
									</p>
									<h3 className="mt-2 text-lg font-bold text-slate-950">
										{faction.name}
									</h3>
									<p className="mt-3 text-sm leading-6 text-slate-600">
										{faction.summary}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
					<h2 className="text-2xl font-bold tracking-tight text-slate-950">
						{t('missionPlan')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('missionPlanDescription')}
					</p>
					<div className="mt-6 grid gap-4">
						{campaign.missionPreviews.map((mission, index) => (
							<div
								key={mission.id}
								className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4"
							>
								<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
									{t('missionLabel', { count: index + 1 })}
								</p>
								<h3 className="mt-2 text-lg font-bold text-slate-950">
									{mission.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">
									{mission.summary}
								</p>
								<div className="mt-3">
									<Link
										href={`/quiz/${mission.quizSlug}`}
										className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
									>
										{t('openMissionTopic')}
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
						<h2 className="text-2xl font-bold tracking-tight text-slate-950">
							{t('remixExamples')}
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('remixDescription')}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							{campaign.remixPromptExamples.map((idea) => (
								<span
									key={idea}
									className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700"
								>
									{idea}
								</span>
							))}
						</div>
					</div>

					<div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
						<h2 className="text-2xl font-bold tracking-tight text-slate-950">
							{t('relatedQuizTopics')}
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('relatedQuizTopicsDescription')}
						</p>
						<div className="mt-5 grid gap-4">
							{relatedTopics.slice(0, 2).map((topic) => (
								<QuizTopicCard
									key={topic.slug}
									topic={topic}
									compact
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			<div className="mt-10">
				<CampaignRemixStudio
					campaign={campaign}
					labels={{
						eyebrow: t('remixStudioEyebrow'),
						title: t('remixStudioTitle'),
						description: t('remixStudioDescription'),
						promptLabel: t('remixPromptLabel'),
						promptPlaceholder: t('remixPromptPlaceholder'),
						quickIdeas: t('remixQuickIdeas'),
						preview: t('remixPreview'),
						generate: t('generateRemix'),
						generating: t('generatingRemix'),
						playDraft: t('playRemixDraft'),
						useIdea: t('useIdea'),
						fallbackNotice: t('fallbackNotice'),
						liveNotice: t('liveNotice'),
						requestFailed: t('requestFailed')
					}}
				/>
			</div>
		</main>
	);
};

export default CampaignPage;
