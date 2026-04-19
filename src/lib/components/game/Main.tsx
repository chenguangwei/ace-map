'use client';
import { Spinner } from '@heroui/spinner';
import {
	BarChart3,
	Crosshair,
	Map as MapIcon,
	MapPin,
	Mountain,
	Play,
	Radio,
	RotateCcw,
	Volume2,
	WandSparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { useMapVoice } from '@/lib/audio/useMapVoice';
import { useAnalytics } from '@/lib/components/AnalyticsProvider';
import { getCountryByCode } from '@/lib/data/countries';
import {
	getQuizTopicBySlug,
	inferTopicSlugFromGameConfig,
	type QuizGameConfig
} from '@/lib/data/quizTopics';
import { getCountryRegions, worldPlaces } from '@/lib/data/regions';
import { getTerrainBasemapConfig } from '@/lib/maps/basemaps';
import { saveLastSessionTopic } from '@/lib/utils/challenge';
import { getHeatLevel, type SubmitInfo, useGame, weightedShufflePlaces } from '@/lib/utils/game';
import {
	buildActivityHotspots,
	type MapDisplayMode
} from '@/lib/utils/mapActivity';
import { type GameMode, Strictness, WorldStrictness } from '@/lib/utils/places';
import {
	buildMistakePlaceSource,
	getMistakesForTopic,
	readMistakeEntries,
	saveMistakeEntry,
	writeMistakeEntries
} from '@/lib/utils/review';
import { getTerrainHintPack } from '@/lib/utils/terrainHints';
import { recordTopicObservabilityEvent } from '@/lib/utils/topicObservability';
import GameBar from './GameBar';

const Game = dynamic(() => import('@/lib/components/game/Game'), {
	ssr: false,
	loading: () => (
		<Spinner size="lg" color="secondary" aria-label="Map loading..." />
	)
});

export interface InfoState {
	info: SubmitInfo | null;
	setInfo: Dispatch<SetStateAction<SubmitInfo | null>>;
}

const Main = (props: {
	initialConfig?: QuizGameConfig;
	topicSlug?: string;
}) => {
	const gameState = useGame();
	const analytics = useAnalytics();
	const voice = useMapVoice();
	const [infoState, setInfoState] = useState<SubmitInfo | null>(null);
	const [focusRequest, setFocusRequest] = useState(0);
	const [isReady, setIsReady] = useState(false);
	const [mapDisplayMode, setMapDisplayMode] =
		useState<MapDisplayMode>('play');
	const [selectedRegionLabel, setSelectedRegionLabel] = useState<
		string | null
	>(null);
	const [satelliteHintUrl, setSatelliteHintUrl] = useState<string | null>(
		null
	);
	const [terrainHintLevel, setTerrainHintLevel] = useState<0 | 1 | 2>(0);
	const terrainBasemap = useMemo(() => getTerrainBasemapConfig(), []);
	const previousPromptRef = useRef<string | null>(null);
	const previousInfoRef = useRef<SubmitInfo | null>(null);
	const searchParams = useSearchParams();
	const {
		setCategory,
		setCountryCode,
		setMode,
		setPlaceSource,
		setStrictness
	} = gameState;
	const topicSlugFromQuery =
		typeof searchParams.get('topic') === 'string'
			? searchParams.get('topic')
			: undefined;
	const activeTopicSlug = useMemo(() => {
		if (props.topicSlug) return props.topicSlug;
		if (topicSlugFromQuery) return topicSlugFromQuery;
		if (props.initialConfig)
			return inferTopicSlugFromGameConfig(props.initialConfig);
		return null;
	}, [props.initialConfig, props.topicSlug, topicSlugFromQuery]);

	useEffect(() => {
		saveLastSessionTopic(activeTopicSlug);
	}, [activeTopicSlug]);

	useEffect(() => {
		const isMistakeReview = searchParams.get('review') === 'mistakes';
		const reviewTopic = activeTopicSlug
			? getQuizTopicBySlug(activeTopicSlug)
			: null;
		const reviewSource =
			isMistakeReview && reviewTopic
				? buildMistakePlaceSource(getMistakesForTopic(reviewTopic.slug))
				: [];

		const baseConfig = reviewTopic?.gameConfig ?? props.initialConfig;
		const modeParam = (baseConfig?.mode ??
			searchParams.get('mode') ??
			'india') as GameMode;
		const countryParam =
			baseConfig?.countryCode ?? searchParams.get('country') ?? 'in';
		const categoryParam =
			baseConfig?.category ?? searchParams.get('category') ?? 'all';
		const strictnessParam = baseConfig?.strictness
			? String(baseConfig.strictness)
			: searchParams.get('strictness');

		const arrayfied: 'all' | string[] =
			categoryParam === 'all'
				? 'all'
				: Array.from(
						new Set(
							(typeof categoryParam === 'string'
								? decodeURIComponent(categoryParam)
								: categoryParam.join(',')
							).split(',')
						)
					);

		// Set mode
		setMode(modeParam);
		setCountryCode(countryParam);
		setCategory(reviewSource.length > 0 ? 'all' : arrayfied);

		// Load place source based on mode
		if (reviewSource.length > 0 && reviewTopic) {
			setPlaceSource(reviewSource);
			setStrictness(reviewTopic.gameConfig.strictness);
		} else if (modeParam === 'world') {
			setPlaceSource(worldPlaces);
			const defaultStrictness = strictnessParam
				? Number(strictnessParam)
				: WorldStrictness.Medium;
			setStrictness(defaultStrictness);
		} else if (modeParam === 'country') {
			const regions = getCountryRegions(countryParam);
			setPlaceSource(regions);
			const country = getCountryByCode(countryParam);
			const baseStrictness = Strictness.Medium;
			const multiplier = country?.strictnessMultiplier ?? 1;
			const defaultStrictness = strictnessParam
				? Number(strictnessParam)
				: Math.round(baseStrictness * multiplier);
			setStrictness(defaultStrictness);
		} else {
			// india mode — use predefined places (empty placeSource = use default)
			setPlaceSource([]);
			const defaultStrictness = strictnessParam
				? Number(strictnessParam)
				: Strictness.Medium;
			setStrictness(defaultStrictness);
		}
		setIsReady(true);
	}, [
		activeTopicSlug,
		props.initialConfig,
		searchParams,
		setCategory,
		setCountryCode,
		setMode,
		setPlaceSource,
		setStrictness
	]);

	useEffect(() => {
		if (!infoState || infoState.isCorrect || !activeTopicSlug) return;

		saveMistakeEntry({
			topicSlug: activeTopicSlug,
			place: infoState.toMark,
			distance: infoState.distance,
			createdAt: new Date().toISOString()
		});
	}, [activeTopicSlug, infoState]);

	useEffect(() => {
		setSatelliteHintUrl(null);
	}, [gameState.toMark]);

	useEffect(() => {
		const isMistakeReview = searchParams.get('review') === 'mistakes';
		if (
			!isMistakeReview ||
			!infoState ||
			!infoState.isCorrect ||
			!activeTopicSlug
		) {
			return;
		}

		const currentMistakes = readMistakeEntries();
		const matchedMistake = currentMistakes.find(
			(entry) =>
				entry.topicSlug === activeTopicSlug &&
				entry.place.name === infoState.toMark.name &&
				entry.place.latitude === infoState.toMark.latitude &&
				entry.place.longitude === infoState.toMark.longitude
		);

		if (!matchedMistake) return;

		const nextLocalMistakes = currentMistakes.filter(
			(entry) =>
				!(
					entry.topicSlug === activeTopicSlug &&
					entry.place.name === infoState.toMark.name &&
					entry.place.latitude === infoState.toMark.latitude &&
					entry.place.longitude === infoState.toMark.longitude
				)
		);

		writeMistakeEntries(nextLocalMistakes);

		void analytics.resolveMistake(matchedMistake);
	}, [activeTopicSlug, analytics, infoState, searchParams]);

	const showOverlayStart = useMemo(
		() =>
			gameState.status === 'idle' ||
			(gameState.toMark === null && gameState.status === 'running'),
		[gameState.status, gameState.toMark]
	);

	const overlayLabel = useMemo(() => {
		if (gameState.toMark === null && gameState.status === 'running') {
			return mapDisplayMode === 'terrain'
				? 'Run Terrain Again'
				: 'Run Again';
		}
		return mapDisplayMode === 'terrain'
			? 'Start Terrain Run'
			: 'Start Flash Run';
	}, [gameState.status, gameState.toMark, mapDisplayMode]);

	const heatLevel = useMemo(
		() => getHeatLevel(gameState.streak),
		[gameState.streak]
	);

	const activityHotspots = useMemo(
		() => buildActivityHotspots(analytics.snapshot),
		[analytics.snapshot]
	);
	const handleSatelliteHint = (lat: number, lng: number, zoom: number): void => {
		const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
		if (!token) return;

		setSatelliteHintUrl(
			`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom}/400x300@2x?access_token=${token}`
		);
	};
	const terrainHintPack = useMemo(() => {
		if (mapDisplayMode !== 'terrain' || !gameState.toMark) return null;

		return getTerrainHintPack({
			mode: gameState.mode,
			countryCode: gameState.countryCode,
			category: gameState.category,
			place: gameState.toMark
		});
	}, [
		gameState.category,
		gameState.countryCode,
		gameState.mode,
		gameState.toMark,
		mapDisplayMode
	]);

	useEffect(() => {
		const nextPrompt =
			gameState.status === 'running' && gameState.toMark
				? gameState.toMark.name
				: null;

		if (!nextPrompt) {
			previousPromptRef.current = null;
			return;
		}

		if (previousPromptRef.current === nextPrompt) return;

		setSelectedRegionLabel(null);
		setTerrainHintLevel(0);
		voice.speak(nextPrompt, {
			priority: 'prompt',
			rate: 0.96,
			pitch: 0.98
		});
		previousPromptRef.current = nextPrompt;
	}, [gameState.status, gameState.toMark, voice]);

	useEffect(() => {
		if (!infoState || previousInfoRef.current === infoState) return;

		if (infoState.isCorrect) {
			const streakCallout =
				gameState.streak >= 3
					? `Streak ${gameState.streak}`
					: 'Correct';
			voice.speak(streakCallout, {
				priority: gameState.streak >= 3 ? 'hype' : 'feedback',
				rate: 1.04,
				pitch: gameState.streak >= 3 ? 1.14 : 1.02
			});
		} else {
			voice.speak(infoState.toMark.name, {
				priority: 'feedback',
				rate: 0.94,
				pitch: 0.92
			});
		}

		previousInfoRef.current = infoState;
	}, [gameState.streak, infoState, voice]);

	useEffect(() => {
		if (infoState === null) {
			previousInfoRef.current = null;
		}
	}, [infoState]);

	useEffect(() => {
		if (mapDisplayMode === 'terrain' && !terrainBasemap) {
			setMapDisplayMode('play');
		}
	}, [mapDisplayMode, terrainBasemap]);

	useEffect(() => {
		if (mapDisplayMode !== 'terrain') {
			setTerrainHintLevel(0);
		}
	}, [mapDisplayMode]);

	const handlePrimaryStart = () => {
		const activeTopic = activeTopicSlug
			? getQuizTopicBySlug(activeTopicSlug)
			: null;

		if (activeTopicSlug && activeTopic) {
			recordTopicObservabilityEvent({
				topicSlug: activeTopicSlug,
				topicKind: activeTopic.kind,
				countryCode: activeTopic.countryCode ?? null,
				eventType: 'play_start',
				source: props.topicSlug ? 'topic-page-embedded' : 'game-page',
				target:
					gameState.toMark === null && gameState.status === 'running'
						? 'play-again'
						: 'start-game'
			});
		}

		const pulseOrdered =
			mapDisplayMode === 'pulse' && gameState.mode === 'world'
				? weightedShufflePlaces(
						gameState.availablePlaces,
						activityHotspots
					)
				: undefined;

		if (gameState.toMark === null && gameState.status === 'running') {
			gameState.resetAndStart(pulseOrdered);
			return;
		}
		if (gameState.status === 'idle') {
			gameState.start(pulseOrdered);
		}
	};

	return (
		<div className="grow flex size-full items-center justify-center overflow-hidden px-3 pb-3 sm:px-5 sm:pb-5">
			<div
				className={`relative size-full overflow-hidden rounded-[28px] border bg-white/75 backdrop-blur-sm ${
					heatLevel === 'overdrive'
						? 'border-orange-300/80 shadow-[0_20px_70px_rgba(249,115,22,0.26)] ring-1 ring-orange-100/80'
						: heatLevel === 'heated'
							? 'border-amber-300/80 shadow-[0_18px_60px_rgba(245,158,11,0.22)] ring-1 ring-amber-100/80'
							: heatLevel === 'warm'
								? 'border-sky-300/80 shadow-[0_18px_54px_rgba(14,165,233,0.18)] ring-1 ring-white/70'
								: 'border-sky-200/80 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-white/70'
				}`}
			>
				<div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_62%)]" />
				<div className="box-border size-full pb-20 sm:pb-24">
					{isReady ? (
						<Game
							gameState={gameState}
							info={infoState}
							setInfo={setInfoState}
							focusRequest={focusRequest}
							mapDisplayMode={mapDisplayMode}
							activityHotspots={activityHotspots}
							satelliteHintUrl={satelliteHintUrl}
							onSatelliteHintDismiss={() =>
								setSatelliteHintUrl(null)
							}
							onRegionLabelSelect={(label) => {
								setSelectedRegionLabel(label);
								if (!label) return;
								voice.speak(label, {
									priority: 'feedback',
									rate: 0.98,
									pitch: 1
								});
							}}
						/>
					) : (
						<div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_58%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(241,245,249,0.94))]">
							<Spinner
								size="lg"
								color="primary"
								aria-label="Preparing map..."
							/>
						</div>
					)}

					<div className="pointer-events-none absolute inset-0">
						<div className="pointer-events-auto absolute right-3 top-3 flex max-w-[min(13rem,calc(100%-1.5rem))] sm:max-w-[min(19rem,calc(100%-1.5rem))] flex-col items-end gap-1.5 sm:gap-2 sm:right-5 sm:top-5">
							{gameState.toMark &&
								gameState.status !== 'idle' && (
									<div className="w-full rounded-[24px] border border-slate-900/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72))] px-3 py-2.5 sm:px-4 sm:py-3.5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)] backdrop-blur-md">
										<div className="mb-2 sm:mb-3 flex items-center justify-between gap-3">
											<span className="rounded-full border border-white/16 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-sky-100">
												{mapDisplayMode === 'terrain'
													? 'Terrain Sense'
													: 'Flash Run'}
											</span>
											<div className="flex items-center gap-2">
												<span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
													<Radio className="size-3" />
													Live
												</span>
												{voice.isSupported && (
													<button
														type="button"
														onClick={() => {
															const targetName =
																gameState.toMark
																	?.name;
															if (!targetName)
																return;

															voice.speak(
																targetName,
																{
																	priority:
																		'prompt',
																	rate: 0.96,
																	pitch: 0.98
																}
															);
														}}
														className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-slate-100 transition hover:bg-white/14 cursor-pointer"
														aria-label={`Replay prompt for ${gameState.toMark.name}`}
													>
														<Volume2 className="size-4" />
													</button>
												)}
											</div>
										</div>
										<div className="flex items-start gap-3">
											<span
												className={`mt-0.5 rounded-2xl p-2 sm:p-2.5 text-white shadow-[0_12px_24px_rgba(6,182,212,0.26)] ${
													mapDisplayMode === 'terrain'
														? 'bg-[linear-gradient(145deg,#f59e0b,#854d0e)] shadow-[0_12px_24px_rgba(245,158,11,0.26)]'
														: 'bg-[linear-gradient(145deg,#38bdf8,#0f766e)]'
												}`}
											>
												{mapDisplayMode ===
												'terrain' ? (
													<Mountain
														className="size-4"
														strokeWidth={2}
													/>
												) : (
													<MapPin
														className="size-4"
														strokeWidth={2}
													/>
												)}
											</span>
											<div className="min-w-0">
												<p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-100/80">
													{mapDisplayMode ===
													'terrain'
														? 'Terrain read'
														: 'Lock target'}
												</p>
												<p className="truncate text-base sm:text-xl font-black leading-tight text-white">
													{gameState.toMark.name}
												</p>
												<p className="hidden sm:block mt-1 text-xs font-medium text-slate-300">
													{mapDisplayMode ===
													'terrain'
														? 'Read the land first, then trust the terrain and send the guess.'
														: 'Tap fast, trust your map read, then send the guess.'}
												</p>
												{terrainHintPack && (
													<div className="mt-2 space-y-2">
														<div className="flex flex-wrap items-center gap-2">
															<p className="inline-flex items-center rounded-full border border-amber-200/20 bg-amber-50/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100/90">
																{
																	terrainHintPack.cueLabel
																}
															</p>
															{terrainHintLevel <
																2 && (
																<button
																	type="button"
																	onClick={() => {
																		const nextLevel =
																			Math.min(
																				2,
																				terrainHintLevel +
																					1
																			) as
																				| 0
																				| 1
																				| 2;
																		setTerrainHintLevel(
																			nextLevel
																		);
																		if (
																			nextLevel ===
																			1
																		) {
																			voice.speak(
																				terrainHintPack.primary,
																				{
																					priority:
																						'feedback',
																					rate: 0.96,
																					pitch: 0.96
																				}
																			);
																		}
																	}}
																	className="inline-flex items-center gap-1 rounded-full border border-amber-200/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/16 cursor-pointer"
																>
																	<WandSparkles className="size-3" />
																	<span>
																		{terrainHintLevel ===
																		0
																			? 'Reveal clue'
																			: 'Deepen read'}
																	</span>
																</button>
															)}
														</div>
														{terrainHintLevel ===
															0 && (
															<p className="text-[11px] font-medium text-slate-300">
																Start with the
																cue only. Reveal
																more terrain
																context if the
																read is still
																fuzzy.
															</p>
														)}
														{terrainHintLevel >=
															1 && (
															<p className="text-xs font-semibold text-amber-100">
																{
																	terrainHintPack.primary
																}
															</p>
														)}
														{terrainHintLevel >=
															2 && (
															<>
																<p className="text-[11px] font-medium text-slate-300">
																	{
																		terrainHintPack.secondary
																	}
																</p>
																<div className="flex flex-wrap gap-1.5">
																	{terrainHintPack.tags.map(
																		(
																			tag
																		) => (
																			<span
																				key={
																					tag
																				}
																				className="rounded-full border border-amber-200/20 bg-amber-50/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100/90"
																			>
																				{
																					tag
																				}
																			</span>
																		)
																	)}
																</div>
															</>
														)}
													</div>
												)}
												{selectedRegionLabel && (
													<p className="mt-2 inline-flex items-center rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
														Selected:{' '}
														<span className="ml-1 font-black text-white">
															{
																selectedRegionLabel
															}
														</span>
													</p>
												)}
											</div>
										</div>
									</div>
								)}

							<button
								type="button"
								onClick={() =>
									setFocusRequest((value) => value + 1)
								}
								className="inline-flex items-center gap-0 sm:gap-2 rounded-full border border-sky-200/80 bg-white/90 p-2 sm:px-4 sm:py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition hover:border-sky-300 hover:text-slate-900 cursor-pointer"
							>
								<Crosshair
									className="size-4 text-sky-700"
									strokeWidth={2}
								/>
								<span className="hidden sm:inline">Re-center</span>
							</button>

							<div className="w-full rounded-[22px] border border-slate-900/10 bg-white/88 p-1.5 sm:p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-md">
								<div className="hidden sm:flex mb-2 items-center justify-between gap-3 px-1">
									<p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
										Map Layer
									</p>
									<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
										{activityHotspots.length} signals
									</p>
								</div>
								<div
									className={`grid gap-2 ${
										terrainBasemap
											? 'grid-cols-3'
											: 'grid-cols-2'
									}`}
								>
									{[
										{
											id: 'play' as const,
											label: 'Play',
											icon: MapIcon
										},
										{
											id: 'pulse' as const,
											label: 'Pulse',
											icon: BarChart3
										},
										...(terrainBasemap
											? [
													{
														id: 'terrain' as const,
														label: terrainBasemap.label,
														icon: Mountain
													}
												]
											: [])
									].map((option) => {
										const isActive =
											mapDisplayMode === option.id;
										const Icon = option.icon;
										return (
											<button
												key={option.id}
												type="button"
												onClick={() =>
													setMapDisplayMode(option.id)
												}
												className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 sm:px-2 sm:py-2.5 text-xs font-semibold transition cursor-pointer ${
													isActive
														? 'border-slate-900 bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]'
														: 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-slate-950'
												}`}
											>
												<Icon className="size-4" />
												<span className="hidden sm:inline">{option.label}</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>

						{showOverlayStart && isReady && (
							<div className="pointer-events-auto absolute inset-0 flex items-center justify-center px-4">
								<button
									type="button"
									onClick={handlePrimaryStart}
									className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] px-7 py-4 text-base font-semibold text-white shadow-[0_26px_70px_rgba(15,23,42,0.34)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sky-300/60 hover:shadow-[0_34px_80px_rgba(14,116,144,0.26)] cursor-pointer sm:px-8"
								>
									{overlayLabel === 'Run Again' ? (
										<RotateCcw
											className="size-5 text-sky-300"
											strokeWidth={2.2}
										/>
									) : (
										<Play
											className="size-5 text-sky-300"
											strokeWidth={2.2}
										/>
									)}
									<span>{overlayLabel}</span>
								</button>
							</div>
						)}
					</div>
				</div>
				<GameBar
					gameState={gameState}
					info={infoState}
					mapDisplayMode={mapDisplayMode}
					onSatelliteHint={handleSatelliteHint}
					setInfo={setInfoState}
				/>
			</div>
		</div>
	);
};

export default Main;
