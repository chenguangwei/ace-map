import TrackedTopicLink from '@/lib/components/analytics/TrackedTopicLink';
import { buildGameHref, type QuizTopic } from '@/lib/data/quizTopics';

const QuizTopicCard = ({
	topic,
	compact = false
}: {
	topic: QuizTopic;
	compact?: boolean;
}) => (
	<article
		className={`rounded-[28px] border border-sky-200/70 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
			compact ? 'p-5' : 'p-6'
		}`}
	>
		<div className="flex items-center justify-between gap-3">
			<span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-800">
				{topic.badge}
			</span>
			<span className="text-xs font-semibold text-slate-500">
				{topic.questionCount} locations
			</span>
		</div>

		<h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
			{topic.title}
		</h3>
		<p className="mt-2 text-sm leading-6 text-slate-600">
			{topic.description}
		</p>

		<div className="mt-4 flex flex-wrap gap-2">
			{topic.highlights.slice(0, compact ? 2 : 3).map((highlight) => (
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
				href={`/quiz/${topic.slug}`}
				topicSlug={topic.slug}
				topicKind={topic.kind}
				countryCode={topic.countryCode}
				source="quiz-topic-card"
				target="open-topic"
				className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
				ariaLabel={`Open ${topic.title}`}
			>
				Open {topic.shortTitle}
			</TrackedTopicLink>
			<TrackedTopicLink
				href={buildGameHref(topic.gameConfig)}
				topicSlug={topic.slug}
				topicKind={topic.kind}
				countryCode={topic.countryCode}
				source="quiz-topic-card"
				target="play-topic"
				className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
				ariaLabel={`Play ${topic.title}`}
			>
				Play {topic.shortTitle}
			</TrackedTopicLink>
		</div>
	</article>
);

export default QuizTopicCard;
