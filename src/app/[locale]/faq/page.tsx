import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import SiteFaqGroupList from '@/lib/components/content/SiteFaqGroupList';
import {
	type AppLocale,
	getFeaturedBlogPosts,
	getSiteFaqGroups
} from '@/lib/data/content';
import { buildPageMetadata } from '@/lib/seo';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'FaqPage' });
	return buildPageMetadata({
		locale,
		path: '/faq',
		title: `${t('badge')} | MapQuiz.pro`,
		description: t('subheadline')
	});
};

const FaqPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('FaqPage');
	const tBlog = await getTranslations('BlogPage');
	const faqGroups = getSiteFaqGroups(locale as AppLocale);
	const featuredPosts = getFeaturedBlogPosts(locale as AppLocale, 3);
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqGroups.flatMap((group) =>
			group.items.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer
				}
			}))
		)
	};
	const readingTimeLabel = (minutes: number) =>
		tBlog('readingTime', { minutes });

	return (
		<main className="mx-auto min-h-[calc(100dvh-var(--navbar-height))] w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<script type="application/ld+json">
				{JSON.stringify(faqJsonLd)}
			</script>

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
				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/blog"
						className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						{t('browseGuides')}
					</Link>
					<Link
						href="/quizzes"
						className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
					>
						{t('browseQuizzes')}
					</Link>
				</div>
			</section>

			<section className="mt-14">
				<SiteFaqGroupList groups={faqGroups} />
			</section>

			<section className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('browseGuides')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('subheadline')}
					</p>
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
		</main>
	);
};

export default FaqPage;
