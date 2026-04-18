'use client';

import { BarChart3, MousePointerClick, PlayCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';

const formatDate = (value: string | null) => {
	if (!value) return 'No activity';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	});
};

const TopicObservabilityPanel = ({
	className = ''
}: {
	className?: string;
}) => {
	const analytics = useAnalytics();
	const topicStats = analytics.snapshot?.topicObservability ?? [];

	const topTopics = useMemo(() => topicStats.slice(0, 8), [topicStats]);

	if (topTopics.length === 0) {
		return (
			<section
				className={`rounded-[32px] border border-violet-200/80 bg-[linear-gradient(135deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(109,40,217,0.08)] ${className}`}
			>
				<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-700">
					SEO Prep
				</p>
				<h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
					Topic funnel signals
				</h2>
				<p className="mt-3 text-sm leading-6 text-slate-600">
					No topic-level activity has been recorded yet. Open a few topic
					pages and start some runs to seed local funnel data for views,
					clicks, starts, and completions.
				</p>
			</section>
		);
	}

	return (
		<section
			className={`rounded-[32px] border border-violet-200/80 bg-[linear-gradient(135deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(109,40,217,0.08)] ${className}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-3xl">
					<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-700">
						SEO Prep
					</p>
					<h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
						Topic funnel signals
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						This local panel approximates early search and discovery
						signals by tracking topic page views, CTA clicks, play starts,
						and completions per country hub or drill page.
					</p>
				</div>
			</div>

			<div className="mt-6 overflow-hidden rounded-[26px] border border-violet-200/70 bg-white/88">
				<div className="grid grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(72px,0.7fr))_minmax(90px,0.8fr)] gap-3 border-b border-violet-100 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">
					<span>Topic</span>
					<span>Views</span>
					<span>Clicks</span>
					<span>Starts</span>
					<span>Done</span>
					<span>Last Seen</span>
				</div>

				<div className="divide-y divide-violet-100">
					{topTopics.map((stat) => {
						const topic = getQuizTopicBySlug(stat.topicSlug);
						const label = topic?.title ?? stat.topicSlug;

						return (
							<div
								key={stat.topicSlug}
								className="grid grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(72px,0.7fr))_minmax(90px,0.8fr)] gap-3 px-4 py-4 text-sm text-slate-700"
							>
								<div className="min-w-0">
									<Link
										href={`/quiz/${stat.topicSlug}`}
										className="truncate font-semibold text-slate-950 transition hover:text-violet-800"
									>
										{label}
									</Link>
									<div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
										<span>{stat.topicKind ?? 'topic'}</span>
										{stat.countryCode && <span>{stat.countryCode.toUpperCase()}</span>}
										{stat.startRate !== null && (
											<span>{stat.startRate}% start rate</span>
										)}
									</div>
								</div>
								<MetricCell icon={<BarChart3 className="size-4" />} value={stat.pageViews} />
								<MetricCell
									icon={<MousePointerClick className="size-4" />}
									value={stat.ctaClicks}
								/>
								<MetricCell
									icon={<PlayCircle className="size-4" />}
									value={stat.playStarts}
								/>
								<MetricCell icon={<Trophy className="size-4" />} value={stat.completions} />
								<div className="text-sm font-medium text-slate-600">
									{formatDate(stat.lastEventAt)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

const MetricCell = ({
	icon,
	value
}: {
	icon: ReactNode;
	value: number;
}) => (
	<div className="flex items-center gap-2 font-semibold text-slate-900">
		<span className="text-violet-700">{icon}</span>
		<span>{value}</span>
	</div>
);

export default TopicObservabilityPanel;
