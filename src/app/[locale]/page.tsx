import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BackgroundBeams } from '@/lib/components/BgBeams';
import CampaignCard from '@/lib/components/campaigns/CampaignCard';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import SiteFaqGroupList from '@/lib/components/content/SiteFaqGroupList';
import { Show } from '@/lib/components/Flow';
import AdSlot from '@/lib/components/monetization/AdSlot';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MasteryDashboard from '@/lib/components/quizzes/MasteryDashboard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicSection from '@/lib/components/quizzes/QuizTopicSection';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import Result from '@/lib/components/Result';
import Start from '@/lib/components/Start';
import { getFeaturedCampaigns } from '@/lib/data/campaigns';
import {
	type AppLocale,
	getFeaturedBlogPosts,
	getSiteFaqGroups
} from '@/lib/data/content';
import { FEATURED_COUNTRIES } from '@/lib/data/countries';
import {
	buildGameHref,
	getCountrySubtopics,
	getQuizTopicsByKind,
	getQuizTopicsBySection,
	quizTopics
} from '@/lib/data/quizTopics';
import { buildPageMetadata } from '@/lib/seo';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'HomePage' });

	return buildPageMetadata({
		locale,
		path: '/',
		title: `${t('headline')} | MapQuiz.pro`,
		description: t('subheadline')
	});
};

const Page = async ({
	searchParams,
	params
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('HomePage');
	const tBlog = await getTranslations('BlogPage');
	const featuredCountryCodes = [
		'jp',
		'de',
		'ca',
		'au',
		'fr',
		'gb',
		'it',
		'es'
	];
	const resolvedSearchParams = await searchParams;
	const resultCode = resolvedSearchParams.code;
	const resultCampaign =
		typeof resolvedSearchParams.campaign === 'string'
			? resolvedSearchParams.campaign
			: undefined;
	const resultRemix =
		typeof resolvedSearchParams.remix === 'string'
			? resolvedSearchParams.remix
			: undefined;
	const resultTopicSlug =
		typeof resolvedSearchParams.topic === 'string'
			? resolvedSearchParams.topic
			: undefined;
	const popularTopics = getQuizTopicsBySection('popular');
	const continentTopics = getQuizTopicsBySection('continents');
	const featuredPosts = getFeaturedBlogPosts(locale as AppLocale, 3);
	const faqGroups = getSiteFaqGroups(locale as AppLocale).slice(0, 2);
	const featuredCampaigns = getFeaturedCampaigns(locale as AppLocale, 3);
	const readingTimeLabel = (minutes: number) =>
		tBlog('readingTime', { minutes });
	const countryTopics = getQuizTopicsByKind('root')
		.filter((topic) => topic.section === 'countries')
		.slice(0, 6);
	const countrySubtopics = getCountrySubtopics();
	const focusedDrillTopics = featuredCountryCodes
		.map((countryCode) =>
			countrySubtopics.find((topic) => topic.countryCode === countryCode)
		)
		.filter((topic) => topic !== undefined);

	return (
		<div className="relative min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
			<BackgroundBeams />
			<Show condition={resultCode === undefined}>
				<main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
					<section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
						<div className="max-w-2xl">
							<span className="rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800 shadow-sm backdrop-blur-sm">
								{t('badge')}
							</span>
							<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
								{t('headline')}
							</h1>
							<p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
								{t('subheadline')}
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									href="/quizzes"
									className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
								>
									{t('browseLibrary')}
								</Link>
								<Link
									href={buildGameHref(
										popularTopics[0].gameConfig
									)}
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('playNow')}
								</Link>
							</div>
							<div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
								<span className="font-semibold text-slate-500">
									{t('quickLinksLabel')}
								</span>
								<Link
									href="/blog"
									className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100"
								>
									{t('blogShortcut')}
								</Link>
								<Link
									href="/faq"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('faqShortcut')}
								</Link>
								<Link
									href="/campaigns"
									className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
								>
									{t('campaignShortcut')}
								</Link>
							</div>
							<div className="mt-8 grid gap-4 sm:grid-cols-3">
								{[
									[
										String(quizTopics.length),
										t('quizTopicPages')
									],
									[
										`${FEATURED_COUNTRIES.length}+`,
										t('countryDataPacks')
									],
									[
										String(countrySubtopics.length),
										t('focusedDrillPages')
									]
								].map(([value, label]) => (
									<div
										key={label}
										className="rounded-[24px] border border-sky-200/70 bg-white/82 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
									>
										<p className="text-2xl font-black text-slate-950">
											{value}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{label}
										</p>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-center lg:justify-end">
							<Start />
						</div>
					</section>

					<QuizTopicSection
						title={t('startWithBiggest')}
						description={t('startWithBiggestDesc')}
						topics={popularTopics}
					/>

					<DailyChallengeCard />

					<section>
						<div className="max-w-3xl">
							<h2 className="text-3xl font-bold tracking-tight text-slate-950">
								{t('featuredCampaigns')}
							</h2>
							<p className="mt-3 text-sm leading-6 text-slate-600">
								{t('featuredCampaignsDesc')}
							</p>
							<div className="mt-4">
								<Link
									href="/campaigns"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('browseCampaigns')}
								</Link>
							</div>
						</div>
						<div className="mt-6 grid gap-5 xl:grid-cols-3">
							{featuredCampaigns.map((campaign) => (
								<CampaignCard
									key={campaign.slug}
									campaign={campaign}
									labels={{
										viewCampaign: t('viewCampaign'),
										playFirstMission: t('playCampaign'),
										minutesLabel: (minutes) =>
											t('campaignMinutesLabel', {
												count: minutes
											}),
										missionsLabel: (count) =>
											t('campaignMissionsLabel', {
												count
											}),
										remixLabel: t('campaignRemixIdeas')
									}}
									compact
								/>
							))}
						</div>
					</section>

					<MasteryDashboard />

					<QuizTopicSection
						title={t('chooseContinents')}
						description={t('chooseContinentsDesc')}
						topics={continentTopics}
						compact
					/>

					<QuizTopicSection
						title={t('goDeeper')}
						description={t('goDeeperDesc')}
						topics={countryTopics}
						compact
					/>

					<QuizTopicSection
						title={t('jumpStraight')}
						description={t('jumpStraightDesc')}
						topics={focusedDrillTopics}
						compact
					/>

					<section>
						<div className="max-w-3xl">
							<h2 className="text-3xl font-bold tracking-tight text-slate-950">
								{t('popularGuides')}
							</h2>
							<p className="mt-3 text-sm leading-6 text-slate-600">
								{t('popularGuidesDesc')}
							</p>
							<div className="mt-4">
								<Link
									href="/blog"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('readGuides')}
								</Link>
							</div>
						</div>
						<div className="mt-6 grid gap-5 md:grid-cols-3">
							{featuredPosts.map((post) => (
								<BlogPostCard
									key={post.slug}
									post={post}
									ctaLabel={tBlog('articleCta')}
									readingTimeLabel={readingTimeLabel}
									compact
								/>
							))}
						</div>
					</section>

					<section>
						<div className="max-w-3xl">
							<h2 className="text-3xl font-bold tracking-tight text-slate-950">
								{t('commonQuestions')}
							</h2>
							<p className="mt-3 text-sm leading-6 text-slate-600">
								{t('commonQuestionsDesc')}
							</p>
							<div className="mt-4">
								<Link
									href="/faq"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('openFaqPage')}
								</Link>
							</div>
						</div>
						<div className="mt-6">
							<SiteFaqGroupList
								groups={faqGroups}
								previewCount={2}
							/>
						</div>
					</section>

					<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
						<div className="space-y-6">
							<RecentPracticePanel />
							<MistakesReviewPanel />
						</div>
						<AdSlot
							slot="home-network-rail"
							description="Use this edge placement for future AdSense, affiliate experiments, or house promos without interrupting gameplay."
						/>
					</div>
				</main>
			</Show>
			<Show condition={typeof resultCode === 'string'}>
				<div className="relative flex min-h-[calc(100dvh-var(--navbar-height))] items-center justify-center py-8">
					<Result
						code={resultCode as string}
						campaignSlug={resultCampaign}
						remixPrompt={resultRemix}
						topicSlug={resultTopicSlug}
					/>
				</div>
			</Show>
		</div>
	);
};

export default Page;
