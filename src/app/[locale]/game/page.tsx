import 'maplibre-gl/dist/maplibre-gl.css';
import { Skeleton } from '@heroui/skeleton';
import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import Main from '@/lib/components/game/Main';
import AdSlot from '@/lib/components/monetization/AdSlot';
import MistakesReviewPanel from '@/lib/components/quizzes/MistakesReviewPanel';
import QuizTopicCard from '@/lib/components/quizzes/QuizTopicCard';
import RecentPracticePanel from '@/lib/components/quizzes/RecentPracticePanel';
import {
	getQuizTopicBySlug,
	getRecommendedQuizTopics
} from '@/lib/data/quizTopics';
import type { GameMode } from '@/lib/utils/places';

export const metadata: Metadata = {
	title: 'Play Geography Quiz | MapQuiz.pro',
	description:
		'Play interactive geography quizzes with instant map feedback and explore related map quiz topics.',
	alternates: {
		canonical: 'https://mapquiz.pro/game'
	}
};

const page = async ({
	searchParams,
	params
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const resolved = await searchParams;
	const topicParam =
		typeof resolved.topic === 'string' ? resolved.topic : undefined;
	const sourceTopic = topicParam ? getQuizTopicBySlug(topicParam) : null;
	const modeParam =
		typeof resolved.mode === 'string' &&
		['india', 'world', 'country'].includes(resolved.mode)
			? (resolved.mode as GameMode)
			: undefined;
	const recommendedTopics = sourceTopic
		? getRecommendedQuizTopics({
				currentSlug: sourceTopic.slug,
				limit: 3
			})
		: getRecommendedQuizTopics({
				mode: modeParam,
				countryCode:
					typeof resolved.country === 'string'
						? resolved.country
						: undefined,
				category:
					typeof resolved.category === 'string'
						? resolved.category === 'all'
							? 'all'
							: resolved.category.split(',')
						: undefined,
				limit: 3
			});

	return (
		<main className="bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.86),_rgba(241,245,249,0.94))]">
			<section className="flex h-[calc(100dvh-var(--navbar-height))] flex-col items-center justify-center">
				<React.Suspense
					fallback={
						<>
							<Skeleton className="grow size-full" />
							<Skeleton className="w-full h-24" />
						</>
					}
				>
					<Main />
				</React.Suspense>
			</section>

			<section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
				<div className="rounded-[34px] border border-sky-200/70 bg-white/84 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-2xl">
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
								Continue the session
							</p>
							<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
								{sourceTopic
									? `More like ${sourceTopic.title}`
									: 'Next geography quiz ideas'}
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								Use these related quiz pages to stay inside the
								topic network and build more internal depth per
								visit.
							</p>
						</div>
						<Link
							href="/quizzes"
							className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
						>
							Browse all quiz pages
						</Link>
					</div>

					<div className="mt-8 grid gap-5 md:grid-cols-3">
						{recommendedTopics.map((topic) => (
							<QuizTopicCard
								key={topic.slug}
								topic={topic}
								compact
							/>
						))}
					</div>
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
					<div className="space-y-6">
						<RecentPracticePanel
							currentSlug={sourceTopic?.slug}
							title="Resume practice"
							description="Keep returning users close to the next relevant topic instead of ending the session at the game page."
						/>
						<MistakesReviewPanel
							topicSlug={sourceTopic?.slug}
							title={
								sourceTopic
									? `Missed locations in ${sourceTopic.shortTitle}`
									: 'Mistakes review'
							}
						/>
					</div>
					<AdSlot
						slot="game-exit-rail"
						description="Reserved placement for result-safe ads or premium upsells after the main game interaction."
					/>
				</div>
			</section>
		</main>
	);
};

export default page;
