'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { getQuizTopicBySlug, type QuizTopic } from '@/lib/data/quizTopics';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import {
	RECENT_TOPICS_STORAGE_KEY,
	type RecentTopicEntry
} from '@/lib/utils/progress';

const MAX_RECENT_TOPICS = 4;

const RecentPracticePanel = ({
	currentSlug,
	title = 'Recent practice',
	description = 'Pick up where you left off with your latest topic pages.'
}: {
	currentSlug?: string;
	title?: string;
	description?: string;
}) => {
	const isMounted = useIsMounted();
	const [recentTopics, setRecentTopics] = useLocalStorage<RecentTopicEntry[]>(
		RECENT_TOPICS_STORAGE_KEY,
		[]
	);

	useEffect(() => {
		if (!currentSlug) return;
		if (recentTopics[0]?.slug === currentSlug) return;

		const nextEntries = [
			{
				slug: currentSlug,
				lastVisitedAt: new Date().toISOString()
			},
			...recentTopics.filter((entry) => entry.slug !== currentSlug)
		].slice(0, MAX_RECENT_TOPICS);

		const hasChanged =
			nextEntries.length !== recentTopics.length ||
			nextEntries.some((entry, index) => {
				const previous = recentTopics[index];
				return (
					!previous ||
					previous.slug !== entry.slug ||
					previous.lastVisitedAt !== entry.lastVisitedAt
				);
			});

		if (hasChanged) {
			setRecentTopics(nextEntries);
		}
	}, [currentSlug, recentTopics, setRecentTopics]);

	if (!isMounted) return null;

	const resolvedTopics = recentTopics
		.map((entry) => ({
			entry,
			topic: getQuizTopicBySlug(entry.slug)
		}))
		.filter(
			(item): item is { entry: RecentTopicEntry; topic: QuizTopic } =>
				item.topic !== null
		);

	if (resolvedTopics.length === 0) return null;

	return (
		<section className="rounded-[28px] border border-slate-200 bg-white/88 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
			<h2 className="text-2xl font-bold tracking-tight text-slate-950">
				{title}
			</h2>
			<p className="mt-2 text-sm leading-6 text-slate-600">
				{description}
			</p>

			<div className="mt-5 grid gap-4 md:grid-cols-2">
				{resolvedTopics.map(({ entry, topic }) => (
					<Link
						key={topic.slug}
						href={`/quiz/${topic.slug}`}
						className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
					>
						<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">
							{topic.badge}
						</p>
						<h3 className="mt-3 text-lg font-bold text-slate-950">
							{topic.title}
						</h3>
						<p className="mt-2 text-sm leading-6 text-slate-600">
							{topic.description}
						</p>
						<p className="mt-3 text-xs font-semibold text-slate-400">
							Last opened{' '}
							{new Date(entry.lastVisitedAt).toLocaleDateString()}
						</p>
					</Link>
				))}
			</div>
		</section>
	);
};

export default RecentPracticePanel;
