import type { Metadata } from 'next';
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import SiteFaqGroupList from '@/lib/components/content/SiteFaqGroupList';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MasteryDashboard from '@/lib/components/quizzes/MasteryDashboard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicSection from '@/lib/components/quizzes/QuizTopicSection';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import {
	type AppLocale,
	getBlogPostBySlug,
	getFeaturedBlogPosts,
	getLearningPaths,
	getSiteFaqGroups
} from '@/lib/data/content';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
import {
	getCountrySubtopics,
	getQuizTopicBySlug,
	getQuizTopicsByKind,
	getQuizTopicsBySection,
	QUIZ_SECTIONS
} from '@/lib/data/quizTopics';
import { buildPageMetadata } from '@/lib/seo';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'QuizzesPage' });
	const title = `${t('badge')} | MapQuiz.pro`;
	const description = t('subheadline');

	return buildPageMetadata({
		locale,
		path: '/quizzes',
		title,
		description
	});
};

const QuizzesPage = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('QuizzesPage');
	const tBlog = await getTranslations('BlogPage');
	const tSections = await getTranslations('QuizSections');
	const messages = (await getMessages()) as { QuizTopics?: unknown };
	const quizTopicMessages = (messages.QuizTopics ?? {}) as Partial<
		Record<string, LocalizedQuizTopicMessages | undefined>
	>;
	const featuredCountryCodes = [
		'jp',
		'de',
		'ca',
		'fr',
		'gb',
		'it',
		'es',
		'br',
		'kr',
		'ru',
		'mx',
		'id'
	];
	const rootCountryTopics = getQuizTopicsByKind('root').filter(
		(topic) => topic.section === 'countries'
	);
	const learningPaths = getLearningPaths(locale as AppLocale);
	const featuredPosts = getFeaturedBlogPosts(locale as AppLocale, 3);
	const faqGroups = getSiteFaqGroups(locale as AppLocale).slice(0, 2);
	const readingTimeLabel = (minutes: number) =>
		tBlog('readingTime', { minutes });
	const focusedDrillTopics = getCountrySubtopics();
	const featuredCountryDrills = featuredCountryCodes
		.map((countryCode) =>
			focusedDrillTopics.find(
				(topic) => topic.countryCode === countryCode
			)
		)
		.filter((topic) => topic !== undefined);

	return (
		<main className="mx-auto min-h-[calc(100dvh-var(--navbar-height))] w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<section className="max-w-3xl">
				<span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800">
					{t('badge')}
				</span>
				<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
					{t('headline')}
				</h1>
				<p className="mt-5 text-lg leading-8 text-slate-600">
					{t('subheadline')}
				</p>
			</section>

			<div className="mt-12">
				<DailyChallengeCard />
			</div>

			<div className="mt-14 space-y-16">
				<MasteryDashboard
					title={t('progressTitle')}
					description={t('progressDescription')}
				/>

				{QUIZ_SECTIONS.filter(
					(section) => section.id !== 'countries'
				).map((section) => (
					<QuizTopicSection
						key={section.id}
						title={tSections(section.id)}
						description={tSections(`${section.id}Desc`)}
						topics={getQuizTopicsBySection(section.id)}
					/>
				))}

				<QuizTopicSection
					title={t('countryMapQuizzes')}
					description={t('countryMapQuizzesDesc')}
					topics={rootCountryTopics}
				/>

				<QuizTopicSection
					title={t('featuredCountryDeepDives')}
					description={t('featuredCountryDeepDivesDesc')}
					topics={featuredCountryDrills}
					compact
				/>

				<QuizTopicSection
					title={t('focusedRegionalPractice')}
					description={t('focusedRegionalPracticeDesc')}
					topics={focusedDrillTopics}
					compact
				/>

				<section>
					<div className="max-w-3xl">
						<h2 className="text-3xl font-bold tracking-tight text-slate-950">
							{t('learningPathsTitle')}
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('learningPathsDescription')}
						</p>
					</div>
					<div className="mt-6 grid gap-5 lg:grid-cols-3">
						{learningPaths.map((path) => {
							const guide = getBlogPostBySlug(
								locale as AppLocale,
								path.guideSlug
							);
							const resolvedTopics = path.quizSlugs.reduce<
								NonNullable<
									ReturnType<typeof getQuizTopicBySlug>
								>[]
							>((topics, quizSlug) => {
								const topic = getQuizTopicBySlug(quizSlug);
								if (topic) topics.push(topic);
								return topics;
							}, []);
							const topics = resolvedTopics.map((topic) =>
								localizeQuizTopic(
									topic,
									quizTopicMessages[topic.slug]
								)
							);

							return (
								<article
									key={path.id}
									className="rounded-[28px] border border-sky-200/70 bg-white/88 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
								>
									<h3 className="text-xl font-bold tracking-tight text-slate-950">
										{path.title}
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										{path.description}
									</p>
									<ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
										{path.steps.map((step, index) => (
											<li
												key={step}
												className="flex gap-3"
											>
												<span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
													{index + 1}
												</span>
												<span>{step}</span>
											</li>
										))}
									</ol>
									<div className="mt-5 flex flex-wrap gap-2">
										{topics.map((topic) => (
											<Link
												key={topic.slug}
												href={`/quiz/${topic.slug}`}
												className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
											>
												{topic.shortTitle}
											</Link>
										))}
									</div>
									{guide && (
										<div className="mt-5">
											<Link
												href={`/blog/${guide.slug}`}
												className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
											>
												{t('readGuides')}
											</Link>
										</div>
									)}
								</article>
							);
						})}
					</div>
				</section>

				<section>
					<div className="max-w-3xl">
						<h2 className="text-3xl font-bold tracking-tight text-slate-950">
							{t('guideLibraryTitle')}
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('guideLibraryDescription')}
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
							{t('faqTitle')}
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('faqDescription')}
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
						<SiteFaqGroupList groups={faqGroups} previewCount={2} />
					</div>
				</section>
			</div>

			<div className="mt-16">
				<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					<RecentPracticePanel />
					<MistakesReviewPanel />
				</div>
			</div>
		</main>
	);
};

export default QuizzesPage;
