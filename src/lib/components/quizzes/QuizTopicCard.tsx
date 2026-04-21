import { useMessages, useTranslations } from 'next-intl';
import TrackedTopicLink from '@/lib/components/analytics/TrackedTopicLink';
import {
	type LocalizedQuizTopicMessages,
	localizeQuizTopic
} from '@/lib/data/quizTopicI18n';
import { buildGameHref, type QuizTopic } from '@/lib/data/quizTopics';

const QuizTopicCard = ({
	topic,
	compact = false
}: {
	topic: QuizTopic;
	compact?: boolean;
}) => {
	const t = useTranslations('QuizTopicCard');
	const messages = useMessages() as {
		QuizTopics?: Record<string, LocalizedQuizTopicMessages>;
	};
	const localizedTopic = localizeQuizTopic(
		topic,
		messages.QuizTopics?.[topic.slug]
	);

	return (
		<article
			className={`rounded-[28px] border border-sky-200/70 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
				compact ? 'p-5' : 'p-6'
			}`}
		>
			<div className="flex items-center justify-between gap-3">
				<span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-800">
					{localizedTopic.badge}
				</span>
				<span className="text-xs font-semibold text-slate-500">
					{t('locations', { count: localizedTopic.questionCount })}
				</span>
			</div>

			<h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
				{localizedTopic.title}
			</h3>
			<p className="mt-2 text-sm leading-6 text-slate-600">
				{localizedTopic.description}
			</p>

			<div className="mt-4 flex flex-wrap gap-2">
				{localizedTopic.highlights
					.slice(0, compact ? 2 : 3)
					.map((highlight) => (
						<span
							key={highlight}
							className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
						>
							{highlight}
						</span>
					))}
			</div>

			<div className="mt-5 flex flex-wrap gap-3">
				<TrackedTopicLink
					href={`/quiz/${localizedTopic.slug}`}
					topicSlug={localizedTopic.slug}
					topicKind={localizedTopic.kind}
					countryCode={localizedTopic.countryCode}
					source="quiz-topic-card"
					target="open-topic"
					className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
					ariaLabel={t('openTopicAria', {
						title: localizedTopic.title
					})}
				>
					{t('openTopic', { title: localizedTopic.shortTitle })}
				</TrackedTopicLink>
				<TrackedTopicLink
					href={buildGameHref(localizedTopic.gameConfig)}
					topicSlug={localizedTopic.slug}
					topicKind={localizedTopic.kind}
					countryCode={localizedTopic.countryCode}
					source="quiz-topic-card"
					target="play-topic"
					className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
					ariaLabel={t('playTopicAria', {
						title: localizedTopic.title
					})}
				>
					{t('playNow', { title: localizedTopic.shortTitle })}
				</TrackedTopicLink>
			</div>
		</article>
	);
};

export default QuizTopicCard;
