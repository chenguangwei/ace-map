#!/usr/bin/env node
// Fetches and transforms admin boundary GeoJSON files for use in ace-map.
// Usage: node scripts/fetch-admin-geojson.mjs <country-code>
// Supported: jp

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CONFIGS = {
  jp: {
    url: 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson',
    outFile: 'public/data/admin/jp-prefectures.geojson',
    nameProperty: 'nam', // English prefecture name
    transform: (feature, nameProp) => {
      // Strip Japanese administrative suffixes: Ken, Fu, To
      // Special case: "Hokkai Do" -> "Hokkaido" (not "Hokkai")
      const raw = feature.properties[nameProp] || '';
      const name = raw === 'Hokkai Do'
        ? 'Hokkaido'
        : raw.replace(/\s+(Ken|Fu|To)$/i, '');
      return {
        type: 'Feature',
        geometry: feature.geometry,
        properties: { name },
      };
    },
  },
};

async function main() {
  const code = process.argv[2];
  if (!code || !CONFIGS[code]) {
    console.error(`Usage: node scripts/fetch-admin-geojson.mjs <country-code>`);
    console.error(`Supported codes: ${Object.keys(CONFIGS).join(', ')}`);
    process.exit(1);
  }

  const config = CONFIGS[code];
  console.log(`Fetching ${config.url} ...`);

  const res = await fetch(config.url);
  if (!res.ok) {
    console.error(`Fetch failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const raw = await res.json();

  // Log first feature properties for debugging
  if (raw.features && raw.features.length > 0) {
    console.log('First feature properties:', JSON.stringify(raw.features[0].properties));
  }

  const features = raw.features.map((f) => config.transform(f, config.nameProperty));

  const output = {
    type: 'FeatureCollection',
    features,
  };

  const outPath = join(ROOT, config.outFile);
  writeFileSync(outPath, JSON.stringify(output));
  console.log(`Written ${features.length} features to ${config.outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
