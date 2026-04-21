import { screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import { renderWithIntl } from '@/test/renderWithIntl';

vi.mock('@/i18n/navigation', () => ({
	Link: ({
		href,
		children,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	)
}));

vi.mock('@/lib/components/analytics/TrackedTopicLink', () => ({
	default: ({
		href,
		children,
		ariaLabel,
		className
	}: {
		href: string;
		children: ReactNode;
		ariaLabel?: string;
		className?: string;
	}) => (
		<a href={href} aria-label={ariaLabel} className={className}>
			{children}
		</a>
	)
}));

vi.mock('@/lib/components/AnalyticsProvider', () => ({
	useAnalytics: () => ({ snapshot: null })
}));

vi.mock('@/lib/hooks/useIsMounted', () => ({
	useIsMounted: () => true
}));

vi.mock('@/lib/hooks/useLocalStorage', () => ({
	useLocalStorage: () => [
		{
			lastCompletedDate: null,
			lastTopicSlug: null,
			lastAccuracy: null,
			currentStreak: 0,
			bestStreak: 0
		},
		vi.fn()
	]
}));

vi.mock('@/lib/data/quizTopics', async () => {
	const actual = await vi.importActual('@/lib/data/quizTopics');
	return {
		...actual,
		getDailyChallengeTopic: () => ({
			slug: 'world-map-quiz',
			kind: 'root',
			section: 'popular',
			badge: 'Popular',
			title: 'World Map Quiz',
			shortTitle: 'World Map',
			seoTitle: 'World Map Quiz',
			seoDescription: 'Test your world geography knowledge.',
			description: 'Practice the world map.',
			primaryKeyword: 'world map quiz',
			searchIntent: 'Interactive map practice',
			learningFocus: 'World map recall',
			questionCount: 197,
			benefits: ['Instant feedback'],
			highlights: ['Global coverage'],
			faq: [{ question: 'Who is it for?', answer: 'For students.' }],
			relatedSlugs: [],
			gameConfig: {
				mode: 'world',
				category: 'all',
				strictness: 800000
			}
		}),
		buildGameHref: () => '/game?mode=world'
	};
});

describe('quiz i18n panels', () => {
	it('renders translated DailyChallengeCard actions', () => {
		renderWithIntl(
			<DailyChallengeCard />,
			{
				DailyChallengeCard: {
					badge: '每日挑战',
					completedToday: '今日已完成',
					completedTodayWithAccuracy: '今日已完成 · {accuracy}%',
					challengeDate: '挑战日期：{date}',
					dayStreak: '{count} 天连胜',
					openChallengePage: '打开挑战页',
					playChallengeNow: '立即开始挑战'
				},
				QuizTopics: {
					'world-map-quiz': {
						title: '世界地图测验',
						description: '在互动地图上练习世界各国位置。'
					}
				}
			},
			'zh'
		);

		expect(screen.getByText('每日挑战')).toBeInTheDocument();
		expect(screen.getByText('世界地图测验')).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: '打开挑战页' })
		).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: '立即开始挑战' })
		).toBeInTheDocument();
	});

	it('renders translated QuizTopicCard labels', () => {
		renderWithIntl(
			<QuizTopicCard
				topic={{
					slug: 'world-map-quiz',
					kind: 'root',
					section: 'popular',
					badge: 'Popular',
					title: 'World Map Quiz',
					shortTitle: 'World Map',
					seoTitle: 'World Map Quiz',
					seoDescription: 'Test your world geography knowledge.',
					description: 'Practice the world map.',
					primaryKeyword: 'world map quiz',
					searchIntent: 'Interactive map practice',
					learningFocus: 'World map recall',
					questionCount: 197,
					benefits: ['Instant feedback'],
					highlights: ['Global coverage'],
					faq: [
						{ question: 'Who is it for?', answer: 'For students.' }
					],
					relatedSlugs: [],
					gameConfig: {
						mode: 'world',
						category: 'all',
						strictness: 800000
					}
				}}
			/>,
			{
				QuizTopicCard: {
					locations: '{count} 个地点',
					openTopic: '打开 {title}',
					playNow: '开始 {title}',
					openTopicAria: '打开 {title}',
					playTopicAria: '开始 {title}'
				},
				QuizTopics: {
					'world-map-quiz': {
						badge: '热门',
						title: '世界地图测验',
						shortTitle: '世界地图',
						description: '在互动地图上练习世界各国位置。',
						highlights: ['世界范围']
					}
				}
			},
			'zh'
		);

		expect(screen.getByText('热门')).toBeInTheDocument();
		expect(screen.getByText('世界地图测验')).toBeInTheDocument();
		expect(screen.getByText('197 个地点')).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: '打开 世界地图测验' })
		).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: '开始 世界地图测验' })
		).toBeInTheDocument();
	});
});
