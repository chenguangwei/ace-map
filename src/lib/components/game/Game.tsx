import { useRef } from 'react';
import _Map, { Marker as _Marker, type MapRef } from 'react-map-gl/maplibre';
import type { GameState } from '@/lib/utils/game';
import type { PlaceWithoutName } from '@/lib/utils/places';
import { Show } from '../Flow';
import type { InfoState } from './Main';
import Pin from './Pin';

const center = [23.5937, 78.9629] as [number, number];
const provider =
	'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const Marker = (
	props: InfoState & {
		gameState: GameState;
	}
) => {
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
					latitude={
						(props.gameState.currentMarker as PlaceWithoutName)
							.latitude
					}
					longitude={
						(props.gameState.currentMarker as PlaceWithoutName)
							.longitude
					}
				>
					<Pin />
				</_Marker>
			</Show>
			<Show condition={props.info !== null}>
				<_Marker
					latitude={props.info?.toMark.latitude as number}
					longitude={props.info?.toMark.longitude as number}
				>
					<Pin color="green" />
				</_Marker>
			</Show>
		</>
	);
};

const Game = (
	props: InfoState & {
		gameState: GameState;
	}
) => {
	const mapRef = useRef<MapRef>(null);

	return (
		<_Map
			ref={mapRef}
			initialViewState={{
				longitude: center[1],
				latitude: center[0],
				zoom: 4.5
			}}
			mapStyle={provider}
			style={{ width: '100%', height: '100%' }}
			onLoad={() => {
				const map = mapRef.current?.getMap();

				if (map)
					map.getStyle().layers.forEach((l) => {
						if (l.type === 'symbol')
							map.setLayoutProperty(l.id, 'visibility', 'none');
					});
			}}
			onClick={(e) => {
				if (
					props.gameState.currentMarker === 'submitted' ||
					props.gameState.status === 'paused'
				)
					return;

				props.gameState.setCurrentMarker({
					latitude: e.lngLat.lat,
					longitude: e.lngLat.lng
				});
			}}
		>
			<Marker {...props} />
		</_Map>
	);
};

export default Game;
