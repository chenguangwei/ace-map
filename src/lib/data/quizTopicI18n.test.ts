import { describe, expect, it } from 'vitest';
import {
	getLocalizedQuizTopicMessageMap,
	LOCALIZED_QUIZ_TOPIC_KEYS,
	localizeQuizTopic,
	localizeQuizTopics
} from '@/lib/data/quizTopicI18n';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';
import enMessages from '../../../messages/en.json';
import jaMessages from '../../../messages/ja.json';
import zhMessages from '../../../messages/zh.json';

describe('localizeQuizTopic', () => {
	it('overrides translatable fields from messages', () => {
		const topic = getQuizTopicBySlug('world-map-quiz');
		if (!topic) throw new Error('missing fixture topic');

		const localized = localizeQuizTopic(topic, {
			title: '世界地图测验',
			shortTitle: '世界地图',
			badge: '热门',
			description: '在互动地图上练习世界各国位置。',
			seoTitle: '世界地图测验',
			seoDescription: '测试世界地理知识。',
			benefits: ['即时反馈'],
			highlights: ['世界范围'],
			faq: [{ question: '适合谁？', answer: '适合学生。' }]
		});

		expect(localized.title).toBe('世界地图测验');
		expect(localized.badge).toBe('热门');
		expect(localized.faq[0]?.question).toBe('适合谁？');
	});

	it('keeps English fallback when optional translated fields are missing', () => {
		const topic = getQuizTopicBySlug('asia-countries-quiz');
		if (!topic) throw new Error('missing fixture topic');

		const localized = localizeQuizTopic(topic, {
			title: '亚洲国家测验'
		});

		expect(localized.title).toBe('亚洲国家测验');
		expect(localized.description).toBe(topic.description);
		expect(localized.highlights).toEqual(topic.highlights);
	});

	it('localizes a topic list and falls back when a slug is missing from the map', () => {
		const worldTopic = getQuizTopicBySlug('world-map-quiz');
		const asiaTopic = getQuizTopicBySlug('asia-countries-quiz');
		if (!worldTopic || !asiaTopic)
			throw new Error('missing fixture topics');

		const localizedTopics = localizeQuizTopics([worldTopic, asiaTopic], {
			'world-map-quiz': {
				title: '世界地图测验'
			}
		});

		expect(localizedTopics[0]?.title).toBe('世界地图测验');
		expect(localizedTopics[1]?.title).toBe(asiaTopic.title);
		expect(localizedTopics[1]?.description).toBe(asiaTopic.description);
	});

	it('keeps English quiz topics on the richer source copy', () => {
		expect(getLocalizedQuizTopicMessageMap('en')).toEqual({});
	});

	it('keeps the locale message contract constrained to translatable quiz-topic fields', () => {
		const expectedKeys = [...LOCALIZED_QUIZ_TOPIC_KEYS].sort();

		for (const messages of [enMessages, zhMessages, jaMessages]) {
			for (const entry of Object.values(messages.QuizTopics)) {
				const actualKeys = Object.keys(entry).sort();
				expect(actualKeys).toEqual(expectedKeys);

				for (const field of LOCALIZED_QUIZ_TOPIC_KEYS) {
					const value = entry[field];
					expect(value).toBeDefined();

					if (typeof value === 'string') {
						expect(value.trim().length).toBeGreaterThan(0);
					} else if (Array.isArray(value)) {
						expect(value.length).toBeGreaterThan(0);

						if (field === 'faq') {
							for (const item of value as Array<{
								question: string;
								answer: string;
							}>) {
								expect(
									item.question.trim().length
								).toBeGreaterThan(0);
								expect(
									item.answer.trim().length
								).toBeGreaterThan(0);
							}
						} else {
							for (const item of value as string[]) {
								expect(item.trim().length).toBeGreaterThan(0);
							}
						}
					}
				}
			}
		}
	});
});
