import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MasteryDashboard from '@/lib/components/quizzes/MasteryDashboard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicSection from '@/lib/components/quizzes/QuizTopicSection';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import {
	getCountrySubtopics,
	getQuizTopicsByKind,
	getQuizTopicsBySection,
	QUIZ_SECTIONS
} from '@/lib/data/quizTopics';

const SITE_URL = 'https://mapquiz.pro';
const buildLocalePath = (locale: string, path: string) =>
	locale === routing.defaultLocale ? path : `/${locale}${path}`;

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'QuizzesPage' });
	const title = `${t('badge')} | MapQuiz.pro`;
	const description = t('subheadline');

	return {
		title,
		description,
		alternates: {
			canonical: `${SITE_URL}${buildLocalePath(locale, '/quizzes')}`
		},
		openGraph: {
			title,
			description,
			url: `${SITE_URL}${buildLocalePath(locale, '/quizzes')}`,
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description
		}
	};
};

const QuizzesPage = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('QuizzesPage');
	const tSections = await getTranslations('QuizSections');
	const featuredCountryCodes = [
		'jp',
		'de',
		'ca',
		'fr',
		'gb',
		'it',
		'es',
		'br',
		'kr',
		'ru',
		'mx',
		'id'
	];
	const rootCountryTopics = getQuizTopicsByKind('root').filter(
		(topic) => topic.section === 'countries'
	);
	const focusedDrillTopics = getCountrySubtopics();
	const featuredCountryDrills = featuredCountryCodes
		.map((countryCode) =>
			focusedDrillTopics.find(
				(topic) => topic.countryCode === countryCode
			)
		)
		.filter((topic) => topic !== undefined);

	return (
		<main className="mx-auto min-h-[calc(100dvh-var(--navbar-height))] w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<section className="max-w-3xl">
				<span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800">
					{t('badge')}
				</span>
				<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
					{t('headline')}
				</h1>
				<p className="mt-5 text-lg leading-8 text-slate-600">
					{t('subheadline')}
				</p>
			</section>

			<div className="mt-12">
				<DailyChallengeCard />
			</div>

			<div className="mt-14 space-y-16">
				<MasteryDashboard
					title={t('progressTitle')}
					description={t('progressDescription')}
				/>

				{QUIZ_SECTIONS.filter(
					(section) => section.id !== 'countries'
				).map((section) => (
					<QuizTopicSection
						key={section.id}
						title={tSections(section.id)}
						description={tSections(`${section.id}Desc`)}
						topics={getQuizTopicsBySection(section.id)}
					/>
				))}

				<QuizTopicSection
					title={t('countryMapQuizzes')}
					description={t('countryMapQuizzesDesc')}
					topics={rootCountryTopics}
				/>

				<QuizTopicSection
					title={t('featuredCountryDeepDives')}
					description={t('featuredCountryDeepDivesDesc')}
					topics={featuredCountryDrills}
					compact
				/>

				<QuizTopicSection
					title={t('focusedRegionalPractice')}
					description={t('focusedRegionalPracticeDesc')}
					topics={focusedDrillTopics}
					compact
				/>
			</div>

			<div className="mt-16">
				<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					<RecentPracticePanel />
					<MistakesReviewPanel />
				</div>
			</div>
		</main>
	);
};

export default QuizzesPage;
