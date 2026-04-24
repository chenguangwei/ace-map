import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlogPostCard from '@/lib/components/content/BlogPostCard';
import {
	type AppLocale,
	getBlogPosts,
	getFeaturedBlogPosts
} from '@/lib/data/content';
import { buildPageMetadata } from '@/lib/seo';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'BlogPage' });
	return buildPageMetadata({
		locale,
		path: '/blog',
		title: `${t('badge')} | MapQuiz.pro`,
		description: t('subheadline')
	});
};

const BlogIndexPage = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('BlogPage');
	const posts = getBlogPosts(locale as AppLocale);
	const featuredPosts = getFeaturedBlogPosts(locale as AppLocale, 3);
	const readingTimeLabel = (minutes: number) => t('readingTime', { minutes });

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

			<section className="mt-14">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('featuredTitle')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('featuredDescription')}
					</p>
				</div>
				<div className="mt-6 grid gap-5 md:grid-cols-3">
					{featuredPosts.map((post) => (
						<BlogPostCard
							key={post.slug}
							post={post}
							ctaLabel={t('articleCta')}
							readingTimeLabel={readingTimeLabel}
							compact
						/>
					))}
				</div>
			</section>

			<section className="mt-16">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('libraryTitle')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('libraryDescription')}
					</p>
				</div>
				<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{posts.map((post) => (
						<BlogPostCard
							key={post.slug}
							post={post}
							ctaLabel={t('articleCta')}
							readingTimeLabel={readingTimeLabel}
						/>
					))}
				</div>
			</section>
		</main>
	);
};

export default BlogIndexPage;
