import type { StyleSpecification } from 'maplibre-gl';
import type { MapDisplayMode } from '@/lib/utils/mapActivity';

const BASEMAP_STYLES: Record<Exclude<MapDisplayMode, 'terrain'>, string> = {
	play: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
	pulse: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	activity: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};

type SatelliteProvider = 'custom' | 'esri' | 'mapbox' | 'tianditu';

export interface TerrainBasemapConfig {
	attribution?: string;
	label: string;
	provider: SatelliteProvider;
	style: StyleSpecification | string;
}

const ENV = {
	mapboxAccessToken:
		process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() || null,
	terrainAttribution:
		process.env.NEXT_PUBLIC_TERRAIN_ATTRIBUTION?.trim() || null,
	terrainProvider:
		(process.env.NEXT_PUBLIC_TERRAIN_PROVIDER?.trim() as
			| SatelliteProvider
			| undefined) || null,
	terrainStyleUrl: process.env.NEXT_PUBLIC_TERRAIN_STYLE_URL?.trim() || null,
	terrainTileUrl: process.env.NEXT_PUBLIC_TERRAIN_TILE_URL?.trim() || null,
	tiandituToken: process.env.NEXT_PUBLIC_TIANDITU_TOKEN?.trim() || null
} as const;

const buildRasterStyle = ({
	attribution,
	tiles
}: {
	attribution?: string;
	tiles: string[];
}): StyleSpecification => ({
	version: 8,
	sources: {
		satellite: {
			type: 'raster',
			tiles,
			tileSize: 256,
			attribution
		}
	},
	glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
	layers: [
		{
			id: 'satellite-raster',
			type: 'raster',
			source: 'satellite'
		}
	]
});

const buildTiandituStyle = (token: string): StyleSpecification => ({
	version: 8,
	sources: {
		satellite: {
			type: 'raster',
			tiles: [
				`https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t1.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t2.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t3.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`
			],
			tileSize: 256,
			attribution: 'Imagery © 天地图'
		},
		labels: {
			type: 'raster',
			tiles: [
				`https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t1.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t2.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
				`https://t3.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`
			],
			tileSize: 256,
			attribution: 'Labels © 天地图'
		}
	},
	glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
	layers: [
		{
			id: 'satellite-raster',
			type: 'raster',
			source: 'satellite'
		},
		{
			id: 'satellite-labels',
			type: 'raster',
			source: 'labels',
			paint: {
				'raster-opacity': 0.86
			}
		}
	]
});

export const getTerrainBasemapConfig = (): TerrainBasemapConfig | null => {
	const styleUrl = ENV.terrainStyleUrl;
	if (styleUrl) {
		return {
			label: 'Terrain',
			provider: 'custom',
			style: styleUrl
		};
	}

	const rasterTileUrl = ENV.terrainTileUrl;
	if (rasterTileUrl) {
		return {
			label: 'Terrain',
			provider: 'custom',
			attribution:
				ENV.terrainAttribution ??
				'Imagery provided by custom raster tiles',
			style: buildRasterStyle({
				attribution:
					ENV.terrainAttribution ??
					'Imagery provided by custom raster tiles',
				tiles: [rasterTileUrl]
			})
		};
	}

	const provider = ENV.terrainProvider;

	if (provider === 'mapbox') {
		const token = ENV.mapboxAccessToken;
		if (!token) return null;

		return {
			label: 'Terrain',
			provider,
			attribution: '© Mapbox © OpenStreetMap',
			style: buildRasterStyle({
				attribution: '© Mapbox © OpenStreetMap',
				tiles: [
					`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${token}`
				]
			})
		};
	}

	if (provider === 'esri') {
		return {
			label: 'Terrain',
			provider,
			attribution: 'Tiles © Esri',
			style: buildRasterStyle({
				attribution: 'Tiles © Esri',
				tiles: [
					'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
				]
			})
		};
	}

	if (provider === 'tianditu') {
		const token = ENV.tiandituToken;
		if (!token) return null;

		return {
			label: 'Terrain',
			provider,
			attribution: 'Imagery © 天地图',
			style: buildTiandituStyle(token)
		};
	}

	return null;
};

export const getMapStyleForMode = (
	mode: MapDisplayMode,
	terrainBasemap: TerrainBasemapConfig | null
): string | StyleSpecification => {
	if (mode === 'terrain') {
		return terrainBasemap?.style ?? BASEMAP_STYLES.play;
	}

	return BASEMAP_STYLES[mode];
};

export const GLOBE_FOG_CONFIG = {
	color: 'rgb(186, 210, 235)',
	'high-color': 'rgb(36, 92, 223)',
	'horizon-blend': 0.02,
	'space-color': 'rgb(11, 11, 25)',
	'star-intensity': 0.6
} as const;
