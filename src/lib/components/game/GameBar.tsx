'use client';
import { Button } from '@heroui/button';
import { addToast } from '@heroui/toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowRight,
	CheckCircle,
	Clock,
	Flame,
	MapPinned,
	Pause,
	Play,
	Radio,
	Satellite,
	Send,
	Target,
	XCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import {
	type CampaignRunState,
	deriveCampaignDialogueFrame
} from '@/lib/campaigns/runtime';
import type { Campaign, CampaignMissionPreview } from '@/lib/data/campaigns';
import {
	deductCredit,
	getBalance,
	subscribeToCredits
} from '@/lib/utils/credits';
import { type GameState, getHeatLevel } from '@/lib/utils/game';
import { localizePlace } from '@/lib/utils/localizePlace';
import type { MapDisplayMode } from '@/lib/utils/mapActivity';
import { formatDistance } from '@/lib/utils/places';
import { isWorldMicroRegionPlace } from '@/lib/utils/worldRegions';
import type { InfoState } from './Main';

const TimerComp = (props: { timer: RefObject<number> }) => {
	const t = useTranslations('GameBar');
	const [_, setTick] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setTick((t) => !t);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: _ triggers re-render
	const timeValue = useMemo(() => {
		const v = props.timer.current ?? 0;
		const minutes = Math.floor(v / 60);
		const seconds = v - minutes * 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}, [props, _]);

	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-sky-300/75 bg-slate-950/92 px-3 py-1.5 text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur-md">
			<Clock className="size-3.5 text-sky-300" />
			<span className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200/90">
				{t('time')}
			</span>
			<span className="text-sm font-bold tabular-nums text-white">
				{timeValue}
			</span>
		</div>
	);
};

const ScorePill = ({ current, total }: { current: number; total: number }) => {
	const t = useTranslations('GameBar');
	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[rgba(236,253,245,0.82)] px-3 py-1.5 text-emerald-950 shadow-[0_10px_24px_rgba(16,185,129,0.12)] backdrop-blur-md">
			<span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
				{t('score')}
			</span>
			<span className="text-sm font-bold tabular-nums">
				{current}/{total}
			</span>
		</div>
	);
};

const StreakBadge = ({ streak }: { streak: number }) => {
	if (streak < 2) return null;
	return (
		<AnimatePresence>
			<motion.div
				key={streak}
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.5, opacity: 0 }}
				className="flex items-center gap-1 rounded-full border border-orange-300/70 bg-[rgba(255,247,237,0.84)] px-2.5 py-1.5 shadow-[0_10px_24px_rgba(249,115,22,0.12)] backdrop-blur-md"
			>
				<Flame className="size-3 text-orange-500" />
				<span className="text-xs font-bold text-orange-600">
					{streak}×
				</span>
			</motion.div>
		</AnimatePresence>
	);
};

const HeatBadge = ({ streak }: { streak: number }) => {
	const t = useTranslations('GameBar');
	const level = getHeatLevel(streak);
	if (level === 'cool') return null;

	const heatConfig = {
		overdrive: {
			label: t('overdrive'),
			tone: 'border-orange-300/70 bg-[rgba(255,237,213,0.84)] text-orange-700'
		},
		heated: {
			label: t('heated'),
			tone: 'border-amber-300/70 bg-[rgba(254,243,199,0.86)] text-amber-700'
		},
		warm: {
			label: t('warming'),
			tone: 'border-sky-300/70 bg-[rgba(224,242,254,0.84)] text-sky-700'
		}
	};

	const { label, tone } = heatConfig[level];

	return (
		<div
			className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md ${tone}`}
		>
			<Target className="size-3.5" />
			<span className="text-[10px] font-bold uppercase tracking-[0.22em]">
				{label}
			</span>
		</div>
	);
};

const CampaignProgressBadge = ({ runtime }: { runtime: CampaignRunState }) => {
	const t = useTranslations('GameBar');
	const missionLabel =
		runtime.status === 'complete'
			? t('campaignComplete')
			: t('campaignMissionProgress', {
					current: runtime.currentMission,
					total: runtime.missionCount
				});

	return (
		<div className="min-w-[150px] rounded-2xl border border-violet-300/75 bg-[rgba(245,243,255,0.9)] px-3 py-2 text-violet-950 shadow-[0_12px_28px_rgba(109,40,217,0.12)] backdrop-blur-md">
			<div className="flex items-center justify-between gap-3">
				<span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-700">
					{t('campaign')}
				</span>
				<span className="text-xs font-semibold text-violet-800">
					{missionLabel}
				</span>
			</div>
			<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
				<div
					className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#06b6d4)] transition-[width]"
					style={{
						width: `${Math.max(8, Math.round(((runtime.completedMissions + runtime.missionProgress) / runtime.missionCount) * 100))}%`
					}}
				/>
			</div>
			<div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-medium text-violet-800/90">
				<span>
					{t('campaignAccuracy', { accuracy: runtime.accuracy })}
				</span>
				<span>
					{t('campaignQuestionsLeft', {
						count: runtime.remainingQuestions
					})}
				</span>
			</div>
		</div>
	);
};

const DistanceFeedback = ({
	info
}: {
	info: NonNullable<InfoState['info']>;
}) => {
	const t = useTranslations('GameBar');
	const distance = formatDistance(info.distance);

	return (
		<div
			className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium shadow-[0_14px_28px_rgba(15,23,42,0.12)] backdrop-blur-md ${
				info.isCorrect
					? 'border border-green-300/80 bg-[rgba(240,253,244,0.88)] text-green-700'
					: 'border border-red-300/80 bg-[rgba(254,242,242,0.88)] text-red-700'
			}`}
		>
			{info.isCorrect ? (
				<CheckCircle className="size-4 shrink-0" />
			) : (
				<XCircle className="size-4 shrink-0" />
			)}
			<span className="truncate max-w-[160px] sm:max-w-xs">
				{info.categorical
					? info.isCorrect
						? t('correctRegion')
						: t('distanceAway', { distance })
					: info.isCorrect
						? t('distanceOff', { distance })
						: t('distanceAway', { distance })}
			</span>
		</div>
	);
};

const CampaignTacticalCard = ({
	campaign,
	runtime,
	mission,
	selectedRegionLabel,
	targetLabel,
	info
}: {
	campaign: Campaign;
	runtime: CampaignRunState;
	mission: CampaignMissionPreview | null;
	selectedRegionLabel?: string | null;
	targetLabel?: string | null;
	info: InfoState['info'];
}) => {
	const frame = deriveCampaignDialogueFrame({
		campaign,
		mission,
		targetLabel: targetLabel ?? null,
		selectedRegionLabel: selectedRegionLabel ?? null,
		hasResult: Boolean(info),
		isCorrect: info?.isCorrect ?? false
	});
	const accentTone =
		campaign.accent === 'amber'
			? 'from-amber-500/18 via-orange-400/8 to-transparent border-amber-200/16 text-amber-100'
			: campaign.accent === 'emerald'
				? 'from-emerald-500/18 via-cyan-400/8 to-transparent border-emerald-200/16 text-emerald-100'
				: 'from-sky-500/18 via-cyan-400/8 to-transparent border-sky-200/16 text-sky-100';
	const statusTone = info
		? info.isCorrect
			? 'border-emerald-300/70 bg-emerald-400/12 text-emerald-50'
			: 'border-orange-300/70 bg-orange-400/12 text-orange-50'
		: selectedRegionLabel
			? 'border-amber-300/70 bg-amber-400/12 text-amber-50'
			: 'border-white/14 bg-white/8 text-slate-50';

	return (
		<motion.div
			key={`${runtime.currentMission}-${selectedRegionLabel ?? 'open'}-${info ? 'feedback' : 'active'}`}
			initial={{ opacity: 0, y: 8, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 8, scale: 0.98 }}
			className="pointer-events-auto absolute bottom-[8.2rem] left-3 right-3 max-w-md overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(145deg,rgba(15,23,42,0.94),rgba(30,41,59,0.84))] text-white shadow-[0_28px_70px_rgba(15,23,42,0.34)] backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:w-[25rem]"
		>
			<div
				className={`absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_70%)]`}
			/>
			<div
				className={`absolute inset-0 bg-[linear-gradient(135deg,transparent_12%,rgba(255,255,255,0.02)_54%,transparent_100%)]`}
			/>
			<div
				className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${accentTone}`}
			/>
			<div className="relative p-4 sm:p-5">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-300">
							{frame.channel}
						</p>
						<p className="mt-1 text-sm font-black text-white">
							{frame.speaker}
						</p>
					</div>
					<span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">
						{runtime.currentMission}/{runtime.missionCount}
					</span>
				</div>

				<div className="mt-3 rounded-[22px] border border-white/10 bg-white/6 p-3.5">
					<div className="flex items-start gap-3">
						<span
							className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-2xl border ${statusTone}`}
						>
							{selectedRegionLabel || info ? (
								<MapPinned className="size-4" />
							) : (
								<Radio className="size-4" />
							)}
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
								{frame.channelDetail}
							</p>
							<h3 className="mt-1 text-base font-black leading-tight text-white">
								{frame.headline}
							</h3>
							<p className="mt-2 text-xs leading-5 text-slate-300">
								{frame.briefingLine}
							</p>
						</div>
					</div>
				</div>

				<div className="mt-3 rounded-[22px] border border-white/10 bg-slate-950/34 p-3.5">
					<p className="text-[11px] font-semibold leading-6 text-slate-100">
						{frame.actionLine}
					</p>
					<p className="mt-2 text-[11px] font-medium leading-5 text-slate-400">
						{frame.footerLine}
					</p>
				</div>

				<div className="mt-3 flex items-center justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-white">
							{frame.actionLabel}
						</p>
					</div>
					<div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
						<div
							className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#06b6d4)] transition-[width]"
							style={{
								width: `${Math.max(
									8,
									Math.round(
										((runtime.completedMissions +
											runtime.missionProgress) /
											runtime.missionCount) *
											100
									)
								)}%`
							}}
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const MotionLink = motion.create(Link);

const GameBar = (
	props: InfoState & {
		gameState: GameState;
		mapDisplayMode: MapDisplayMode;
		onSatelliteHint: (lat: number, lng: number, zoom: number) => void;
		resultHref: string;
		campaign?: Campaign | null;
		campaignRunState?: CampaignRunState | null;
		campaignMission?: CampaignMissionPreview | null;
		campaignSelectedRegionLabel?: string | null;
		placeNameMap?: Record<string, string> | null;
	}
) => {
	const { gameState, info, mapDisplayMode, onSatelliteHint, setInfo } = props;
	const t = useTranslations('GameBar');
	const prevToMarkRef = useRef(gameState.toMark);
	const gameStateRef = useRef(gameState);
	const [creditBalance, setCreditBalance] = useState(() => getBalance());
	const [hintUsedThisTurn, setHintUsedThisTurn] = useState(false);
	gameStateRef.current = gameState;

	useEffect(() => {
		setCreditBalance(getBalance());

		return subscribeToCredits((balance) => {
			setCreditBalance(balance);
		});
	}, []);

	useEffect(() => {
		void gameState.toMark;
		setHintUsedThisTurn(false);
	}, [gameState.toMark]);

	useEffect(() => {
		// Only trigger game-over when transitioning from having a place → null while running
		if (
			prevToMarkRef.current !== null &&
			gameState.toMark === null &&
			gameState.status === 'running'
		) {
			gameStateRef.current.reset();

			addToast({
				color: 'success',
				title: t('gameOverTitle'),
				description: (
					<MotionLink
						href={props.resultHref}
						className="font-semibold text-emerald-700 underline underline-offset-4"
						initial={{ y: 0, rotate: 0 }}
						animate={{
							y: [0, -5, 0, -5, 0],
							rotate: [0, -5, 0, 5, 0]
						}}
						transition={{
							duration: 0.5,
							repeat: Infinity,
							repeatDelay: 1.5
						}}
					>
						{t('viewResult')}
					</MotionLink>
				),
				timeout: 20000
			});
		}
		prevToMarkRef.current = gameState.toMark;
	}, [gameState.toMark, gameState.status, props.resultHref, t]);

	const actionLabel = useMemo(() => {
		if (gameState.status === 'running') return t('pause');
		return t('resume');
	}, [gameState.status, t]);
	const actionIcon =
		gameState.status === 'running' ? (
			<Pause className="size-4" />
		) : (
			<Play className="size-4" />
		);

	const showActionButton =
		gameState.status === 'running' || gameState.status === 'paused';
	const sessionLabel =
		gameState.score.total === 0
			? mapDisplayMode === 'terrain'
				? t('terrainWarmup')
				: t('openingRun')
			: mapDisplayMode === 'terrain'
				? t('terrainChain')
				: t('flashChain');
	const modeLabel =
		mapDisplayMode === 'terrain' ? t('terrainMode') : t('flashMode');
	const idleHint =
		mapDisplayMode === 'terrain' ? t('terrainRules') : t('flashRules');
	const targetLabel = gameState.toMark
		? localizePlace(gameState.toMark.name, props.placeNameMap ?? null)
		: null;
	const campaignDialogue = useMemo(() => {
		if (!props.campaign || !props.campaignRunState) return null;

		return deriveCampaignDialogueFrame({
			campaign: props.campaign,
			mission: props.campaignMission ?? null,
			targetLabel: targetLabel ?? null,
			selectedRegionLabel: props.campaignSelectedRegionLabel ?? null,
			hasResult: Boolean(info),
			isCorrect: info?.isCorrect ?? false
		});
	}, [
		props.campaign,
		props.campaignMission,
		props.campaignRunState,
		props.campaignSelectedRegionLabel,
		targetLabel,
		info
	]);
	const primaryLabel = campaignDialogue
		? campaignDialogue.actionLabel
		: info
			? t('nextTarget')
			: t('lockGuess');

	const handleSatelliteHint = () => {
		if (!gameState.toMark || hintUsedThisTurn) return;

		const didDeduct = deductCredit();
		if (!didDeduct) {
			addToast({
				color: 'warning',
				title: t('noSatelliteHintsTitle'),
				description: t('noSatelliteHintsDescription')
			});
			return;
		}

		const { strictness, mode } = gameState;
		let zoom = 9;
		if (mode === 'world') {
			const isMicroTarget = isWorldMicroRegionPlace(gameState.toMark);
			zoom = isMicroTarget
				? strictness <= 300000
					? 8
					: 6
				: strictness <= 300000
					? 7
					: 5;
		} else {
			zoom = strictness <= 50000 ? 12 : strictness <= 150000 ? 9 : 6;
		}

		onSatelliteHint(
			gameState.toMark.latitude,
			gameState.toMark.longitude,
			zoom
		);
		setHintUsedThisTurn(true);
	};

	return (
		<div className="pointer-events-none absolute inset-0 z-30">
			<div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5 sm:gap-2 sm:left-5 sm:top-5">
				<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/14 bg-slate-950/72 px-2.5 py-1 sm:px-3 sm:py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
					<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-sky-200/90">
						{t('mode')}
					</span>
					<span className="text-xs sm:text-sm font-semibold text-white">
						{modeLabel}
					</span>
				</div>
				<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/14 bg-slate-950/72 px-2.5 py-1 sm:px-3 sm:py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
					<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300/90">
						{t('session')}
					</span>
					<span className="text-xs sm:text-sm font-semibold text-white">
						{sessionLabel}
					</span>
				</div>
			</div>

			<AnimatePresence>
				{props.campaign &&
					props.campaignRunState &&
					gameState.status !== 'idle' &&
					gameState.toMark && (
						<CampaignTacticalCard
							campaign={props.campaign}
							runtime={props.campaignRunState}
							mission={props.campaignMission ?? null}
							selectedRegionLabel={
								props.campaignSelectedRegionLabel
							}
							targetLabel={targetLabel}
							info={info}
						/>
					)}
			</AnimatePresence>

			<div className="absolute bottom-[4.8rem] right-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-end gap-2 sm:bottom-5 sm:right-5">
				{props.campaignRunState && (
					<CampaignProgressBadge runtime={props.campaignRunState} />
				)}
				<HeatBadge streak={gameState.streak} />
				<StreakBadge streak={gameState.streak} />
				<ScorePill
					current={gameState.score.current}
					total={gameState.score.total}
				/>
				<TimerComp timer={gameState.timer} />
			</div>

			<div className="absolute inset-x-0 bottom-0 safe-area-bottom">
				<div className="relative flex flex-col items-center px-3 pb-2.5 sm:px-5 sm:pb-4">
					<AnimatePresence>
						{info ? (
							<motion.div
								key="feedback"
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 6 }}
								className="absolute bottom-full mb-2 left-0 right-0 flex justify-center pointer-events-none"
							>
								<DistanceFeedback info={info} />
							</motion.div>
						) : gameState.status === 'idle' ? (
							<motion.p
								key="idle-hint"
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 6 }}
								className="absolute bottom-full mb-2 left-0 right-0 text-center rounded-full border border-slate-900/10 bg-[rgba(255,255,255,0.78)] mx-3 px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
							>
								{idleHint}
							</motion.p>
						) : null}
					</AnimatePresence>

					<div className="pointer-events-auto flex w-full max-w-lg items-center justify-center gap-2 sm:w-auto">
						{gameState.status === 'running' && gameState.toMark && (
							<Button
								radius="full"
								size="md"
								variant="flat"
								className="border border-white/45 bg-[rgba(255,255,255,0.72)] px-4 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-md"
								isDisabled={
									hintUsedThisTurn || creditBalance <= 0
								}
								onPress={handleSatelliteHint}
								startContent={<Satellite className="size-4" />}
							>
								{t('satelliteHint')}
							</Button>
						)}
						{showActionButton && (
							<Button
								radius="full"
								variant="flat"
								size="md"
								className="min-w-[100px] border border-white/65 bg-[rgba(255,255,255,0.74)] px-4 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-md"
								onPress={() => {
									if (gameState.status === 'running') {
										gameState.pause();
									} else if (gameState.status === 'paused') {
										gameState.resume();
									}
								}}
								isDisabled={
									gameState.currentMarker === 'submitted'
								}
								startContent={actionIcon}
							>
								{actionLabel}
							</Button>
						)}

						<Button
							radius="full"
							size="md"
							className={`flex-1 bg-[linear-gradient(135deg,#0f172a,#0f766e)] px-6 font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.28)] ${
								showActionButton
									? 'sm:min-w-[192px]'
									: 'w-full sm:min-w-[220px]'
							}`}
							onPress={() => {
								if (info) {
									gameState.next(info);
									setInfo(null);
								} else {
									const newInfo = gameState.submitMarker();
									setInfo(newInfo);
								}
							}}
							isDisabled={
								gameState.currentMarker === 'none' ||
								gameState.status === 'idle'
							}
							startContent={
								info ? (
									<ArrowRight className="size-4" />
								) : (
									<Send className="size-4" />
								)
							}
						>
							{primaryLabel}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameBar;
