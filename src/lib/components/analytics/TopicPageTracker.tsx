'use client';

import { useEffect } from 'react';
import type { QuizTopicKind } from '@/lib/data/quizTopics';
import { recordTopicObservabilityEvent } from '@/lib/utils/topicObservability';

const TopicPageTracker = ({
	topicSlug,
	topicKind,
	countryCode
}: {
	topicSlug: string;
	topicKind: QuizTopicKind;
	countryCode?: string | null;
}) => {
	useEffect(() => {
		recordTopicObservabilityEvent({
			topicSlug,
			topicKind,
			countryCode: countryCode ?? null,
			eventType: 'page_view',
			source: 'topic-page',
			target: 'page'
		});
	}, [countryCode, topicKind, topicSlug]);

	return null;
};

export default TopicPageTracker;
