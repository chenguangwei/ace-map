'use client';

import { RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import {
	buildGameHref,
	getQuizTopicBySlug,
	type QuizTopic
} from '@/lib/data/quizTopics';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import {
	clearMistakesForTopic,
	MISTAKE_STORAGE_KEY,
	type MistakeEntry
} from '@/lib/utils/review';

const MistakesReviewPanel = ({
	topicSlug,
	title = 'Mistakes review',
	description = 'Come back to the places you missed and replay them in a focused map session.'
}: {
	topicSlug?: string;
	title?: string;
	description?: string;
}) => {
	const isMounted = useIsMounted();
	const analytics = useAnalytics();
	const [mistakes, setMistakes] = useLocalStorage<MistakeEntry[]>(
		MISTAKE_STORAGE_KEY,
		[]
	);
	const effectiveMistakes = analytics.snapshot?.mistakes ?? mistakes;

	if (!isMounted) return null;

	const grouped = effectiveMistakes.reduce(
		(groups, entry) => {
			if (topicSlug && entry.topicSlug !== topicSlug) return groups;

			const topic = getQuizTopicBySlug(entry.topicSlug);
			if (!topic) return groups;

			const existing = groups.find(
				(group) => group.topic.slug === topic.slug
			);
			if (existing) {
				existing.entries.push(entry);
				return groups;
			}

			groups.push({
				topic,
				entries: [entry]
			});
			return groups;
		},
		[] as Array<{ topic: QuizTopic; entries: MistakeEntry[] }>
	);

	if (grouped.length === 0) return null;

	return (
		<section className="rounded-[28px] border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.92),rgba(255,255,255,0.96))] p-6 shadow-[0_16px_38px_rgba(225,29,72,0.08)]">
			<h2 className="text-2xl font-bold tracking-tight text-slate-950">
				{title}
			</h2>
			<p className="mt-2 text-sm leading-6 text-slate-600">
				{description}
			</p>

			<div className="mt-5 grid gap-4">
				{grouped.map(({ topic, entries }) => {
					const uniqueCount = new Set(
						entries.map(
							(entry) =>
								`${entry.place.name}-${entry.place.latitude}-${entry.place.longitude}`
						)
					).size;

					return (
						<div
							key={topic.slug}
							className="rounded-[24px] border border-rose-200/70 bg-white/88 p-5"
						>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div className="max-w-2xl">
									<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700">
										{topic.badge}
									</p>
									<h3 className="mt-2 text-lg font-bold text-slate-950">
										{topic.title}
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										{uniqueCount} unique misses saved.
										Latest:{' '}
										{entries
											.slice(0, 3)
											.map((entry) => entry.place.name)
											.join(', ')}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Link
										href={`${buildGameHref(topic.gameConfig)}&topic=${topic.slug}&review=mistakes`}
										className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
									>
										<RotateCcw className="size-4" />
										Review misses
									</Link>
									<button
										type="button"
										onClick={() => {
											clearMistakesForTopic(topic.slug);
											setMistakes(
												mistakes.filter(
													(entry) =>
														entry.topicSlug !==
														topic.slug
												)
											);
											void analytics.clearTopicMistakes(
												topic.slug
											);
										}}
										className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
									>
										<Trash2 className="size-4" />
										Clear
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default MistakesReviewPanel;
