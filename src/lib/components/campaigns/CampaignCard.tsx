import { Compass, type LucideIcon, Route, ShieldAlert } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Campaign } from '@/lib/data/campaigns';
import { buildGameHref, getQuizTopicBySlug } from '@/lib/data/quizTopics';

const accentClasses: Record<
	Campaign['accent'],
	{ frame: string; badge: string; icon: string }
> = {
	sky: {
		frame: 'border-sky-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98))]',
		badge: 'border-sky-200 bg-sky-50 text-sky-800',
		icon: 'border-sky-200 bg-sky-100 text-sky-700'
	},
	amber: {
		frame: 'border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))]',
		badge: 'border-amber-200 bg-amber-50 text-amber-800',
		icon: 'border-amber-200 bg-amber-100 text-amber-700'
	},
	emerald: {
		frame: 'border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))]',
		badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
		icon: 'border-emerald-200 bg-emerald-100 text-emerald-700'
	}
};

const templateIcons: Record<Campaign['templateId'], LucideIcon> = {
	pursuit: Route,
	command: ShieldAlert,
	escape: Compass
};

const CampaignCard = ({
	campaign,
	labels,
	compact = false
}: {
	campaign: Campaign;
	labels: {
		viewCampaign: string;
		playFirstMission: string;
		minutesLabel: (minutes: number) => string;
		missionsLabel: (count: number) => string;
		remixLabel: string;
	};
	compact?: boolean;
}) => {
	const launchTopic = getQuizTopicBySlug(campaign.launchQuizSlug);
	if (!launchTopic) return null;

	const Icon = templateIcons[campaign.templateId];
	const accent = accentClasses[campaign.accent];
	const launchHref = `${buildGameHref(launchTopic.gameConfig)}&topic=${launchTopic.slug}&campaign=${campaign.slug}`;

	return (
		<article
			className={`rounded-[28px] border ${accent.frame} shadow-[0_18px_44px_rgba(15,23,42,0.08)] ${
				compact ? 'p-5' : 'p-6'
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${accent.badge}`}
					>
						{campaign.templateLabel}
					</span>
					<h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
						{campaign.title}
					</h3>
					<p
						className={`mt-2 text-sm leading-6 text-slate-600 ${
							compact ? 'line-clamp-3' : ''
						}`}
					>
						{campaign.summary}
					</p>
				</div>
				<div
					className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${accent.icon}`}
				>
					<Icon className="size-5" />
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
					{labels.minutesLabel(campaign.durationMinutes)}
				</span>
				<span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
					{labels.missionsLabel(campaign.missionCount)}
				</span>
				<span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
					{campaign.difficultyLabel}
				</span>
				<span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
					{campaign.audienceLabel}
				</span>
			</div>

			<p
				className={`mt-4 text-sm leading-6 text-slate-700 ${
					compact ? 'line-clamp-4' : ''
				}`}
			>
				{campaign.premise}
			</p>

			<div className="mt-5">
				<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
					{labels.remixLabel}
				</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{campaign.remixPromptExamples
						.slice(0, compact ? 2 : 3)
						.map((idea) => (
							<span
								key={idea}
								className="rounded-full border border-slate-200 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700"
							>
								{idea}
							</span>
						))}
				</div>
			</div>

			<div className="mt-6 flex flex-wrap gap-3">
				<Link
					href={`/campaign/${campaign.slug}`}
					className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
				>
					{labels.viewCampaign}
				</Link>
				<Link
					href={launchHref}
					className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
				>
					{labels.playFirstMission}
				</Link>
			</div>
		</article>
	);
};

export default CampaignCard;
