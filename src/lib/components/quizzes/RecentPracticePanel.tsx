'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
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
	title,
	description
}: {
	currentSlug?: string;
	title?: string;
	description?: string;
}) => {
	const t = useTranslations('RecentPracticePanel');
	const locale = useLocale();
	const messages = useMessages() as {
		QuizTopics?: Record<string, LocalizedQuizTopicMessages>;
	};
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
		)
		.map(({ entry, topic }) => ({
			entry,
			topic: localizeQuizTopic(topic, messages.QuizTopics?.[topic.slug])
		}));

	if (resolvedTopics.length === 0) return null;

	const resolvedTitle = title ?? t('title');
	const resolvedDescription = description ?? t('description');

	return (
		<section className="rounded-[28px] border border-slate-200 bg-white/88 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
			<h2 className="text-2xl font-bold tracking-tight text-slate-950">
				{resolvedTitle}
			</h2>
			<p className="mt-2 text-sm leading-6 text-slate-600">
				{resolvedDescription}
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
							{t('lastOpened', {
								date: new Intl.DateTimeFormat(locale).format(
									new Date(entry.lastVisitedAt)
								)
							})}
						</p>
					</Link>
				))}
			</div>
		</section>
	);
};

export default RecentPracticePanel;
