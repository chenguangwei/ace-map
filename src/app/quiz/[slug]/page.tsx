import { Skeleton } from '@heroui/skeleton';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TopicPageTracker from '@/lib/components/analytics/TopicPageTracker';
import TrackedTopicLink from '@/lib/components/analytics/TrackedTopicLink';
import Main from '@/lib/components/game/Main';
import AdSlot from '@/lib/components/monetization/AdSlot';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import {
	buildGameHref,
	getQuizTopicBySlug,
	getRelatedQuizTopics,
	quizTopics
} from '@/lib/data/quizTopics';

const SITE_URL = 'https://mapquiz.pro';

export const generateStaticParams = () =>
	quizTopics.map((topic) => ({ slug: topic.slug }));

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
	const { slug } = await params;
	const topic = getQuizTopicBySlug(slug);
	const parentTopic = topic?.parentSlug
		? getQuizTopicBySlug(topic.parentSlug)
		: null;

	if (!topic) {
		return {
			title: 'Quiz Topic Not Found | MapQuiz.pro'
		};
	}

	const keywordSet = new Set([
		topic.primaryKeyword,
		topic.title,
		topic.shortTitle,
		'geography quiz',
		'map quiz',
		...(topic.categoryLabels ?? []),
		...(parentTopic ? [parentTopic.title, parentTopic.primaryKeyword] : [])
	]);

	return {
		title: topic.seoTitle,
		description: topic.seoDescription,
		alternates: {
			canonical: `${SITE_URL}/quiz/${topic.slug}`
		},
		keywords: [...keywordSet],
		openGraph: {
			url: `${SITE_URL}/quiz/${topic.slug}`,
			title: topic.seoTitle,
			description: topic.seoDescription,
			type: 'article'
		},
		twitter: {
			card: 'summary_large_image',
			title: topic.seoTitle,
			description: topic.seoDescription
		}
	};
};

const QuizTopicPage = async ({
	params
}: {
	params: Promise<{ slug: string }>;
}) => {
	const { slug } = await params;
	const topic = getQuizTopicBySlug(slug);
	if (!topic) notFound();

	const parentTopic = topic.parentSlug
		? getQuizTopicBySlug(topic.parentSlug)
		: null;
	const relatedTopics = getRelatedQuizTopics(topic.slug, 3);
	const fullScreenHref = `${buildGameHref(topic.gameConfig)}&topic=${topic.slug}`;
	const pageJsonLd = {
		'@context': 'https://schema.org',
		'@type': topic.kind === 'subtopic' ? 'CollectionPage' : 'WebPage',
		name: topic.title,
		url: `${SITE_URL}/quiz/${topic.slug}`,
		description: topic.seoDescription,
		keywords: [
			topic.primaryKeyword,
			...(topic.categoryLabels ?? []),
			topic.learningFocus
		],
		isPartOf: parentTopic
			? {
					'@type': 'WebPage',
					name: parentTopic.title,
					url: `${SITE_URL}/quiz/${parentTopic.slug}`
				}
			: {
					'@type': 'WebSite',
					name: 'MapQuiz.pro',
					url: SITE_URL
				},
		about: {
			'@type': 'Thing',
			name: topic.learningFocus
		}
	};
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Ace Map',
				item: 'https://mapquiz.pro'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Quiz Library',
				item: 'https://mapquiz.pro/quizzes'
			},
			...(parentTopic
				? [
						{
							'@type': 'ListItem',
							position: 3,
							name: parentTopic.title,
							item: `https://mapquiz.pro/quiz/${parentTopic.slug}`
						},
						{
							'@type': 'ListItem',
							position: 4,
							name: topic.title,
							item: `https://mapquiz.pro/quiz/${topic.slug}`
						}
					]
				: [
						{
							'@type': 'ListItem',
							position: 3,
							name: topic.title,
							item: `https://mapquiz.pro/quiz/${topic.slug}`
						}
					])
		]
	};
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: topic.faq.map((item) => ({
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
					Home
				</Link>
				<span>/</span>
				<Link
					href="/quizzes"
					className="transition hover:text-slate-900"
				>
					Quiz Library
				</Link>
				{parentTopic && (
					<>
						<span>/</span>
						<Link
							href={`/quiz/${parentTopic.slug}`}
							className="transition hover:text-slate-900"
						>
							{parentTopic.shortTitle}
						</Link>
					</>
				)}
				<span>/</span>
				<span className="font-semibold text-slate-900">
					{topic.title}
				</span>
			</nav>

			<section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
				<div className="max-w-3xl">
					<div className="flex flex-wrap gap-2">
						<span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800">
							{topic.badge}
						</span>
						<span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600">
							{topic.kind === 'subtopic'
								? 'Focused Subtopic'
								: 'Country Root Topic'}
						</span>
					</div>
					<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
						{topic.title}
					</h1>
					<p className="mt-5 text-lg leading-8 text-slate-600">
						{topic.description}
					</p>
					{topic.categoryLabels && topic.categoryLabels.length > 0 && (
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
							Play on this page
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
							Open full-screen mode
						</TrackedTopicLink>
					</div>

					<div className="mt-8 grid gap-4 sm:grid-cols-3">
						{[
							[`${topic.questionCount}`, 'Locations in pool'],
							[topic.searchIntent, 'Search intent'],
							[topic.learningFocus, 'Learning focus']
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
						How this page works
					</p>
					<ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
						{topic.benefits.map((benefit) => (
							<li key={benefit} className="flex gap-3">
								<span className="mt-2 size-2 rounded-full bg-sky-500" />
								<span>{benefit}</span>
							</li>
						))}
					</ul>
					{parentTopic && (
						<div className="mt-6 rounded-[22px] border border-slate-200/80 bg-white/80 p-4">
							<p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
								Part Of
							</p>
							<p className="mt-2 text-base font-semibold text-slate-900">
								{parentTopic.title}
							</p>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								This page narrows the broader country quiz into
								a more specific practice set for the same map
								engine.
							</p>
							<Link
								href={`/quiz/${parentTopic.slug}`}
								className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
							>
								Open parent topic
							</Link>
						</div>
					)}

					<AdSlot
						slot="topic-sidebar"
						className="mt-6"
						description="Edge placement for topic-level sponsorships or future display ads without interrupting the quiz loop."
					/>
				</aside>
			</section>

			<section id="play" className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						Play {topic.shortTitle} now
					</h2>
					<p className="mt-3 text-base leading-7 text-slate-600">
						This topic page embeds the same map quiz engine,
						preloaded with the right mode and category mix for this
						search intent.
						{topic.categoryLabels && topic.categoryLabels.length > 0
							? ` This version is focused on ${topic.categoryLabels.join(', ').toLowerCase()}.`
							: ''}
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
						Why this quiz matches the search
					</h2>
					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						{topic.highlights.map((highlight) => (
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
							FAQ
						</h3>
						<div className="mt-5 space-y-4">
							{topic.faq.map((item) => (
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
							Keep exploring the quiz network
						</h3>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
							This page is one node in a broader geography quiz
							network. Use the related pages to cover adjacent
							search intent and build longer session depth.
						</p>
						<div className="mt-5 flex flex-wrap gap-3">
							<Link
								href="/quizzes"
								className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
							>
								Open quiz library
							</Link>
							<Link
								href={fullScreenHref}
								className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
							>
								Play full-screen
							</Link>
						</div>
					</div>

					<div className="mt-10">
						<DailyChallengeCard />
					</div>
				</div>

				<aside>
					<h2 className="text-2xl font-bold tracking-tight text-slate-950">
						Related quiz topics
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
				<div className="grid gap-6 lg:grid-cols-2">
					<RecentPracticePanel
						currentSlug={topic.slug}
						description="Recent practice gives returning users a lightweight habit loop without requiring accounts."
					/>
					<MistakesReviewPanel
						topicSlug={topic.slug}
						title={`Review missed ${topic.shortTitle} locations`}
						description="Wrong answers in this topic are saved locally so you can come back for a tighter replay loop."
					/>
				</div>
			</div>
		</main>
	);
};

export default QuizTopicPage;
