#!/usr/bin/env node
// Fetches and transforms admin boundary GeoJSON files for use in ace-map.
// Usage: node scripts/fetch-admin-geojson.mjs <country-code>
// Supported: jp, cn, in, gb, fr, es, it, au, ca, br, mx, id, kr, ru

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NATURAL_EARTH_ADMIN_1_URL =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
const NATURAL_EARTH_ADMIN_1_CACHE = '/tmp/ace-map-admin/ne_admin1.geojson';
const GEOBOUNDARIES_GITHUB_RAW_BASE =
	'https://github.com/wmgeolab/geoBoundaries/raw';
const ITALY_REGIONS_RAW_BASE =
	'https://raw.githubusercontent.com/mcortella/geojson_italian_regions/main/simplified';

const toFeature = (geometry, name) => ({
	type: 'Feature',
	geometry,
	properties: { name }
});

const fetchJson = async (url) => {
	if (url === NATURAL_EARTH_ADMIN_1_URL && existsSync(NATURAL_EARTH_ADMIN_1_CACHE)) {
		return JSON.parse(readFileSync(NATURAL_EARTH_ADMIN_1_CACHE, 'utf8'));
	}

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
	}
	return res.json();
};

const buildNaturalEarthConfig = ({
	admin,
	outFile,
	nameMap = {},
	filter = () => true
}) => ({
	outFile,
	fetchFeatures: async () => {
		const raw = await fetchJson(NATURAL_EARTH_ADMIN_1_URL);
		return raw.features
			.filter(
				(feature) =>
					feature.properties.admin === admin &&
					feature.properties.name &&
					filter(feature)
			)
			.map((feature) =>
				toFeature(
					feature.geometry,
					nameMap[feature.properties.name] ?? feature.properties.name
				)
			);
	}
});

const buildGeoBoundariesConfig = ({ url, outFile, filter = () => true }) => ({
	outFile,
	fetchFeatures: async () => {
		const raw = await fetchJson(url);
		return raw.features
			.filter(
				(feature) =>
					typeof feature.properties?.shapeName === 'string' && filter(feature)
			)
			.map((feature) =>
				toFeature(feature.geometry, feature.properties.shapeName)
			);
	}
});

const ITALY_REGION_FILES = [
	['abruzzo', 'Abruzzo'],
	['basilicata', 'Basilicata'],
	['calabria', 'Calabria'],
	['campania', 'Campania'],
	['emilia-romagna', 'Emilia-Romagna'],
	['friuli-venezia-giulia', 'Friuli-Venezia Giulia'],
	['lazio', 'Lazio'],
	['liguria', 'Liguria'],
	['lombardia', 'Lombardy'],
	['marche', 'Marche'],
	['molise', 'Molise'],
	['piemonte', 'Piedmont'],
	['puglia', 'Apulia'],
	['sardegna', 'Sardinia'],
	['sicilia', 'Sicily'],
	['toscana', 'Tuscany'],
	['trentino-altoadige', 'Trentino-Alto Adige'],
	['umbria', 'Umbria'],
	['valledaosta', "Aosta Valley"],
	['veneto', 'Veneto']
];

const CONFIGS = {
	cn: buildNaturalEarthConfig({
		admin: 'China',
		outFile: 'public/data/admin/cn-provinces.geojson',
		nameMap: {
			'Nei Mongol': 'Inner Mongolia',
			'Inner Mongol': 'Inner Mongolia',
			Xizang: 'Tibet',
			'Guangxi Zhuang': 'Guangxi',
			'Ningxia Hui': 'Ningxia',
			'Xinjiang Uygur': 'Xinjiang'
		},
		filter: (feature) => feature.properties.name !== 'Paracel Islands'
	}),
	in: buildNaturalEarthConfig({
		admin: 'India',
		outFile: 'public/data/admin/in-states.geojson',
		nameMap: {
			'Jammu and Kashmi': 'Jammu and Kashmir',
			Orissa: 'Odisha',
			Uttaranchal: 'Uttarakhand',
			'NCT of Delhi': 'Delhi'
		}
	}),
	gb: buildGeoBoundariesConfig({
		url: 'https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Countries_December_2022_UK_BUC/FeatureServer/0/query?where=1%3D1&outFields=CTRY22NM&f=geojson',
		outFile: 'public/data/admin/gb-nations.geojson'
	}),
	jp: {
		outFile: 'public/data/admin/jp-prefectures.geojson',
		fetchFeatures: async () => {
			const raw = await fetchJson(
				'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson'
			);
			return raw.features.map((feature) => {
				const rawName = feature.properties.nam || '';
				const name =
					rawName === 'Hokkai Do'
						? 'Hokkaido'
						: rawName.replace(/\s+(Ken|Fu|To)$/i, '');
				return toFeature(feature.geometry, name);
			});
		}
	},
	fr: buildGeoBoundariesConfig({
		url: `${GEOBOUNDARIES_GITHUB_RAW_BASE}/9469f09/releaseData/gbOpen/FRA/ADM1/geoBoundaries-FRA-ADM1_simplified.geojson`,
		outFile: 'public/data/admin/fr-regions.geojson'
	}),
	es: buildGeoBoundariesConfig({
		url: `${GEOBOUNDARIES_GITHUB_RAW_BASE}/9469f09/releaseData/gbOpen/ESP/ADM1/geoBoundaries-ESP-ADM1_simplified.geojson`,
		outFile: 'public/data/admin/es-communities.geojson'
	}),
	it: {
		outFile: 'public/data/admin/it-regions.geojson',
		fetchFeatures: async () => {
			const collections = await Promise.all(
				ITALY_REGION_FILES.map(async ([slug, name]) => {
					const raw = await fetchJson(`${ITALY_REGIONS_RAW_BASE}/${slug}.json`);
					return raw.features.map((feature) => toFeature(feature.geometry, name));
				})
			);
			return collections.flat();
		}
	},
	au: buildNaturalEarthConfig({
		admin: 'Australia',
		outFile: 'public/data/admin/au-states.geojson',
		filter: (feature) =>
			![
				'Jervis Bay Territory',
				'Macquarie Island',
				'Lord Howe Island'
			].includes(feature.properties.name)
	}),
	ca: buildNaturalEarthConfig({
		admin: 'Canada',
		outFile: 'public/data/admin/ca-provinces.geojson'
	}),
	br: buildNaturalEarthConfig({
		admin: 'Brazil',
		outFile: 'public/data/admin/br-states.geojson'
	}),
	mx: buildNaturalEarthConfig({
		admin: 'Mexico',
		outFile: 'public/data/admin/mx-states.geojson',
		filter: (feature) =>
			feature.properties.name !== null &&
			feature.properties.note !== 'MEX-99 (Mexico minor island)'
	}),
	id: buildNaturalEarthConfig({
		admin: 'Indonesia',
		outFile: 'public/data/admin/id-provinces.geojson'
	}),
	kr: buildNaturalEarthConfig({
		admin: 'South Korea',
		outFile: 'public/data/admin/kr-provinces.geojson'
	}),
	ru: buildNaturalEarthConfig({
		admin: 'Russia',
		outFile: 'public/data/admin/ru-federal-subjects.geojson'
	})
};

async function main() {
	const code = process.argv[2];
	if (!code || !CONFIGS[code]) {
		console.error(`Usage: node scripts/fetch-admin-geojson.mjs <country-code>`);
		console.error(`Supported codes: ${Object.keys(CONFIGS).join(', ')}`);
		process.exit(1);
	}

	const config = CONFIGS[code];
	const features = await config.fetchFeatures();
	const output = {
		type: 'FeatureCollection',
		features
	};

	const outPath = join(ROOT, config.outFile);
	writeFileSync(outPath, JSON.stringify(output));
	console.log(`Written ${features.length} features to ${config.outFile}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
