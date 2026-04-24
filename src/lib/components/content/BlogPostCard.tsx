import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/data/content';

const BlogPostCard = ({
	post,
	ctaLabel,
	readingTimeLabel,
	compact = false
}: {
	post: BlogPost;
	ctaLabel: string;
	readingTimeLabel: (minutes: number) => string;
	compact?: boolean;
}) => (
	<article
		className={`rounded-[28px] border border-sky-200/70 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
			compact ? 'p-5' : 'p-6'
		}`}
	>
		<div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
			<span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 uppercase tracking-[0.2em] text-sky-800">
				{post.categoryLabel}
			</span>
			<span>{readingTimeLabel(post.readingTimeMinutes)}</span>
		</div>
		<h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
			<Link href={`/blog/${post.slug}`} className="transition hover:text-sky-700">
				{post.title}
			</Link>
		</h3>
		<p className="mt-2 text-sm leading-6 text-slate-600">{post.description}</p>
		<div className="mt-4 flex flex-wrap gap-2">
			{post.keywords.slice(0, compact ? 2 : 3).map((keyword) => (
				<span
					key={keyword}
					className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
				>
					{keyword}
				</span>
			))}
		</div>
		<div className="mt-5">
			<Link
				href={`/blog/${post.slug}`}
				className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
			>
				{ctaLabel}
			</Link>
		</div>
	</article>
);

export default BlogPostCard;
