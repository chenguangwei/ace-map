import type { QuizTopic } from '@/lib/data/quizTopics';
import enMessages from '../../../messages/en.json';

type LocalizedQuizTopicKey =
	keyof (typeof enMessages.QuizTopics)[keyof typeof enMessages.QuizTopics];

export const LOCALIZED_QUIZ_TOPIC_KEYS = Object.freeze(
	Object.keys(
		enMessages.QuizTopics['world-map-quiz']
	) as LocalizedQuizTopicKey[]
);

export type LocalizedQuizTopicMessages = Partial<
	Pick<QuizTopic, LocalizedQuizTopicKey>
>;

export const localizeQuizTopic = (
	topic: QuizTopic,
	messages?: LocalizedQuizTopicMessages
): QuizTopic => {
	if (!messages) return topic;

	const localized: QuizTopic = {
		...topic,
		benefits: [...topic.benefits],
		highlights: [...topic.highlights],
		faq: topic.faq.map((item) => ({ ...item }))
	};

	for (const key of LOCALIZED_QUIZ_TOPIC_KEYS) {
		const value = messages[key];
		if (value !== undefined) {
			switch (key) {
				case 'benefits':
					localized.benefits = [...(value as QuizTopic['benefits'])];
					break;
				case 'highlights':
					localized.highlights = [
						...(value as QuizTopic['highlights'])
					];
					break;
				case 'faq':
					localized.faq = (value as QuizTopic['faq']).map((item) => ({
						...item
					}));
					break;
				case 'title':
					localized.title = value as QuizTopic['title'];
					break;
				case 'shortTitle':
					localized.shortTitle = value as QuizTopic['shortTitle'];
					break;
				case 'badge':
					localized.badge = value as QuizTopic['badge'];
					break;
				case 'description':
					localized.description = value as QuizTopic['description'];
					break;
				case 'seoTitle':
					localized.seoTitle = value as QuizTopic['seoTitle'];
					break;
				case 'seoDescription':
					localized.seoDescription =
						value as QuizTopic['seoDescription'];
					break;
				case 'learningFocus':
					localized.learningFocus =
						value as QuizTopic['learningFocus'];
					break;
				case 'searchIntent':
					localized.searchIntent = value as QuizTopic['searchIntent'];
					break;
			}
		}
	}

	return localized;
};

export const localizeQuizTopics = <TTopics extends readonly QuizTopic[]>(
	topics: TTopics,
	messageMap: Partial<
		Record<TTopics[number]['slug'], LocalizedQuizTopicMessages | undefined>
	>
) =>
	topics.map((topic) =>
		localizeQuizTopic(
			topic,
			messageMap[topic.slug as TTopics[number]['slug']]
		)
	);
