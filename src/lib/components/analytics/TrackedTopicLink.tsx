'use client';

import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import type { QuizTopicKind } from '@/lib/data/quizTopics';
import { recordTopicObservabilityEvent } from '@/lib/utils/topicObservability';

const TrackedTopicLink = ({
	href,
	topicSlug,
	topicKind,
	countryCode,
	source,
	target,
	className,
	ariaLabel,
	children
}: PropsWithChildren<{
	href: string;
	topicSlug: string;
	topicKind: QuizTopicKind;
	countryCode?: string | null;
	source: string;
	target: string;
	className?: string;
	ariaLabel?: string;
}>) => (
	<Link
		href={href}
		className={className}
		aria-label={ariaLabel}
		onClick={() => {
			recordTopicObservabilityEvent({
				topicSlug,
				topicKind,
				countryCode: countryCode ?? null,
				eventType: 'cta_click',
				source,
				target
			});
		}}
	>
		{children}
	</Link>
);

export default TrackedTopicLink;
