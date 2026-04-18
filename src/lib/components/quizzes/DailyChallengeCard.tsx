'use client';

import { CheckCircle2, Flame } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import {
	buildGameHref,
	formatChallengeDate,
	getDailyChallengeTopic
} from '@/lib/data/quizTopics';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import {
	DAILY_CHALLENGE_STORAGE_KEY,
	type DailyChallengeState,
	getChallengeDateKey,
	initialDailyChallengeState
} from '@/lib/utils/challenge';

const DailyChallengeCard = ({ className = '' }: { className?: string }) => {
	const isMounted = useIsMounted();
	const analytics = useAnalytics();
	const topic = getDailyChallengeTopic();
	const [challengeState] = useLocalStorage<DailyChallengeState>(
		DAILY_CHALLENGE_STORAGE_KEY,
		initialDailyChallengeState
	);
	const effectiveChallengeState =
		analytics.snapshot?.challengeState ?? challengeState;
	const isCompletedToday =
		isMounted &&
		effectiveChallengeState.lastCompletedDate === getChallengeDateKey() &&
		effectiveChallengeState.lastTopicSlug === topic.slug;
	const completionLabel = useMemo(() => {
		if (!isCompletedToday) return null;
		return effectiveChallengeState.lastAccuracy !== null
			? `Completed today · ${effectiveChallengeState.lastAccuracy}%`
			: 'Completed today';
	}, [effectiveChallengeState.lastAccuracy, isCompletedToday]);

	return (
		<section
			className={`rounded-[32px] border border-amber-200/80 bg-[linear-gradient(135deg,rgba(254,243,199,0.94),rgba(255,255,255,0.96))] p-6 shadow-[0_18px_44px_rgba(180,83,9,0.10)] ${className}`}
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="max-w-2xl">
					<span className="rounded-full border border-amber-300/80 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800">
						Daily Challenge
					</span>
					{isCompletedToday && (
						<div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
							<CheckCircle2 className="size-4" />
							<span>{completionLabel}</span>
						</div>
					)}
					<h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
						{topic.title}
					</h2>
					<p className="mt-3 text-base leading-7 text-slate-700">
						{topic.description}
					</p>
					<div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-amber-900">
						<span>Challenge date: {formatChallengeDate()}</span>
						{isMounted &&
							effectiveChallengeState.currentStreak > 0 && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/70 px-3 py-1">
									<Flame className="size-4" />
									{effectiveChallengeState.currentStreak} day
									streak
								</span>
							)}
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<Link
						href={`/quiz/${topic.slug}`}
						className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						Open challenge page
					</Link>
					<Link
						href={`${buildGameHref(topic.gameConfig)}&topic=${topic.slug}`}
						className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
					>
						Play challenge now
					</Link>
				</div>
			</div>
		</section>
	);
};

export default DailyChallengeCard;
