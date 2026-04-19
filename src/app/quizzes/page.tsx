import type { Metadata } from 'next';
import AdSlot from '@/lib/components/monetization/AdSlot';
import TopicObservabilityPanel from '@/lib/components/analytics/TopicObservabilityPanel';
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
					Explore the MapQuiz.pro quiz network.
				</h1>
				<p className="mt-5 text-lg leading-8 text-slate-600">
					These pages are organized by search intent: broad world quizzes,
					continent drills, country hubs, and focused subtopic practice.
				</p>
			</section>

			<div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
				<DailyChallengeCard />
				<AdSlot
					slot="quiz-library-rail"
					description="A non-blocking library placement for future ads, sponsorships, or premium upsells."
				/>
			</div>

			<div className="mt-14 space-y-16">
				<MasteryDashboard
					title="Progress and mastery"
					description="This local dashboard shows which quiz topics are compounding well, where mistakes are piling up, and which next session is most useful."
				/>

				<TopicObservabilityPanel />

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
					title="Country Map Quiz Hubs"
					description="These country hub pages cover the broadest country-level intents and link outward into narrower geography drills."
					topics={rootCountryTopics}
				/>

				<QuizTopicSection
					title="Featured Developed-Country Drills"
					description="This layer highlights one focused drill per priority country so searchers can jump directly into narrower intents without passing through the hub first."
					topics={featuredCountryDrills}
					compact
				/>

				<QuizTopicSection
					title="Focused Country Drills"
					description="These long-tail pages target narrower study intent such as prefectures, state capitals, major cities, and landmark practice."
					topics={focusedDrillTopics}
					compact
				/>
			</div>

			<div className="mt-16">
				<div className="grid gap-6 lg:grid-cols-2">
					<RecentPracticePanel />
					<MistakesReviewPanel />
				</div>
			</div>
		</main>
	);
};

export default QuizzesPage;
