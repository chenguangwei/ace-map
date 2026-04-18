import type { QuizTopic } from '@/lib/data/quizTopics';
import QuizTopicCard from './QuizTopicCard';

const QuizTopicSection = ({
	title,
	description,
	topics,
	compact = false
}: {
	title: string;
	description: string;
	topics: QuizTopic[];
	compact?: boolean;
}) => {
	if (topics.length === 0) return null;

	return (
		<section>
			<div className="max-w-3xl">
				<h2 className="text-3xl font-bold tracking-tight text-slate-950">
					{title}
				</h2>
				<p className="mt-3 text-base leading-7 text-slate-600">
					{description}
				</p>
			</div>

			<div
				className={`mt-8 grid gap-5 ${
					compact
						? 'md:grid-cols-2 xl:grid-cols-3'
						: 'md:grid-cols-2 xl:grid-cols-3'
				}`}
			>
				{topics.map((topic) => (
					<QuizTopicCard
						key={topic.slug}
						topic={topic}
						compact={compact}
					/>
				))}
			</div>
		</section>
	);
};

export default QuizTopicSection;
