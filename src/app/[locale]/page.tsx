import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { BackgroundBeams } from '@/lib/components/BgBeams';
import { Show } from '@/lib/components/Flow';
import AdSlot from '@/lib/components/monetization/AdSlot';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import MasteryDashboard from '@/lib/components/quizzes/MasteryDashboard';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicSection from '@/lib/components/quizzes/QuizTopicSection';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import Result from '@/lib/components/Result';
import Start from '@/lib/components/Start';
import { FEATURED_COUNTRIES } from '@/lib/data/countries';
import {
	buildGameHref,
	getCountrySubtopics,
	getQuizTopicsByKind,
	getQuizTopicsBySection,
	quizTopics
} from '@/lib/data/quizTopics';

const Page = async ({
	searchParams,
	params
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const featuredCountryCodes = ['jp', 'de', 'ca', 'au', 'fr', 'gb', 'it', 'es'];
	const resultCode = (await searchParams).code;
	const popularTopics = getQuizTopicsBySection('popular');
	const continentTopics = getQuizTopicsBySection('continents');
	const countryTopics = getQuizTopicsByKind('root')
		.filter((topic) => topic.section === 'countries')
		.slice(0, 6);
	const countrySubtopics = getCountrySubtopics();
	const focusedDrillTopics = featuredCountryCodes
		.map((countryCode) =>
			countrySubtopics.find((topic) => topic.countryCode === countryCode)
		)
		.filter((topic) => topic !== undefined);

	return (
		<div className="relative min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
			<BackgroundBeams />
			<Show condition={resultCode === undefined}>
				<main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
					<section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
						<div className="max-w-2xl">
							<span className="rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-800 shadow-sm backdrop-blur-sm">
								Interactive Geography Quiz Network
							</span>
							<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
								Build geography memory with topic-based map
								quizzes.
							</h1>
							<p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
								MapQuiz.pro covers broad map quiz intent with
								focused landing pages, instant answer feedback,
								and fast replay loops for world regions,
								countries, and classroom-style practice.
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									href="/quizzes"
									className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
								>
									Browse quiz library
								</Link>
								<Link
									href={buildGameHref(
										popularTopics[0].gameConfig
									)}
									className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									Play world quiz now
								</Link>
							</div>
							<div className="mt-8 grid gap-4 sm:grid-cols-3">
								{[
									[
										String(quizTopics.length),
										'quiz topic pages'
									],
									[
										`${FEATURED_COUNTRIES.length}+`,
										'country data packs'
									],
									[
										String(countrySubtopics.length),
										'focused drill pages'
									]
								].map(([value, label]) => (
									<div
										key={label}
										className="rounded-[24px] border border-sky-200/70 bg-white/82 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
									>
										<p className="text-2xl font-black text-slate-950">
											{value}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{label}
										</p>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-center lg:justify-end">
							<Start />
						</div>
					</section>

					<QuizTopicSection
						title="Start with the biggest search intents"
						description="These landing pages capture the broadest geography and map quiz queries while still leading users into the same replayable interaction loop."
						topics={popularTopics}
					/>

					<DailyChallengeCard />

					<MasteryDashboard />

					<QuizTopicSection
						title="Choose a continent and drill it fast"
						description="Each continent page narrows the country pool, increases replay value, and gives searchers a clearer page match."
						topics={continentTopics}
						compact
					/>

					<QuizTopicSection
						title="Go deeper with country-specific map quizzes"
						description="Country pages turn the same engine into narrower study products for state capitals, province capitals, major cities, and landmarks."
						topics={countryTopics}
						compact
					/>

					<QuizTopicSection
						title="Jump straight into focused country drills"
						description="These subtopic pages surface the most rankable long-tail intents across Japan, Germany, Canada, Australia, France, the UK, Italy, and Spain."
						topics={focusedDrillTopics}
						compact
					/>

					<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
						<div className="space-y-6">
							<RecentPracticePanel />
							<MistakesReviewPanel />
						</div>
						<AdSlot
							slot="home-network-rail"
							description="Use this edge placement for future AdSense, affiliate experiments, or house promos without interrupting gameplay."
						/>
					</div>
				</main>
			</Show>
			<Show condition={typeof resultCode === 'string'}>
				<div className="relative flex min-h-[calc(100dvh-var(--navbar-height))] items-center justify-center py-8">
					<Result code={resultCode as string} />
				</div>
			</Show>
		</div>
	);
};

export default Page;
