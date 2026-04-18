'use client';
import type { Map as MapLibreMap } from 'maplibre-gl';
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
	getMapScopeForGame,
	mapBoundsToFeatureCollection,
	mapBoundsToLngLatBounds
} from '@/lib/data/mapScopes';
import {
	getMapStyleForMode,
	getTerrainBasemapConfig,
	GLOBE_FOG_CONFIG
} from '@/lib/maps/basemaps';
import {
	getCountryRegionSource,
	resolveCountryFeatureSelection,
	resolveCountryPlaceSelection
} from '@/lib/utils/countryRegions';
import type { GameState } from '@/lib/utils/game';
import {
	type ActivityHotspot,
	buildActivityHeatmapCollection,
	buildActivityPulseCollection,
	type MapDisplayMode
} from '@/lib/utils/mapActivity';
import { getMapViewForGame } from '@/lib/utils/mapView';
import type { PlaceWithoutName } from '@/lib/utils/places';
import { formatDistance } from '@/lib/utils/places';
import {
	resolveWorldFeatureNameForPlace,
	resolveWorldFeatureSelection,
	resolveWorldPlaceSelection
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
							label={`${submittedInfo?.isCorrect ? 'Correct' : 'Wrong'} • ${formatDistance(
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
						<MarkerTag tone="correct" label="Correct location" />
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
	const terrainBasemap = useMemo(() => getTerrainBasemapConfig(), []);
	const { mode, countryCode, category } = props.gameState;
	const isTerrainMode = props.mapDisplayMode === 'terrain';
	const worldTargetSelection = useMemo(
		() => resolveWorldPlaceSelection(props.gameState.toMark),
		[props.gameState.toMark]
	);
	const worldTargetFeatureName = useMemo(
		() => resolveWorldFeatureNameForPlace(props.gameState.toMark),
		[props.gameState.toMark]
	);
	const countryTargetSelection = useMemo(
		() => resolveCountryPlaceSelection(countryCode, props.gameState.toMark),
		[countryCode, props.gameState.toMark]
	);
	const activeCountryRegionSource = useMemo(
		() => getCountryRegionSource(countryCode, props.gameState.toMark),
		[countryCode, props.gameState.toMark]
	);
	const isWorldRegionClickMode = mode === 'world';
	const isCountryRegionClickMode =
		mode === 'country' && activeCountryRegionSource !== null;
	const interactiveRegionLayerIds = [
		isWorldRegionClickMode ? 'world-country-hit-fill' : null,
		activeCountryRegionSource?.hitLayerId ?? null
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
	const activityHeatmap = useMemo(
		() => buildActivityHeatmapCollection(displayActivityHotspots),
		[displayActivityHotspots]
	);
	const activityPulseSignals = useMemo(
		() => buildActivityPulseCollection(displayActivityHotspots, pulseTick),
		[displayActivityHotspots, pulseTick]
	);

	useEffect(() => {
		if (
			props.mapDisplayMode !== 'pulse' &&
			props.mapDisplayMode !== 'activity'
		) {
			return;
		}

		const intervalId = window.setInterval(() => {
			setPulseTick((value) => (value + 1) % 48);
		}, 140);

		return () => window.clearInterval(intervalId);
	}, [props.mapDisplayMode]);

	useEffect(() => {
		if (
			props.mapDisplayMode !== 'pulse' &&
			props.mapDisplayMode !== 'activity'
		) {
			setSelectedHotspot(null);
		}
	}, [props.mapDisplayMode]);

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

	useEffect(() => {
		if (previousInfoRef.current !== null && props.info === null) {
			focusGameArea(900);
		}

		previousInfoRef.current = props.info;
	}, [focusGameArea, props.info]);

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
				(item) => item.layer.id === 'world-country-hit-fill'
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
		[props.onRegionLabelSelect, props.gameState.setCurrentMarker, props.gameState.toMark, worldTargetSelection]
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
		[activeCountryRegionSource, countryCode, countryTargetSelection, props.onRegionLabelSelect, props.gameState.setCurrentMarker, props.gameState.toMark]
	);

	// Fit the map to show both the submitted guess and the correct location.
	useEffect(() => {
		if (props.info && mapRef.current) {
			const map = mapRef.current.getMap();
			const lngs = [
				props.info.guess.longitude,
				props.info.toMark.longitude
			];
			const lats = [
				props.info.guess.latitude,
				props.info.toMark.latitude
			];
			const minLng = Math.min(...lngs);
			const maxLng = Math.max(...lngs);
			const minLat = Math.min(...lats);
			const maxLat = Math.max(...lats);

			const isSameSpot =
				Math.abs(maxLng - minLng) < 0.01 &&
				Math.abs(maxLat - minLat) < 0.01;

			if (isSameSpot) {
				map.flyTo({
					center: [
						props.info.toMark.longitude,
						props.info.toMark.latitude
					],
					zoom: mode === 'world' ? 4.2 : 7,
					duration: 1200,
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
					padding: {
						top: 110,
						right: 72,
						bottom: 110,
						left: 72
					},
					maxZoom: mode === 'world' ? 4.6 : 7.2,
					duration: 1200,
					essential: true
				}
			);
		}
	}, [props.info, mode]);

	return (
		<_Map
			ref={mapRef}
			initialViewState={initialView}
			mapStyle={getMapStyleForMode(props.mapDisplayMode, terrainBasemap)}
			style={{ width: '100%', height: '100%' }}
			attributionControl={false}
			reuseMaps
			onLoad={() => {
				const map = mapRef.current?.getMap();
				if (map) {
					hideSymbolLayers(map);
					(map as any).setProjection({ type: 'globe' });
					(map as any).setFog(GLOBE_FOG_CONFIG);
				}
				focusGameArea(0);
			}}
			onStyleData={() => {
				const map = mapRef.current?.getMap();
				if (map?.isStyleLoaded()) {
					hideSymbolLayers(map);
					(map as any).setProjection({ type: 'globe' });
					(map as any).setFog(GLOBE_FOG_CONFIG);
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
						(item) => item.layer.id === 'world-country-hit-fill'
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

				if (isCountryRegionClickMode && activeCountryRegionSource) {
					const countryFeature = event.features?.find(
						(item) =>
							item.layer.id ===
							activeCountryRegionSource.hitLayerId
					);
					const countryFeatureName =
						countryFeature?.properties?.[
							activeCountryRegionSource.featureNameProperty
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
				hoveredWorldFeatureName || hoveredCountryFeatureName
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

			{props.mapDisplayMode === 'activity' &&
				displayActivityHotspots.length > 0 && (
					<Source
						id="activity-heatmap"
						type="geojson"
						data={activityHeatmap}
					>
						<Layer
							id="activity-heat"
							type="heatmap"
							paint={{
								'heatmap-weight': [
									'interpolate',
									['linear'],
									['get', 'heat'],
									0,
									0.15,
									1,
									1
								],
								'heatmap-intensity': 1.25,
								'heatmap-radius': [
									'interpolate',
									['linear'],
									['zoom'],
									1,
									28,
									5,
									52
								],
								'heatmap-opacity': 0.86,
								'heatmap-color': [
									'interpolate',
									['linear'],
									['heatmap-density'],
									0,
									'rgba(8,15,28,0)',
									0.15,
									'#1d4ed8',
									0.45,
									'#06b6d4',
									0.75,
									'#f59e0b',
									1,
									'#f97316'
								]
							}}
						/>
						<Layer
							id="activity-hotspot-glow"
							type="circle"
							paint={{
								'circle-radius': [
									'interpolate',
									['linear'],
									['get', 'playerCount'],
									1,
									16,
									24,
									34
								],
								'circle-color': '#22d3ee',
								'circle-opacity': 0.14,
								'circle-blur': 0.8
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
							'fill-color': isTerrainMode ? '#f8fafc' : '#22d3ee',
							'fill-opacity': isTerrainMode ? 0.08 : 0.18
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
							'line-color': isTerrainMode ? '#f8fafc' : '#06b6d4',
							'line-width': isTerrainMode ? 2.1 : 2.8,
							'line-opacity': isTerrainMode ? 0.78 : 0.95,
							'line-dasharray': isTerrainMode
								? [1.1, 1.4]
								: [1, 0]
						}}
					/>
				</Source>
			)}

			{isCountryRegionClickMode && activeCountryRegionSource && (
				<Source
					id={activeCountryRegionSource.sourceId}
					type="geojson"
					data={activeCountryRegionSource.geojsonPath}
				>
					<Layer
						id={activeCountryRegionSource.hitLayerId}
						type="fill"
						paint={{
							'fill-color': '#ffffff',
							'fill-opacity': 0.01
						}}
					/>
					<Layer
						id={`${activeCountryRegionSource.sourceId}-terrain-reveal-fill`}
						type="fill"
						filter={
							props.info && countryTargetSelection?.featureName
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
						type="line"
						filter={
							props.info && countryTargetSelection?.featureName
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
						id={activeCountryRegionSource.hoverLayerId}
						type="line"
						filter={
							hoveredCountryFeatureName
								? [
										'==',
										[
											'get',
											activeCountryRegionSource.featureNameProperty
										],
										hoveredCountryFeatureName
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
							'line-color': isTerrainMode ? '#f8fafc' : '#38bdf8',
							'line-width': isTerrainMode ? 1.6 : 2.2,
							'line-opacity': isTerrainMode ? 0.56 : 0.82
						}}
					/>
					<Layer
						id={activeCountryRegionSource.selectedFillLayerId}
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
							'fill-color': isTerrainMode ? '#f8fafc' : '#22d3ee',
							'fill-opacity': isTerrainMode ? 0.08 : 0.18
						}}
					/>
					<Layer
						id={activeCountryRegionSource.selectedOutlineLayerId}
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
							'line-color': isTerrainMode ? '#f8fafc' : '#06b6d4',
							'line-width': isTerrainMode ? 2.1 : 2.8,
							'line-opacity': isTerrainMode ? 0.78 : 0.95,
							'line-dasharray': isTerrainMode
								? [1.1, 1.4]
								: [1, 0]
						}}
					/>
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
								props.mapDisplayMode === 'activity'
									? 0.035
									: props.mapDisplayMode === 'pulse'
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
								props.mapDisplayMode === 'activity'
									? 0.45
									: props.mapDisplayMode === 'pulse'
										? 0.28
										: props.mapDisplayMode === 'terrain'
											? 0.42
											: 0.8,
							'line-dasharray': [2, 2]
						}}
					/>
				</Source>
			)}

			{(props.mapDisplayMode === 'pulse' ||
				props.mapDisplayMode === 'activity') &&
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
							className={`group relative flex items-center justify-center rounded-full border text-white shadow-[0_12px_26px_rgba(15,23,42,0.24)] transition hover:scale-105 cursor-pointer ${
								props.mapDisplayMode === 'activity'
									? 'border-cyan-300/50 bg-slate-950/84'
									: 'border-sky-200/70 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.45),rgba(8,47,73,0.92)_72%)] shadow-[0_0_0_1px_rgba(125,211,252,0.08),0_0_38px_rgba(34,211,238,0.18)]'
							}`}
							style={{
								width:
									props.mapDisplayMode === 'activity'
										? `${34 + hotspot.playerCount * 2}px`
										: `${24 + hotspot.playerCount * 1.25}px`,
								height:
									props.mapDisplayMode === 'activity'
										? `${34 + hotspot.playerCount * 2}px`
										: `${24 + hotspot.playerCount * 1.25}px`
							}}
							aria-label={`Open activity summary for ${hotspot.label}`}
						>
							<span
								className={`absolute inset-0 rounded-full border animate-ping ${
									props.mapDisplayMode === 'activity'
										? 'border-white/15 opacity-30'
										: 'border-cyan-200/40 opacity-45'
								}`}
							/>
							<span className="relative text-xs font-black">
								{props.mapDisplayMode === 'activity'
									? hotspot.playerCount
									: hotspot.modeLabel}
							</span>
							{props.mapDisplayMode === 'pulse' && (
								<span className="pointer-events-none absolute top-[calc(100%+0.45rem)] whitespace-nowrap rounded-full border border-cyan-200/20 bg-slate-950/82 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-cyan-100 shadow-[0_10px_24px_rgba(8,47,73,0.24)]">
									{hotspot.label}
								</span>
							)}
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
			<Marker {...props} />
		</_Map>
	);
};

export default Game;
