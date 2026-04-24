import { Skeleton } from '@heroui/skeleton';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from 'next-intl/server';
import { Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import TopicPageTracker from '@/lib/components/analytics/TopicPageTracker';
import TrackedTopicLink from '@/lib/components/analytics/TrackedTopicLink';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import Main from '@/lib/components/game/Main';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import { type AppLocale, getRelatedBlogPostsForQuiz } from '@/lib/data/content';
import {
	getLocalizedQuizTopicMessageMap,
	type LocalizedQuizTopicMessages,
	localizeQuizTopic,
	localizeQuizTopics
} from '@/lib/data/quizTopicI18n';
import {
	buildGameHref,
	getQuizTopicBySlug,
	getRelatedQuizTopics,
	quizTopics
} from '@/lib/data/quizTopics';
import { buildAbsoluteUrl, buildPageMetadata, SITE_URL } from '@/lib/seo';

export const generateStaticParams = () =>
	routing.locales.flatMap((locale) =>
		quizTopics.map((topic) => ({ locale, slug: topic.slug }))
	);

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> => {
	const { slug, locale } = await params;
	const topic = getQuizTopicBySlug(slug);
	const parentTopic = topic?.parentSlug
		? getQuizTopicBySlug(topic.parentSlug)
		: null;

	if (!topic) {
		const tPage = await getTranslations({
			locale,
			namespace: 'QuizTopicPage'
		});
		return {
			title: `${tPage('notFoundTitle')} | MapQuiz.pro`
		};
	}

	const localizedTopic = localizeQuizTopic(
		topic,
		getLocalizedQuizTopicMessageMap(locale)[slug] as
			| LocalizedQuizTopicMessages
			| undefined
	);

	const keywordSet = new Set([
		topic.primaryKeyword,
		topic.title,
		topic.shortTitle,
		'geography quiz',
		'map quiz',
		...(topic.categoryLabels ?? []),
		...(parentTopic ? [parentTopic.title, parentTopic.primaryKeyword] : [])
	]);

	return buildPageMetadata({
		locale,
		path: `/quiz/${topic.slug}`,
		title: localizedTopic.seoTitle,
		description: localizedTopic.seoDescription,
		keywords: [...keywordSet],
		openGraphType: 'article'
	});
};

const QuizTopicPage = async ({
	params
}: {
	params: Promise<{ slug: string; locale: string }>;
}) => {
	const { slug, locale } = await params;
	setRequestLocale(locale);
	const topic = getQuizTopicBySlug(slug);
	if (!topic) notFound();

	const tPage = await getTranslations({
		locale,
		namespace: 'QuizTopicPage'
	});
	const messages = (await getMessages()) as { QuizTopics?: unknown };
	const quizTopicMessages = (messages.QuizTopics ?? {}) as Partial<
		Record<string, LocalizedQuizTopicMessages | undefined>
	>;
	const localizedTopic = localizeQuizTopic(
		topic,
		quizTopicMessages[topic.slug]
	);
	const parentTopic = topic.parentSlug
		? getQuizTopicBySlug(topic.parentSlug)
		: null;
	const localizedParentTopic = parentTopic
		? localizeQuizTopic(parentTopic, quizTopicMessages[parentTopic.slug])
		: null;
	const relatedGuides = getRelatedBlogPostsForQuiz(
		locale as AppLocale,
		topic.slug,
		3
	);
	const relatedTopics = localizeQuizTopics(
		getRelatedQuizTopics(topic.slug, 3),
		quizTopicMessages
	);
	const tBlog = await getTranslations({ locale, namespace: 'BlogPage' });
	const readingTimeLabel = (minutes: number) =>
		tBlog('readingTime', { minutes });
	const fullScreenHref = `${buildGameHref(topic.gameConfig)}&topic=${topic.slug}`;
	const pageJsonLd = {
		'@context': 'https://schema.org',
		'@type': topic.kind === 'subtopic' ? 'CollectionPage' : 'WebPage',
		name: localizedTopic.title,
		url: buildAbsoluteUrl(locale, `/quiz/${topic.slug}`),
		description: localizedTopic.seoDescription,
		keywords: [
			topic.primaryKeyword,
			...(topic.categoryLabels ?? []),
			localizedTopic.learningFocus
		],
		isPartOf: localizedParentTopic
			? {
					'@type': 'WebPage',
					name: localizedParentTopic.title,
					url: buildAbsoluteUrl(
						locale,
						`/quiz/${localizedParentTopic.slug}`
					)
				}
			: {
					'@type': 'WebSite',
					name: 'MapQuiz.pro',
					url: SITE_URL
				},
		about: {
			'@type': 'Thing',
			name: localizedTopic.learningFocus
		}
	};
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: tPage('home'),
				item: buildAbsoluteUrl(locale, '/')
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: tPage('quizLibrary'),
				item: buildAbsoluteUrl(locale, '/quizzes')
			},
			...(localizedParentTopic
				? [
						{
							'@type': 'ListItem',
							position: 3,
							name: localizedParentTopic.title,
							item: buildAbsoluteUrl(
								locale,
								`/quiz/${localizedParentTopic.slug}`
							)
						},
						{
							'@type': 'ListItem',
							position: 4,
							name: localizedTopic.title,
							item: buildAbsoluteUrl(
								locale,
								`/quiz/${topic.slug}`
							)
						}
					]
				: [
						{
							'@type': 'ListItem',
							position: 3,
							name: localizedTopic.title,
							item: buildAbsoluteUrl(
								locale,
								`/quiz/${topic.slug}`
							)
						}
					])
		]
	};
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: localizedTopic.faq.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	};

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<TopicPageTracker
				topicSlug={topic.slug}
				topicKind={topic.kind}
				countryCode={topic.countryCode}
			/>
			<script type="application/ld+json">
				{JSON.stringify(pageJsonLd)}
			</script>
			<script type="application/ld+json">
				{JSON.stringify(breadcrumbJsonLd)}
			</script>
			<script type="application/ld+json">
				{JSON.stringify(faqJsonLd)}
			</script>

			<nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
				<Link href="/" className="transition hover:text-slate-900">
					{tPage('home')}
				</Link>
				<span>/</span>
				<Link
					href="/quizzes"
					className="transition hover:text-slate-900"
				>
					{tPage('quizLibrary')}
				</Link>
				{localizedParentTopic && (
					<>
						<span>/</span>
						<Link
							href={`/quiz/${localizedParentTopic.slug}`}
							className="transition hover:text-slate-900"
						>
							{localizedParentTopic.shortTitle}
						</Link>
					</>
				)}
				<span>/</span>
				<span className="font-semibold text-slate-900">
					{localizedTopic.title}
				</span>
			</nav>

			<section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
				<div className="max-w-3xl">
					<div className="flex flex-wrap gap-2">
						<span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800">
							{localizedTopic.badge}
						</span>
						<span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600">
							{topic.kind === 'subtopic'
								? tPage('focusedPractice')
								: tPage('fullCountryQuiz')}
						</span>
					</div>
					<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
						{localizedTopic.title}
					</h1>
					<p className="mt-5 text-lg leading-8 text-slate-600">
						{localizedTopic.description}
					</p>
					{topic.categoryLabels &&
						topic.categoryLabels.length > 0 && (
							<div className="mt-5 flex flex-wrap gap-2">
								{topic.categoryLabels.map((label) => (
									<span
										key={label}
										className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"
									>
										{label}
									</span>
								))}
							</div>
						)}

					<div className="mt-8 flex flex-wrap gap-3">
						<TrackedTopicLink
							href="#play"
							topicSlug={topic.slug}
							topicKind={topic.kind}
							countryCode={topic.countryCode}
							source="topic-page-hero"
							target="jump-to-play"
							className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							{tPage('playOnThisPage')}
						</TrackedTopicLink>
						<TrackedTopicLink
							href={fullScreenHref}
							topicSlug={topic.slug}
							topicKind={topic.kind}
							countryCode={topic.countryCode}
							source="topic-page-hero"
							target="open-full-screen"
							className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
						>
							{tPage('openFullScreenMode')}
						</TrackedTopicLink>
					</div>

					<div className="mt-8 grid gap-4 sm:grid-cols-2">
						{[
							[
								`${topic.questionCount}`,
								tPage('locationsToPractice')
							],
							[
								localizedTopic.learningFocus,
								tPage('whatYouWillLearn')
							]
						].map(([value, label]) => (
							<div
								key={label}
								className="rounded-[24px] border border-sky-200/70 bg-white/88 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
							>
								<p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
									{label}
								</p>
								<p className="mt-2 text-base font-semibold leading-6 text-slate-900">
									{value}
								</p>
							</div>
						))}
					</div>
				</div>

				<aside className="rounded-[30px] border border-sky-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.95))] p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
						{tPage('howThisPageWorks')}
					</p>
					<ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
						{localizedTopic.benefits.map((benefit) => (
							<li key={benefit} className="flex gap-3">
								<span className="mt-2 size-2 rounded-full bg-sky-500" />
								<span>{benefit}</span>
							</li>
						))}
					</ul>
					{localizedParentTopic && (
						<div className="mt-6 rounded-[22px] border border-slate-200/80 bg-white/80 p-4">
							<p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
								{tPage('partOf')}
							</p>
							<p className="mt-2 text-base font-semibold text-slate-900">
								{localizedParentTopic.title}
							</p>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{tPage('partOfDescription')}
							</p>
							<Link
								href={`/quiz/${localizedParentTopic.slug}`}
								className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
							>
								{tPage('openParentTopic')}
							</Link>
						</div>
					)}
				</aside>
			</section>

			<section id="play" className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{tPage('playNowTitle', {
							title: localizedTopic.shortTitle
						})}
					</h2>
					<p className="mt-3 text-base leading-7 text-slate-600">
						{topic.categoryLabels && topic.categoryLabels.length > 0
							? tPage('playDescriptionWithCategories', {
									categories: topic.categoryLabels.join(', ')
								})
							: tPage('playDescription')}
					</p>
				</div>

				<div className="mt-8 h-[760px] overflow-hidden rounded-[34px] border border-sky-200/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
					<Suspense
						fallback={
							<div className="flex size-full flex-col">
								<Skeleton className="grow size-full" />
								<Skeleton className="h-24 w-full" />
							</div>
						}
					>
						<Main
							initialConfig={topic.gameConfig}
							topicSlug={topic.slug}
						/>
					</Suspense>
				</div>
			</section>

			<section className="mt-16 grid gap-8 lg:grid-cols-[1fr_360px]">
				<div>
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{tPage('highlightsTitle')}
					</h2>
					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						{localizedTopic.highlights.map((highlight) => (
							<div
								key={highlight}
								className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
							>
								<p className="text-sm font-semibold text-slate-700">
									{highlight}
								</p>
							</div>
						))}
					</div>

					<div className="mt-10">
						<h3 className="text-2xl font-bold tracking-tight text-slate-950">
							{tPage('faqTitle')}
						</h3>
						<div className="mt-5 space-y-4">
							{localizedTopic.faq.map((item) => (
								<details
									key={item.question}
									className="rounded-[24px] border border-slate-200 bg-white p-5"
								>
									<summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
										{item.question}
									</summary>
									<p className="mt-3 text-sm leading-6 text-slate-600">
										{item.answer}
									</p>
								</details>
							))}
						</div>
					</div>

					<div className="mt-10 rounded-[28px] border border-sky-200/70 bg-sky-50/80 p-6">
						<h3 className="text-2xl font-bold tracking-tight text-slate-950">
							{tPage('keepExploring')}
						</h3>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
							{tPage('keepExploringDescription')}
						</p>
						<div className="mt-5 flex flex-wrap gap-3">
							<Link
								href="/quizzes"
								className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
							>
								{tPage('openQuizLibrary')}
							</Link>
							<Link
								href={fullScreenHref}
								className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
							>
								{tPage('playFullScreen')}
							</Link>
						</div>
					</div>

					{relatedGuides.length > 0 && (
						<div className="mt-10">
							<h3 className="text-2xl font-bold tracking-tight text-slate-950">
								{tPage('relatedGuidesTitle')}
							</h3>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
								{tPage('relatedGuidesDescription')}
							</p>
							<div className="mt-5 grid gap-4 sm:grid-cols-2">
								{relatedGuides.map((guide) => (
									<BlogPostCard
										key={guide.slug}
										post={guide}
										ctaLabel={tBlog('articleCta')}
										readingTimeLabel={readingTimeLabel}
										compact
									/>
								))}
							</div>
							<div className="mt-5">
								<Link
									href="/blog"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{tPage('browseGuideLibrary')}
								</Link>
							</div>
						</div>
					)}

					<div className="mt-10">
						<DailyChallengeCard />
					</div>
				</div>

				<aside>
					<h2 className="text-2xl font-bold tracking-tight text-slate-950">
						{tPage('relatedQuizTopics')}
					</h2>
					<div className="mt-5 space-y-4">
						{relatedTopics.map((relatedTopic) => (
							<QuizTopicCard
								key={relatedTopic.slug}
								topic={relatedTopic}
								compact
							/>
						))}
					</div>
				</aside>
			</section>

			<div className="mt-16">
				<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					<RecentPracticePanel currentSlug={topic.slug} />
					<MistakesReviewPanel
						topicSlug={topic.slug}
						title={`Review missed ${topic.shortTitle} locations`}
					/>
				</div>
			</div>
		</main>
	);
};

export default QuizTopicPage;
