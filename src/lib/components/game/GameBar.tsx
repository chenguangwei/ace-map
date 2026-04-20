'use client';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { addToast } from '@heroui/toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowRight,
	CheckCircle,
	Clock,
	Flame,
	Pause,
	Play,
	Satellite,
	Send,
	Target,
	XCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
	deductCredit,
	getBalance,
	subscribeToCredits
} from '@/lib/utils/credits';
import { encodeResult, type GameState, getHeatLevel } from '@/lib/utils/game';
import { localizePlace } from '@/lib/utils/localizePlace';
import type { MapDisplayMode } from '@/lib/utils/mapActivity';
import { formatDistance } from '@/lib/utils/places';
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

const DistanceFeedback = ({
	info
}: {
	info: NonNullable<InfoState['info']>;
}) => (
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
					? 'Correct region ✓'
					: `${formatDistance(info.distance)} away`
				: info.isCorrect
					? `${formatDistance(info.distance)} off ✓`
					: `${formatDistance(info.distance)} away`}
		</span>
	</div>
);

const MotionLink = motion.create(Link);

const GameBar = (
	props: InfoState & {
		gameState: GameState;
		mapDisplayMode: MapDisplayMode;
		onSatelliteHint: (lat: number, lng: number, zoom: number) => void;
		placeNameMap?: Record<string, string> | null;
	}
) => {
	const { gameState, info, mapDisplayMode, onSatelliteHint, setInfo, placeNameMap } = props;
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
		setHintUsedThisTurn(false);
	}, [gameState.toMark]);

	useEffect(() => {
		// Only trigger game-over when transitioning from having a place → null while running
		if (
			prevToMarkRef.current !== null &&
			gameState.toMark === null &&
			gameState.status === 'running'
		) {
			const resultCode = encodeResult(gameStateRef.current);
			gameStateRef.current.reset();

			addToast({
				color: 'success',
				title: 'Game Over!',
				description: (
					<MotionLink
						href={`/?code=${resultCode}`}
						color="success"
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
						View your result →
					</MotionLink>
				),
				timeout: 20000
			});
		}
		prevToMarkRef.current = gameState.toMark;
	}, [gameState.toMark, gameState.status]);

	const actionLabel = useMemo(() => {
		if (gameState.status === 'running') return 'Pause';
		return 'Resume';
	}, [gameState.status]);
	const actionIcon =
		gameState.status === 'running' ? (
			<Pause className="size-4" />
		) : (
			<Play className="size-4" />
		);

	const showActionButton =
		gameState.status === 'running' || gameState.status === 'paused';
	const t = useTranslations('GameBar');
	const sessionLabel =
		gameState.score.total === 0
			? mapDisplayMode === 'terrain'
				? t('terrainWarmup')
				: 'Opening run'
			: mapDisplayMode === 'terrain'
				? 'Terrain chain'
				: 'Flash chain';
	const modeLabel = mapDisplayMode === 'terrain' ? 'Terrain' : 'Flash';
	const idleHint =
		mapDisplayMode === 'terrain'
			? 'Terrain rules: read the relief, lock the region, send fast.'
			: 'Flash rules: hear the target, lock the spot, send fast.';

	const handleSatelliteHint = () => {
		if (!gameState.toMark || hintUsedThisTurn) return;

		const didDeduct = deductCredit();
		if (!didDeduct) {
			addToast({
				color: 'warning',
				title: 'No satellite hints left today',
				description: 'Refills automatically tomorrow, or purchase more credits'
			});
			return;
		}

		const { strictness, mode } = gameState;
		let zoom = 9;
		if (mode === 'world') {
			zoom = strictness <= 300000 ? 7 : 5;
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
						Mode
					</span>
					<span className="text-xs sm:text-sm font-semibold text-white">
						{modeLabel}
					</span>
				</div>
				<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/14 bg-slate-950/72 px-2.5 py-1 sm:px-3 sm:py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
					<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300/90">
						Session
					</span>
					<span className="text-xs sm:text-sm font-semibold text-white">
						{sessionLabel}
					</span>
				</div>
			</div>

			<div className="absolute bottom-[4.8rem] right-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-end gap-2 sm:bottom-5 sm:right-5">
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
								Satellite Hint · 🪙1
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
							{info ? 'Next Target' : 'Lock Guess'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameBar;
