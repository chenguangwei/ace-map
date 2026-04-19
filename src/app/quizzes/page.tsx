import type { Metadata } from 'next';
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

export const metadata: Metadata = {
	title: 'Quiz Library | MapQuiz.pro',
	description:
		'Browse world map quizzes, continent quizzes, and country-specific geography practice pages.'
};

const QuizzesPage = () => {
	const featuredCountryCodes = ['jp', 'de', 'ca', 'au', 'fr', 'gb', 'it', 'es'];
	const rootCountryTopics = getQuizTopicsByKind('root').filter(
		(topic) => topic.section === 'countries'
	);
	const focusedDrillTopics = getCountrySubtopics();
	const featuredCountryDrills = featuredCountryCodes
		.map((countryCode) =>
			focusedDrillTopics.find((topic) => topic.countryCode === countryCode)
		)
		.filter((topic) => topic !== undefined);

	return (
		<main className="mx-auto min-h-[calc(100dvh-var(--navbar-height))] w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<section className="max-w-3xl">
				<span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800">
					Quiz Library
				</span>
				<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
					Explore every map quiz in one place.
				</h1>
				<p className="mt-5 text-lg leading-8 text-slate-600">
					World quizzes, continent drills, country hubs, and focused regional practice — all in one library.
				</p>
			</section>

			<div className="mt-12">
				<DailyChallengeCard />
			</div>

			<div className="mt-14 space-y-16">
				<MasteryDashboard
					title="Your progress"
					description="Track which topics you've practiced, where you're making mistakes, and what to focus on next."
				/>

				{QUIZ_SECTIONS.filter((section) => section.id !== 'countries').map(
					(section) => (
						<QuizTopicSection
							key={section.id}
							title={section.title}
							description={section.description}
							topics={getQuizTopicsBySection(section.id)}
						/>
					)
				)}

				<QuizTopicSection
					title="Country Map Quizzes"
					description="Start with any country for a full quiz covering its regions, cities, and landmarks."
					topics={rootCountryTopics}
				/>

				<QuizTopicSection
					title="Featured Country Deep-Dives"
					description="Jump straight into focused practice for a specific country — states, prefectures, provinces, and more."
					topics={featuredCountryDrills}
					compact
				/>

				<QuizTopicSection
					title="Focused Regional Practice"
					description="Narrow your practice to specific regions, capitals, cities, or landmarks within a country."
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
