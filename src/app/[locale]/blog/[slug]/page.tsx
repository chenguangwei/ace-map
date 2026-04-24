import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import {
	type AppLocale,
	getAllBlogSlugs,
	getBlogPostBySlug,
	getRelatedBlogPosts
} from '@/lib/data/content';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopics
} from '@/lib/data/quizTopicI18n';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';
import { buildAbsoluteUrl, buildPageMetadata } from '@/lib/seo';

export const generateStaticParams = () =>
	routing.locales.flatMap((locale) =>
		getAllBlogSlugs().map((slug) => ({ locale, slug }))
	);

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> => {
	const { locale, slug } = await params;
	const post = getBlogPostBySlug(locale as AppLocale, slug);
	const t = await getTranslations({ locale, namespace: 'BlogPage' });

	if (!post) {
		return {
			title: `${t('noPostTitle')} | MapQuiz.pro`
		};
	}

	return buildPageMetadata({
		locale,
		path: `/blog/${post.slug}`,
		title: post.seoTitle,
		description: post.seoDescription,
		keywords: post.keywords,
		openGraphType: 'article'
	});
};

const BlogPostPage = async ({
	params
}: {
	params: Promise<{ locale: string; slug: string }>;
}) => {
	const { locale, slug } = await params;
	setRequestLocale(locale);
	const post = getBlogPostBySlug(locale as AppLocale, slug);
	if (!post) notFound();

	const t = await getTranslations('BlogPage');
	const readingTimeLabel = (minutes: number) => t('readingTime', { minutes });
	const messages = (await getMessages()) as { QuizTopics?: unknown };
	const quizTopicMessages = (messages.QuizTopics ?? {}) as Partial<
		Record<string, LocalizedQuizTopicMessages | undefined>
	>;
	const relatedPosts = getRelatedBlogPosts(locale as AppLocale, slug, 3);
	const resolvedRelatedQuizTopics = post.relatedQuizSlugs.reduce<
		NonNullable<ReturnType<typeof getQuizTopicBySlug>>[]
	>((topics, quizSlug) => {
		const topic = getQuizTopicBySlug(quizSlug);
		if (topic) topics.push(topic);
		return topics;
	}, []);
	const relatedQuizTopics = localizeQuizTopics(
		resolvedRelatedQuizTopics,
		quizTopicMessages
	);
	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: post.title,
		description: post.seoDescription,
		url: buildAbsoluteUrl(locale, `/blog/${post.slug}`),
		datePublished: post.publishedAt,
		dateModified: post.updatedAt,
		inLanguage: locale,
		author: {
			'@type': 'Organization',
			name: 'MapQuiz.pro'
		},
		publisher: {
			'@type': 'Organization',
			name: 'MapQuiz.pro'
		},
		keywords: post.keywords
	};
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'MapQuiz.pro',
				item: buildAbsoluteUrl(locale, '/')
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: t('badge'),
				item: buildAbsoluteUrl(locale, '/blog')
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: post.title,
				item: buildAbsoluteUrl(locale, `/blog/${post.slug}`)
			}
		]
	};

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<script type="application/ld+json">
				{JSON.stringify(articleJsonLd)}
			</script>
			<script type="application/ld+json">
				{JSON.stringify(breadcrumbJsonLd)}
			</script>

			<nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
				<Link href="/blog" className="transition hover:text-slate-900">
					{t('backToBlog')}
				</Link>
				<span>/</span>
				<span className="font-semibold text-slate-900">
					{post.title}
				</span>
			</nav>

			<section className="grid gap-8 lg:grid-cols-[1fr_320px]">
				<div className="max-w-3xl">
					<div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
						<span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 uppercase tracking-[0.2em] text-sky-800">
							{post.categoryLabel}
						</span>
						<span>{readingTimeLabel(post.readingTimeMinutes)}</span>
						<span>{t('updatedOn', { date: post.updatedAt })}</span>
					</div>
					<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
						{post.title}
					</h1>
					<p className="mt-5 text-lg leading-8 text-slate-600">
						{post.description}
					</p>
					<p className="mt-6 text-base leading-7 text-slate-700">
						{post.intro}
					</p>
				</div>

				<aside className="rounded-[28px] border border-sky-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.95))] p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
						{t('keyTakeaways')}
					</p>
					<ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
						{post.takeaways.map((takeaway) => (
							<li key={takeaway} className="flex gap-3">
								<span className="mt-2 size-2 rounded-full bg-sky-500" />
								<span>{takeaway}</span>
							</li>
						))}
					</ul>
				</aside>
			</section>

			<section className="mt-16 max-w-3xl space-y-10">
				{post.sections.map((section) => (
					<section key={section.heading}>
						<h2 className="text-3xl font-bold tracking-tight text-slate-950">
							{section.heading}
						</h2>
						<div className="mt-4 space-y-4">
							{section.paragraphs.map((paragraph) => (
								<p
									key={paragraph}
									className="text-base leading-7 text-slate-700"
								>
									{paragraph}
								</p>
							))}
						</div>
						{section.bullets && (
							<ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
								{section.bullets.map((bullet) => (
									<li key={bullet} className="flex gap-3">
										<span className="mt-2 size-2 rounded-full bg-sky-500" />
										<span>{bullet}</span>
									</li>
								))}
							</ul>
						)}
					</section>
				))}
			</section>

			<section className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('relatedQuizTopicsTitle')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('relatedQuizTopicsDescription')}
					</p>
				</div>
				<div className="mt-6 grid gap-5 md:grid-cols-3">
					{relatedQuizTopics.map((topic) => (
						<QuizTopicCard key={topic.slug} topic={topic} compact />
					))}
				</div>
			</section>

			<section className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('relatedArticlesTitle')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('relatedArticlesDescription')}
					</p>
				</div>
				<div className="mt-6 grid gap-5 md:grid-cols-3">
					{relatedPosts.map((relatedPost) => (
						<BlogPostCard
							key={relatedPost.slug}
							post={relatedPost}
							ctaLabel={t('articleCta')}
							readingTimeLabel={readingTimeLabel}
							compact
						/>
					))}
				</div>
			</section>

			<section className="mt-16 rounded-[28px] border border-sky-200/70 bg-sky-50/80 p-6">
				<h2 className="text-2xl font-bold tracking-tight text-slate-950">
					{t('faqCtaTitle')}
				</h2>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
					{t('faqCtaDescription')}
				</p>
				<div className="mt-5">
					<Link
						href="/faq"
						className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						{t('openFaq')}
					</Link>
				</div>
			</section>
		</main>
	);
};

export default BlogPostPage;
