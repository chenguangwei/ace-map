'use client';
import type { Map as MapLibreMap } from 'maplibre-gl';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _Map, {
	Marker as _Marker,
	Layer,
	type MapLayerMouseEvent,
	type MapRef,
	NavigationControl,
	Popup,
	ScaleControl,
	Source
} from 'react-map-gl/maplibre';
import { getCountryByCode } from '@/lib/data/countries';
import {
	getContinentScopeForWorldPlace,
	getMapScopeForGame,
	mapBoundsToFeatureCollection,
	mapBoundsToLngLatBounds
} from '@/lib/data/mapScopes';
import {
	applyGlobeTerrain,
	applyPulseStyleOverrides,
	GLOBE_SKY_CONFIG,
	getMapStyleForMode,
	getTerrainBasemapConfig
} from '@/lib/maps/basemaps';
import {
	getCountryRegionSource,
	getCountryRegionStaticSource,
	resolveCountryFeatureSelection,
	resolveCountryPlaceSelection
} from '@/lib/utils/countryRegions';
import type { GameState } from '@/lib/utils/game';
import {
	type ActivityHotspot,
	buildActivityPulseCollection,
	type MapDisplayMode
} from '@/lib/utils/mapActivity';
import { getMapViewForGame } from '@/lib/utils/mapView';
import type { PlaceWithoutName } from '@/lib/utils/places';
import { formatDistance } from '@/lib/utils/places';
import {
	isWorldMicroRegionPlace,
	resolveWorldFeatureNameForPlace,
	resolveWorldFeatureSelection,
	resolveWorldPlaceSelection,
	worldMicroRegionFeatureCollection
} from '@/lib/utils/worldRegions';
import { Show } from '../Flow';
import type { InfoState } from './Main';
import Pin from './Pin';

const getBoundsCenter = (bounds: {
	west: number;
	south: number;
	east: number;
	north: number;
}) => ({
	latitude: (bounds.north + bounds.south) / 2,
	longitude: (bounds.east + bounds.west) / 2
});

const hideSymbolLayers = (map: MapLibreMap) => {
	for (const layer of map.getStyle().layers ?? []) {
		if (layer.type === 'symbol') {
			map.setLayoutProperty(layer.id, 'visibility', 'none');
		}
	}
};

const isWithinBounds = (
	hotspot: Pick<ActivityHotspot, 'latitude' | 'longitude'>,
	bounds: {
		west: number;
		south: number;
		east: number;
		north: number;
	}
) =>
	hotspot.longitude >= bounds.west &&
	hotspot.longitude <= bounds.east &&
	hotspot.latitude >= bounds.south &&
	hotspot.latitude <= bounds.north;

const MarkerTag = ({
	label,
	tone
}: {
	label: string;
	tone: 'guess' | 'correct';
}) => (
	<div
		className={`rounded-full border px-3 py-1 text-[11px] font-bold shadow-lg backdrop-blur-sm ${
			tone === 'guess'
				? 'border-orange-300/90 bg-white/95 text-orange-700'
				: 'border-emerald-300/90 bg-emerald-50/95 text-emerald-800'
		}`}
	>
		{label}
	</div>
);

const ResultLine = ({
	info,
	isTerrainMode
}: {
	info: NonNullable<InfoState['info']>;
	isTerrainMode: boolean;
}) => (
	<Source
		id="result-line-source"
		type="geojson"
		data={{
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: [
							[info.guess.longitude, info.guess.latitude],
							[info.toMark.longitude, info.toMark.latitude]
						]
					},
					properties: {}
				}
			]
		}}
	>
		<Layer
			id="result-line"
			type="line"
			paint={{
				'line-color': isTerrainMode
					? info.isCorrect
						? '#f8fafc'
						: '#f59e0b'
					: info.isCorrect
						? '#16a34a'
						: '#ea580c',
				'line-width': isTerrainMode ? 2.4 : 3,
				'line-opacity': isTerrainMode ? 0.72 : 0.85,
				'line-dasharray': isTerrainMode ? [1.1, 1.8] : [2, 1.5]
			}}
		/>
	</Source>
);

const Marker = (
	props: InfoState & {
		gameState: GameState;
	}
) => {
	const t = useTranslations('GameOverlay');
	const submittedInfo = props.info;

	return (
		<>
			<Show
				condition={
					!['none', 'submitted'].includes(
						props.gameState.currentMarker as string
					)
				}
			>
				<_Marker
					anchor="bottom"
					latitude={
						(props.gameState.currentMarker as PlaceWithoutName)
							.latitude
					}
					longitude={
						(props.gameState.currentMarker as PlaceWithoutName)
							.longitude
					}
				>
					<div className="drop-shadow-[0_10px_18px_rgba(220,38,38,0.28)]">
						<Pin size={26} />
					</div>
				</_Marker>
			</Show>
			<Show condition={submittedInfo !== null}>
				<_Marker
					latitude={submittedInfo?.guess.latitude as number}
					longitude={submittedInfo?.guess.longitude as number}
					anchor="bottom"
				>
					<div className="flex flex-col items-center gap-2">
						<MarkerTag
							tone="guess"
							label={`${submittedInfo?.isCorrect ? t('correct') : t('wrong')} • ${formatDistance(
								submittedInfo?.distance as number
							)}`}
						/>
						<div className="drop-shadow-[0_10px_18px_rgba(249,115,22,0.28)]">
							<Pin size={26} style={{ fill: '#f97316' }} />
						</div>
					</div>
				</_Marker>
				<_Marker
					latitude={submittedInfo?.toMark.latitude as number}
					longitude={submittedInfo?.toMark.longitude as number}
					anchor="bottom"
				>
					<div className="flex flex-col items-center gap-2">
						<MarkerTag
							tone="correct"
							label={t('correctLocation')}
						/>
						<div className="drop-shadow-[0_10px_18px_rgba(22,163,74,0.26)]">
							<Pin size={26} style={{ fill: '#16a34a' }} />
						</div>
					</div>
				</_Marker>
			</Show>
		</>
	);
};

const Game = (
	props: InfoState & {
		gameState: GameState;
		focusRequest: number;
		mapDisplayMode: MapDisplayMode;
		activityHotspots: ActivityHotspot[];
		satelliteHintUrl: string | null;
		onSatelliteHintDismiss: () => void;
		onRegionLabelSelect: (label: string | null) => void;
	}
) => {
	const mapRef = useRef<MapRef>(null);
	const previousInfoRef = useRef<InfoState['info']>(props.info);
	const [selectedHotspot, setSelectedHotspot] =
		useState<ActivityHotspot | null>(null);
	const [selectedWorldFeatureName, setSelectedWorldFeatureName] = useState<
		string | null
	>(null);
	const [hoveredWorldFeatureName, setHoveredWorldFeatureName] = useState<
		string | null
	>(null);
	const [selectedCountryFeatureName, setSelectedCountryFeatureName] =
		useState<string | null>(null);
	const [hoveredCountryFeatureName, setHoveredCountryFeatureName] = useState<
		string | null
	>(null);
	const [pulseTick, setPulseTick] = useState(0);
	const [microTargetPulseTick, setMicroTargetPulseTick] = useState(0);
	const [isCompactViewport, setIsCompactViewport] = useState(false);
	const terrainBasemap = useMemo(() => getTerrainBasemapConfig(), []);
	const { mode, countryCode, category } = props.gameState;
	const isTerrainMode = props.mapDisplayMode === 'terrain';
	const isPulseMode = props.mapDisplayMode === 'pulse';
	const isTerrainModeRef = useRef(isTerrainMode);
	isTerrainModeRef.current = isTerrainMode;
	const mapDisplayModeRef = useRef(props.mapDisplayMode);
	mapDisplayModeRef.current = props.mapDisplayMode;
	const worldTargetSelection = useMemo(
		() => resolveWorldPlaceSelection(props.gameState.toMark),
		[props.gameState.toMark]
	);
	const worldTargetFeatureName = useMemo(
		() => resolveWorldFeatureNameForPlace(props.gameState.toMark),
		[props.gameState.toMark]
	);
	const isMicroWorldTarget =
		mode === 'world' && isWorldMicroRegionPlace(props.gameState.toMark);
	const countryTargetSelection = useMemo(
		() => resolveCountryPlaceSelection(countryCode, props.gameState.toMark),
		[countryCode, props.gameState.toMark]
	);
	const activeCountryRegionSource = useMemo(
		() => getCountryRegionSource(countryCode, props.gameState.toMark),
		[countryCode, props.gameState.toMark]
	);
	const staticCountryRegionSource = useMemo(
		() =>
			mode === 'country'
				? getCountryRegionStaticSource(countryCode)
				: null,
		[mode, countryCode]
	);
	const isWorldRegionClickMode = mode === 'world';
	const isCountryRegionClickMode =
		mode === 'country' && activeCountryRegionSource !== null;
	const interactiveRegionLayerIds = [
		isWorldRegionClickMode ? 'world-country-hit-fill' : null,
		isWorldRegionClickMode ? 'world-country-micro-hit' : null,
		staticCountryRegionSource?.hitLayerId ?? null
	].filter((value): value is string => Boolean(value));
	const initialView = getMapViewForGame({ mode, countryCode, category });
	const activeScope = getMapScopeForGame({ mode, countryCode, category });
	const scopeFeatureCollection = activeScope
		? mapBoundsToFeatureCollection(activeScope)
		: null;
	const visibleActivityHotspots = useMemo(
		() =>
			activeScope
				? props.activityHotspots.filter((hotspot) =>
						isWithinBounds(hotspot, activeScope.bounds)
					)
				: props.activityHotspots,
		[activeScope, props.activityHotspots]
	);
	const displayActivityHotspots = useMemo(() => {
		if (visibleActivityHotspots.length > 0) {
			return visibleActivityHotspots;
		}

		const focusCenter = activeScope
			? getBoundsCenter(activeScope.bounds)
			: {
					latitude: initialView.latitude,
					longitude: initialView.longitude
				};
		const countryName =
			mode === 'country'
				? (getCountryByCode(countryCode)?.name ??
					countryCode.toUpperCase())
				: 'Map';
		const signalStrength = Math.max(
			6,
			Math.round(
				props.activityHotspots.slice(0, 4).reduce((sum, hotspot) => {
					return sum + hotspot.playerCount;
				}, 0) / 4
			) || 8
		);

		return [
			{
				id: `synthetic-${mode}-${countryCode}-${category}`,
				label:
					mode === 'country'
						? `${countryName} live pulse`
						: mode === 'world'
							? 'Global live pulse'
							: 'Regional live pulse',
				latitude: focusCenter.latitude,
				longitude: focusCenter.longitude,
				playerCount: signalStrength,
				playStarts: Math.max(3, Math.round(signalStrength * 0.8)),
				completions: Math.max(1, Math.round(signalStrength * 0.45)),
				heat: 0.72,
				modeLabel: 'Pulse',
				regionType: mode === 'world' ? 'continent' : 'country'
			}
		] satisfies ActivityHotspot[];
	}, [
		activeScope,
		category,
		countryCode,
		initialView.latitude,
		initialView.longitude,
		mode,
		props.activityHotspots,
		visibleActivityHotspots
	]);
	const activityPulseSignals = useMemo(
		() => buildActivityPulseCollection(displayActivityHotspots, pulseTick),
		[displayActivityHotspots, pulseTick]
	);

	useEffect(() => {
		if (props.mapDisplayMode !== 'pulse') {
			return;
		}

		const intervalId = window.setInterval(() => {
			setPulseTick((value) => (value + 1) % 48);
		}, 140);

		return () => window.clearInterval(intervalId);
	}, [props.mapDisplayMode]);

	useEffect(() => {
		if (props.mapDisplayMode !== 'pulse') {
			setSelectedHotspot(null);
		}
	}, [props.mapDisplayMode]);

	useEffect(() => {
		const updateViewport = () => {
			setIsCompactViewport(window.innerWidth < 640);
		};

		updateViewport();
		window.addEventListener('resize', updateViewport);

		return () => window.removeEventListener('resize', updateViewport);
	}, []);

	useEffect(() => {
		if (
			!isMicroWorldTarget ||
			!worldTargetFeatureName ||
			props.info ||
			props.gameState.currentMarker !== 'none'
		) {
			setMicroTargetPulseTick(0);
			return;
		}

		setMicroTargetPulseTick(0);
		let frame = 0;
		const intervalId = window.setInterval(() => {
			frame += 1;
			setMicroTargetPulseTick(frame);
			if (frame >= (isCompactViewport ? 14 : 18)) {
				window.clearInterval(intervalId);
			}
		}, 130);

		return () => window.clearInterval(intervalId);
	}, [
		isMicroWorldTarget,
		isCompactViewport,
		props.gameState.currentMarker,
		props.info,
		worldTargetFeatureName
	]);

	const toMarkRef = useRef(props.gameState.toMark);
	toMarkRef.current = props.gameState.toMark;

	const focusGameArea = useCallback(
		(duration = 1100) => {
			const map = mapRef.current?.getMap();
			if (!map) return;

			const nextScope = getMapScopeForGame({
				mode,
				countryCode,
				category
			});

			if (nextScope) {
				map.fitBounds(mapBoundsToLngLatBounds(nextScope.bounds), {
					padding: {
						top: 88,
						right: 72,
						bottom: 88,
						left: 72
					},
					maxZoom: mode === 'country' ? 6.8 : 4.6,
					duration,
					essential: true
				});
				return;
			}

			// World/all mode: centre globe on the target place so it's always
			// in the middle of the screen. Use a continent-level zoom so the
			// surrounding region is visible for clicking.
			if (mode === 'world') {
				const toMark = toMarkRef.current;
				if (toMark) {
					const isMicroTarget = isWorldMicroRegionPlace(toMark);
					const continentScope = getContinentScopeForWorldPlace(
						toMark.name
					);
					// Larger continents (Asia, Americas) get a slightly wider zoom.
					// Tiny countries use a closer framing so the assist point reads immediately.
					const zoom = isMicroTarget
						? 3.9
						: continentScope
							? ['Asia', 'Americas'].includes(
									continentScope.label
								)
								? 2.4
								: 2.8
							: 2.4;
					map.easeTo({
						center: [toMark.longitude, toMark.latitude],
						zoom,
						duration,
						essential: true
					});
					return;
				}
			}

			const nextView = getMapViewForGame({ mode, countryCode, category });

			map.easeTo({
				center: [nextView.longitude, nextView.latitude],
				zoom: nextView.zoom,
				duration,
				essential: true
			});
		},
		[category, countryCode, mode]
	);

	useEffect(() => {
		void props.focusRequest;
		focusGameArea();
	}, [focusGameArea, props.focusRequest]);

	// When a new question appears in world mode, fly to its continent automatically
	useEffect(() => {
		if (mode === 'world' && props.gameState.toMark) {
			focusGameArea(1200);
		}
	}, [focusGameArea, mode, props.gameState.toMark]);

	useEffect(() => {
		if (
			previousInfoRef.current !== null &&
			props.info === null &&
			mode !== 'world'
		) {
			focusGameArea(900);
		}

		previousInfoRef.current = props.info;
	}, [focusGameArea, props.info, mode]);

	useEffect(() => {
		if (
			selectedHotspot &&
			!displayActivityHotspots.some(
				(hotspot) => hotspot.id === selectedHotspot.id
			)
		) {
			setSelectedHotspot(null);
		}
	}, [displayActivityHotspots, selectedHotspot]);

	useEffect(() => {
		if (
			!isWorldRegionClickMode ||
			props.gameState.currentMarker === 'none'
		) {
			setSelectedWorldFeatureName(null);
		}
	}, [isWorldRegionClickMode, props.gameState.currentMarker]);

	useEffect(() => {
		if (
			!isCountryRegionClickMode ||
			props.gameState.currentMarker === 'none'
		) {
			setSelectedCountryFeatureName(null);
		}
	}, [isCountryRegionClickMode, props.gameState.currentMarker]);

	const handleWorldRegionSelection = useCallback(
		(event: MapLayerMouseEvent) => {
			const feature = event.features?.find(
				(item) =>
					item.layer.id === 'world-country-hit-fill' ||
					item.layer.id === 'world-country-micro-hit'
			);
			const featureName = feature?.properties?.name;
			if (typeof featureName !== 'string') return false;

			const selection = resolveWorldFeatureSelection(featureName);
			if (!selection) return false;

			setSelectedWorldFeatureName(featureName);
			props.onRegionLabelSelect(selection.label);
			props.gameState.setCurrentMarker({
				latitude:
					worldTargetSelection?.selectionKey ===
					selection.selectionKey
						? (props.gameState.toMark?.latitude ??
							selection.place.latitude)
						: selection.place.latitude,
				longitude:
					worldTargetSelection?.selectionKey ===
					selection.selectionKey
						? (props.gameState.toMark?.longitude ??
							selection.place.longitude)
						: selection.place.longitude,
				selectionKey: selection.selectionKey,
				selectionLabel: selection.label
			});
			return true;
		},
		[
			props.onRegionLabelSelect,
			props.gameState.setCurrentMarker,
			props.gameState.toMark,
			worldTargetSelection
		]
	);

	const handleCountryRegionSelection = useCallback(
		(event: MapLayerMouseEvent) => {
			if (!activeCountryRegionSource) return false;

			const feature = event.features?.find(
				(item) => item.layer.id === activeCountryRegionSource.hitLayerId
			);
			const featureName =
				feature?.properties?.[
					activeCountryRegionSource.featureNameProperty
				];
			if (typeof featureName !== 'string') return false;

			const selection = resolveCountryFeatureSelection(
				countryCode,
				featureName
			);
			if (!selection) return false;

			setSelectedCountryFeatureName(featureName);
			props.onRegionLabelSelect(selection.label);
			props.gameState.setCurrentMarker({
				latitude:
					countryTargetSelection?.selectionKey ===
					selection.selectionKey
						? (props.gameState.toMark?.latitude ??
							selection.place.latitude)
						: selection.place.latitude,
				longitude:
					countryTargetSelection?.selectionKey ===
					selection.selectionKey
						? (props.gameState.toMark?.longitude ??
							selection.place.longitude)
						: selection.place.longitude,
				selectionKey: selection.selectionKey,
				selectionLabel: selection.label
			});
			return true;
		},
		[
			activeCountryRegionSource,
			countryCode,
			countryTargetSelection,
			props.onRegionLabelSelect,
			props.gameState.setCurrentMarker,
			props.gameState.toMark
		]
	);

	// Cinematic camera reveal after submission
	useEffect(() => {
		if (!props.info || !mapRef.current) return;

		const { toMark, guess } = props.info;
		const map = mapRef.current.getMap();
		const isMicroTarget =
			mode === 'world' && isWorldMicroRegionPlace(toMark);

		const lngs = [guess.longitude, toMark.longitude];
		const lats = [guess.latitude, toMark.latitude];
		const minLng = Math.min(...lngs);
		const maxLng = Math.max(...lngs);
		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);
		const isSameSpot =
			Math.abs(maxLng - minLng) < 0.01 &&
			Math.abs(maxLat - minLat) < 0.01;

		// Delay 300ms to let ResultLine render first
		const timer = setTimeout(() => {
			if (isSameSpot) {
				map.flyTo({
					center: [toMark.longitude, toMark.latitude],
					zoom: mode === 'world' ? (isMicroTarget ? 5.2 : 4.2) : 7,
					speed: 0.8,
					curve: 1.4,
					essential: true
				});
				return;
			}

			map.fitBounds(
				[
					[minLng, minLat],
					[maxLng, maxLat]
				],
				{
					padding: { top: 110, right: 72, bottom: 110, left: 72 },
					maxZoom:
						mode === 'world' ? (isMicroTarget ? 5.4 : 4.6) : 7.2,
					speed: 0.8,
					curve: 1.4,
					essential: true
				}
			);
		}, 300);

		return () => clearTimeout(timer);
	}, [props.info, mode]);

	return (
		<_Map
			ref={mapRef}
			initialViewState={initialView}
			mapStyle={getMapStyleForMode(props.mapDisplayMode, terrainBasemap)}
			style={{
				width: '100%',
				height: '100%',
				filter: undefined
			}}
			attributionControl={false}
			reuseMaps
			onLoad={() => {
				const map = mapRef.current?.getMap();
				if (map) {
					const applyGlobeEffects = () => {
						hideSymbolLayers(map);
						map.setProjection({ type: 'globe' });
						map.setSky(GLOBE_SKY_CONFIG);
						if (!isTerrainModeRef.current) applyGlobeTerrain(map);
						if (mapDisplayModeRef.current === 'pulse')
							applyPulseStyleOverrides(map);
					};
					applyGlobeEffects();
					// Re-apply after each subsequent style switch
					map.on('style.load', applyGlobeEffects);
				}
				focusGameArea(0);
			}}
			onStyleData={() => {
				const map = mapRef.current?.getMap();
				if (map?.isStyleLoaded()) {
					hideSymbolLayers(map);
					map.setProjection({ type: 'globe' });
					map.setSky(GLOBE_SKY_CONFIG);
					if (mapDisplayModeRef.current === 'pulse')
						applyPulseStyleOverrides(map);
					// Terrain is handled by the style.load listener — skip here
					// to avoid triggering styledata loops from addSource/setTerrain
				}
			}}
			onClick={(e) => {
				if (selectedHotspot) {
					setSelectedHotspot(null);
				}
				if (
					props.gameState.currentMarker === 'submitted' ||
					props.gameState.status === 'paused'
				)
					return;

				if (isWorldRegionClickMode && handleWorldRegionSelection(e)) {
					return;
				}
				if (
					isCountryRegionClickMode &&
					handleCountryRegionSelection(e)
				) {
					return;
				}

				setSelectedWorldFeatureName(null);
				setSelectedCountryFeatureName(null);
				props.onRegionLabelSelect(null);
				props.gameState.setCurrentMarker({
					latitude: e.lngLat.lat,
					longitude: e.lngLat.lng
				});
			}}
			onMouseMove={(event) => {
				if (isWorldRegionClickMode) {
					const worldFeature = event.features?.find(
						(item) =>
							item.layer.id === 'world-country-hit-fill' ||
							item.layer.id === 'world-country-micro-hit'
					);
					const worldFeatureName = worldFeature?.properties?.name;
					setHoveredWorldFeatureName(
						typeof worldFeatureName === 'string'
							? worldFeatureName
							: null
					);
				} else {
					setHoveredWorldFeatureName(null);
				}

				if (staticCountryRegionSource) {
					const countryFeature = event.features?.find(
						(item) =>
							item.layer.id ===
							staticCountryRegionSource.hitLayerId
					);
					const countryFeatureName =
						countryFeature?.properties?.[
							staticCountryRegionSource.featureNameProperty
						];
					setHoveredCountryFeatureName(
						typeof countryFeatureName === 'string'
							? countryFeatureName
							: null
					);
				} else {
					setHoveredCountryFeatureName(null);
				}
			}}
			onMouseLeave={() => {
				setHoveredWorldFeatureName(null);
				setHoveredCountryFeatureName(null);
			}}
			interactiveLayerIds={
				interactiveRegionLayerIds.length > 0
					? interactiveRegionLayerIds
					: undefined
			}
			cursor={
				hoveredWorldFeatureName ||
				(isCountryRegionClickMode && hoveredCountryFeatureName)
					? 'pointer'
					: 'grab'
			}
			touchZoomRotate
			dragRotate={false}
		>
			<NavigationControl position="bottom-left" showCompass={false} />
			<ScaleControl position="bottom-left" maxWidth={120} unit="metric" />

			{props.mapDisplayMode === 'pulse' &&
				displayActivityHotspots.length > 0 && (
					<Source
						id="activity-pulse-signals"
						type="geojson"
						data={activityPulseSignals}
					>
						<Layer
							id="activity-pulse-halo"
							type="circle"
							paint={{
								'circle-radius': ['get', 'haloRadius'],
								'circle-color': ['get', 'haloColor'],
								'circle-opacity': ['get', 'haloOpacity'],
								'circle-blur': 0.9
							}}
						/>
						<Layer
							id="activity-pulse-ring"
							type="circle"
							paint={{
								'circle-radius': ['get', 'ringRadius'],
								'circle-color': 'rgba(0,0,0,0)',
								'circle-stroke-color': ['get', 'ringColor'],
								'circle-stroke-opacity': ['get', 'ringOpacity'],
								'circle-stroke-width': ['get', 'ringWidth']
							}}
						/>
						<Layer
							id="activity-pulse-core"
							type="circle"
							paint={{
								'circle-radius': ['get', 'coreRadius'],
								'circle-color': ['get', 'coreColor'],
								'circle-opacity': 0.92,
								'circle-stroke-color': '#ffffff',
								'circle-stroke-opacity': 0.25,
								'circle-stroke-width': 1.1
							}}
						/>
					</Source>
				)}

			{isWorldRegionClickMode && (
				<Source
					id="world-country-polygons"
					type="geojson"
					data="/data/world-countries.geojson"
				>
					<Layer
						id="world-country-hit-fill"
						type="fill"
						paint={{
							'fill-color': '#ffffff',
							'fill-opacity': 0.01
						}}
					/>
					<Layer
						id="world-country-terrain-reveal-fill"
						type="fill"
						filter={
							props.info && worldTargetFeatureName
								? [
										'==',
										['get', 'name'],
										worldTargetFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'fill-color': '#f8fafc',
							'fill-opacity': isTerrainMode ? 0.08 : 0
						}}
					/>
					<Layer
						id="world-country-terrain-reveal-outline"
						type="line"
						filter={
							props.info && worldTargetFeatureName
								? [
										'==',
										['get', 'name'],
										worldTargetFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'line-color': '#f59e0b',
							'line-width': isTerrainMode ? 2.2 : 0,
							'line-opacity': isTerrainMode ? 0.88 : 0,
							'line-dasharray': [1.2, 1.6]
						}}
					/>
					<Layer
						id="world-country-base-outline"
						type="line"
						paint={{
							'line-color': isTerrainMode
								? '#ffffff'
								: isPulseMode
									? '#7EA8C9'
									: '#94a3b8',
							'line-width': isTerrainMode ? 0.6 : 1.0,
							'line-opacity': isTerrainMode ? 0.3 : 0.5
						}}
					/>
					<Layer
						id="world-country-hover-outline"
						type="line"
						filter={
							hoveredWorldFeatureName
								? [
										'==',
										['get', 'name'],
										hoveredWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'line-color': isTerrainMode ? '#f8fafc' : '#38bdf8',
							'line-width': isTerrainMode ? 1.6 : 2.2,
							'line-opacity': isTerrainMode ? 0.56 : 0.82
						}}
					/>
					<Layer
						id="world-country-selected-fill"
						type="fill"
						filter={
							selectedWorldFeatureName
								? [
										'==',
										['get', 'name'],
										selectedWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'fill-color': isTerrainMode ? '#f8fafc' : '#f59e0b',
							'fill-opacity': isTerrainMode ? 0.08 : 0.24
						}}
					/>
					<Layer
						id="world-country-selected-halo"
						type="line"
						filter={
							selectedWorldFeatureName
								? [
										'==',
										['get', 'name'],
										selectedWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'line-color': isTerrainMode ? '#f8fafc' : '#f97316',
							'line-width': isTerrainMode ? 4.6 : 5.4,
							'line-opacity': isTerrainMode ? 0.22 : 0.3,
							'line-blur': 3.2
						}}
					/>
					<Layer
						id="world-country-selected-outline"
						type="line"
						filter={
							selectedWorldFeatureName
								? [
										'==',
										['get', 'name'],
										selectedWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'line-color': isTerrainMode ? '#f8fafc' : '#f97316',
							'line-width': isTerrainMode ? 2.1 : 3.2,
							'line-opacity': isTerrainMode ? 0.78 : 0.95,
							'line-dasharray': isTerrainMode
								? [1.1, 1.4]
								: [1, 0]
						}}
					/>
				</Source>
			)}

			{isWorldRegionClickMode && (
				<Source
					id="world-country-micro-points"
					type="geojson"
					data={worldMicroRegionFeatureCollection}
				>
					<Layer
						id="world-country-micro-hit"
						type="circle"
						paint={{
							'circle-radius': 12,
							'circle-color': '#ffffff',
							'circle-opacity': 0.01
						}}
					/>
					<Layer
						id="world-country-micro-core"
						type="circle"
						paint={{
							'circle-radius': isTerrainMode ? 3.6 : 4.2,
							'circle-color': isTerrainMode
								? '#f8fafc'
								: '#f59e0b',
							'circle-stroke-color': isTerrainMode
								? 'rgba(255,255,255,0.78)'
								: '#ffffff',
							'circle-stroke-width': isTerrainMode ? 1.1 : 1.4,
							'circle-opacity': isTerrainMode ? 0.68 : 0.88
						}}
					/>
					<Layer
						id="world-country-micro-target-pulse"
						type="circle"
						filter={
							isMicroWorldTarget &&
							worldTargetFeatureName &&
							props.gameState.currentMarker === 'none' &&
							!props.info &&
							microTargetPulseTick < (isCompactViewport ? 14 : 18)
								? [
										'==',
										['get', 'name'],
										worldTargetFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'circle-radius': isTerrainMode
								? isCompactViewport
									? 6.8 + (microTargetPulseTick % 5) * 1.1
									: 8 + (microTargetPulseTick % 6) * 1.4
								: isCompactViewport
									? 7.6 + (microTargetPulseTick % 5) * 1.3
									: 9 + (microTargetPulseTick % 6) * 1.7,
							'circle-color': isTerrainMode
								? '#f8fafc'
								: '#f59e0b',
							'circle-opacity': Math.max(
								0,
								(isTerrainMode
									? isCompactViewport
										? 0.18
										: 0.24
									: isCompactViewport
										? 0.22
										: 0.3) -
									microTargetPulseTick *
										(isCompactViewport ? 0.017 : 0.014)
							),
							'circle-stroke-color': isTerrainMode
								? '#f8fafc'
								: '#f59e0b',
							'circle-stroke-width': isTerrainMode
								? isCompactViewport
									? 1.1
									: 1.4
								: isCompactViewport
									? 1.4
									: 1.8,
							'circle-stroke-opacity': Math.max(
								0,
								(isTerrainMode
									? isCompactViewport
										? 0.58
										: 0.78
									: isCompactViewport
										? 0.68
										: 0.88) -
									microTargetPulseTick *
										(isCompactViewport ? 0.05 : 0.04)
							)
						}}
					/>
					<Layer
						id="world-country-micro-hover"
						type="circle"
						filter={
							hoveredWorldFeatureName
								? [
										'==',
										['get', 'name'],
										hoveredWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'circle-radius': isTerrainMode ? 7.5 : 8.5,
							'circle-color': isTerrainMode
								? '#f8fafc'
								: '#38bdf8',
							'circle-opacity': isTerrainMode ? 0.18 : 0.22,
							'circle-stroke-color': isTerrainMode
								? '#f8fafc'
								: '#38bdf8',
							'circle-stroke-width': isTerrainMode ? 1.2 : 1.5,
							'circle-stroke-opacity': isTerrainMode ? 0.58 : 0.82
						}}
					/>
					<Layer
						id="world-country-micro-selected"
						type="circle"
						filter={
							selectedWorldFeatureName
								? [
										'==',
										['get', 'name'],
										selectedWorldFeatureName
									]
								: ['==', ['get', 'name'], '']
						}
						paint={{
							'circle-radius': isTerrainMode ? 8.2 : 9.4,
							'circle-color': isTerrainMode
								? '#f8fafc'
								: '#f97316',
							'circle-opacity': isTerrainMode ? 0.16 : 0.22,
							'circle-stroke-color': isTerrainMode
								? '#f8fafc'
								: '#f97316',
							'circle-stroke-width': isTerrainMode ? 1.5 : 1.8,
							'circle-stroke-opacity': isTerrainMode ? 0.78 : 0.94
						}}
					/>
				</Source>
			)}

			{staticCountryRegionSource && (
				<Source
					id={staticCountryRegionSource.sourceId}
					type="geojson"
					data={staticCountryRegionSource.geojsonPath}
				>
					{/* Transparent hit fill — always present for hover detection */}
					<Layer
						id={staticCountryRegionSource.hitLayerId}
						type="fill"
						paint={{
							'fill-color': '#ffffff',
							'fill-opacity': 0.01
						}}
					/>
					{/* Always-visible base outline for region divisions */}
					<Layer
						id={`${staticCountryRegionSource.sourceId}-base-outline`}
						type="line"
						paint={{
							'line-color': isTerrainMode
								? '#ffffff'
								: isPulseMode
									? '#7EA8C9'
									: '#94a3b8',
							'line-width': isTerrainMode ? 0.6 : 1.0,
							'line-opacity': isTerrainMode ? 0.3 : 0.5
						}}
					/>
					{/* Hover outline — always available so hover works without an active question */}
					<Layer
						id={staticCountryRegionSource.hoverLayerId}
						type="line"
						filter={
							hoveredCountryFeatureName
								? [
										'==',
										[
											'get',
											staticCountryRegionSource.featureNameProperty
										],
										hoveredCountryFeatureName
									]
								: [
										'==',
										[
											'get',
											staticCountryRegionSource.featureNameProperty
										],
										''
									]
						}
						paint={{
							'line-color': isTerrainMode ? '#f8fafc' : '#38bdf8',
							'line-width': isTerrainMode ? 1.6 : 2.2,
							'line-opacity': isTerrainMode ? 0.56 : 0.82
						}}
					/>
					{isCountryRegionClickMode && activeCountryRegionSource && (
						<>
							<Layer
								id={`${activeCountryRegionSource.sourceId}-terrain-reveal-fill`}
								source={staticCountryRegionSource.sourceId}
								type="fill"
								filter={
									props.info &&
									countryTargetSelection?.featureName
										? [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												countryTargetSelection.featureName
											]
										: [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												''
											]
								}
								paint={{
									'fill-color': '#f8fafc',
									'fill-opacity': isTerrainMode ? 0.08 : 0
								}}
							/>
							<Layer
								id={`${activeCountryRegionSource.sourceId}-terrain-reveal-outline`}
								source={staticCountryRegionSource.sourceId}
								type="line"
								filter={
									props.info &&
									countryTargetSelection?.featureName
										? [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												countryTargetSelection.featureName
											]
										: [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												''
											]
								}
								paint={{
									'line-color': '#f59e0b',
									'line-width': isTerrainMode ? 2.2 : 0,
									'line-opacity': isTerrainMode ? 0.88 : 0,
									'line-dasharray': [1.2, 1.6]
								}}
							/>
							<Layer
								id={
									activeCountryRegionSource.selectedFillLayerId
								}
								source={staticCountryRegionSource.sourceId}
								type="fill"
								filter={
									selectedCountryFeatureName
										? [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												selectedCountryFeatureName
											]
										: [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												''
											]
								}
								paint={{
									'fill-color': isTerrainMode
										? '#f8fafc'
										: '#f59e0b',
									'fill-opacity': isTerrainMode ? 0.08 : 0.24
								}}
							/>
							<Layer
								id={`${activeCountryRegionSource.sourceId}-selected-halo`}
								source={staticCountryRegionSource.sourceId}
								type="line"
								filter={
									selectedCountryFeatureName
										? [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												selectedCountryFeatureName
											]
										: [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												''
											]
								}
								paint={{
									'line-color': isTerrainMode
										? '#f8fafc'
										: '#f97316',
									'line-width': isTerrainMode ? 4.6 : 5.4,
									'line-opacity': isTerrainMode ? 0.22 : 0.3,
									'line-blur': 3.2
								}}
							/>
							<Layer
								id={
									activeCountryRegionSource.selectedOutlineLayerId
								}
								source={staticCountryRegionSource.sourceId}
								type="line"
								filter={
									selectedCountryFeatureName
										? [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												selectedCountryFeatureName
											]
										: [
												'==',
												[
													'get',
													activeCountryRegionSource.featureNameProperty
												],
												''
											]
								}
								paint={{
									'line-color': isTerrainMode
										? '#f8fafc'
										: '#f97316',
									'line-width': isTerrainMode ? 2.1 : 3.2,
									'line-opacity': isTerrainMode ? 0.78 : 0.95,
									'line-dasharray': isTerrainMode
										? [1.1, 1.4]
										: [1, 0]
								}}
							/>
						</>
					)}
				</Source>
			)}

			{scopeFeatureCollection && props.info === null && (
				<Source
					id="scope-source"
					type="geojson"
					data={scopeFeatureCollection}
				>
					<Layer
						id="scope-fill"
						type="fill"
						paint={{
							'fill-color': '#38bdf8',
							'fill-opacity':
								props.mapDisplayMode === 'pulse'
									? 0.02
									: props.mapDisplayMode === 'terrain'
										? 0.015
										: 0.08
						}}
					/>
					<Layer
						id="scope-outline"
						type="line"
						paint={{
							'line-color': '#0284c7',
							'line-width': 2,
							'line-opacity':
								props.mapDisplayMode === 'pulse'
									? 0.28
									: props.mapDisplayMode === 'terrain'
										? 0.42
										: 0.8,
							'line-dasharray': [2, 2]
						}}
					/>
				</Source>
			)}

			{props.mapDisplayMode === 'pulse' &&
				displayActivityHotspots.map((hotspot) => (
					<_Marker
						key={hotspot.id}
						latitude={hotspot.latitude}
						longitude={hotspot.longitude}
						anchor="center"
					>
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								setSelectedHotspot(hotspot);
							}}
							className="group relative flex items-center justify-center rounded-full border border-sky-200/70 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.45),rgba(8,47,73,0.92)_72%)] text-white shadow-[0_0_0_1px_rgba(125,211,252,0.08),0_0_38px_rgba(34,211,238,0.18)] transition hover:scale-105 cursor-pointer"
							style={{
								width: `${24 + hotspot.playerCount * 1.25}px`,
								height: `${24 + hotspot.playerCount * 1.25}px`
							}}
							aria-label={`Open activity summary for ${hotspot.label}`}
						>
							<span className="absolute inset-0 rounded-full border border-cyan-200/40 opacity-45 animate-ping" />
							<span className="relative text-xs font-black">
								{hotspot.modeLabel}
							</span>
							<span className="pointer-events-none absolute top-[calc(100%+0.45rem)] whitespace-nowrap rounded-full border border-cyan-200/20 bg-slate-950/82 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-cyan-100 shadow-[0_10px_24px_rgba(8,47,73,0.24)]">
								{hotspot.label}
							</span>
						</button>
					</_Marker>
				))}

			{selectedHotspot && (
				<Popup
					longitude={selectedHotspot.longitude}
					latitude={selectedHotspot.latitude}
					anchor="bottom"
					offset={18}
					closeButton={false}
					closeOnClick={false}
					onClose={() => setSelectedHotspot(null)}
					className="activity-popup"
					maxWidth="280px"
				>
					<div className="min-w-[220px] rounded-2xl bg-slate-950 px-4 py-3 text-white">
						<p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
							Activity Layer
						</p>
						<h3 className="mt-2 text-lg font-black text-white">
							{selectedHotspot.label}
						</h3>
						<div className="mt-3 grid grid-cols-3 gap-2">
							<div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
								<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
									Players
								</p>
								<p className="mt-1 text-lg font-black text-white">
									{selectedHotspot.playerCount}
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
								<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
									Starts
								</p>
								<p className="mt-1 text-lg font-black text-white">
									{selectedHotspot.playStarts}
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
								<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
									Mode
								</p>
								<p className="mt-1 text-sm font-bold text-cyan-200">
									{selectedHotspot.modeLabel}
								</p>
							</div>
						</div>
						<p className="mt-3 text-xs leading-5 text-slate-300">
							Map traffic is aggregated into region-level hotspots
							so players can see where current quiz energy is
							building.
						</p>
					</div>
				</Popup>
			)}

			{props.info && (
				<ResultLine info={props.info} isTerrainMode={isTerrainMode} />
			)}
			{props.satelliteHintUrl && (
				<div className="pointer-events-auto absolute bottom-16 right-4 z-10 overflow-hidden rounded-xl border border-white/20 shadow-2xl">
					<div className="relative">
						<Image
							src={props.satelliteHintUrl}
							width={200}
							height={150}
							alt="Satellite hint"
							className="block"
						/>
						<button
							type="button"
							onClick={props.onSatelliteHintDismiss}
							className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white hover:bg-black/70"
						>
							✕
						</button>
						<div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[9px] text-white/70">
							© Mapbox · Satellite hint (no labels)
						</div>
					</div>
				</div>
			)}
			<Marker {...props} />
		</_Map>
	);
};

export default Game;
