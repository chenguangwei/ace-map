# Country Region Overlays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add province/state/nation boundary highlighting to Japan, China, India, and United Kingdom map quizzes (matching the existing US and Germany implementations).

**Architecture:** Each country needs two things: (1) a GeoJSON file under `public/data/admin/` with admin-1 boundaries and English feature names, and (2) a config entry in `countryRegions.ts` that maps place-name labels to GeoJSON feature names. India also needs a new region data file. UK needs a new category added to its existing data file.

**Tech Stack:** TypeScript, MapLibre GL JS, Node.js fetch scripts, GeoJSON

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `public/data/admin/jp-prefectures.geojson` | Replace | Complete 47-prefecture file with English names |
| `public/data/admin/cn-provinces.geojson` | Create | 34 Chinese admin-1 units with English names |
| `public/data/admin/in-states.geojson` | Create | Indian states & union territories |
| `public/data/admin/gb-nations.geojson` | Create | England, Scotland, Wales, Northern Ireland |
| `src/lib/data/regions/in.ts` | Create | India state capitals in `City (State)` format |
| `src/lib/data/regions/index.ts` | Modify | Import `inPlaces` instead of `predefinedPlaces` for `in` key |
| `src/lib/data/regions/gb.ts` | Modify | Add `Nation Capitals` category with `City (Nation)` format |
| `src/lib/utils/countryRegions.ts` | Modify | Add `jp`, `cn`, `in`, `gb` to `COUNTRY_REGION_CONFIGS` |
| `scripts/fetch-admin-geojson.mjs` | Create | One-time fetch script to download & transform GeoJSON |

---

## Task 1: Create GeoJSON fetch script and download Japan data

**Files:**
- Create: `scripts/fetch-admin-geojson.mjs`
- Replace: `public/data/admin/jp-prefectures.geojson`

- [ ] **Step 1: Create the fetch script**

```javascript
// scripts/fetch-admin-geojson.mjs
// One-time script to download and transform admin-1 GeoJSON files.
// Run: node scripts/fetch-admin-geojson.mjs <country>
// e.g. node scripts/fetch-admin-geojson.mjs jp

import { writeFileSync } from 'fs';

const SOURCES = {
  jp: {
    url: 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson',
    outPath: 'public/data/admin/jp-prefectures.geojson',
    // Source uses 'nam' for English prefecture name
    transform: (feature) => ({
      ...feature,
      properties: { name: feature.properties.nam }
    })
  }
};

const [, , country] = process.argv;
if (!country || !SOURCES[country]) {
  console.error('Usage: node scripts/fetch-admin-geojson.mjs <country>');
  console.error('Available:', Object.keys(SOURCES).join(', '));
  process.exit(1);
}

const { url, outPath, transform } = SOURCES[country];
console.log(`Fetching ${url}...`);
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const geojson = await res.json();

const transformed = {
  type: 'FeatureCollection',
  features: geojson.features.map(transform)
};

writeFileSync(outPath, JSON.stringify(transformed));
console.log(`Written ${transformed.features.length} features to ${outPath}`);
```

- [ ] **Step 2: Run the script for Japan**

```bash
node scripts/fetch-admin-geojson.mjs jp
```

Expected output: `Written 47 features to public/data/admin/jp-prefectures.geojson`

- [ ] **Step 3: Verify the feature names match jp.ts**

The prefectures referenced in `src/lib/data/regions/jp.ts` (category `Prefecture Capitals`) use `City (PrefectureName)` format. Check that the GeoJSON contains feature names for every prefecture name in parentheses.

```bash
node -e "
const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('public/data/admin/jp-prefectures.geojson', 'utf8'));
const names = gj.features.map(f => f.properties.name).sort();
console.log('Feature count:', names.length);
console.log('Sample:', names.slice(0,5));
"
```

Expected: 47 features. Sample should show English names like `Aichi`, `Akita`, `Aomori`, etc.

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-admin-geojson.mjs public/data/admin/jp-prefectures.geojson
git commit -m "feat: add GeoJSON fetch script, replace jp-prefectures with complete 47-pref file"
```

---

## Task 2: Download China provinces GeoJSON

**Files:**
- Modify: `scripts/fetch-admin-geojson.mjs` (add `cn` entry)
- Create: `public/data/admin/cn-provinces.geojson`

The China region labels in `cn.ts` are: `Hebei`, `Shanxi`, `Inner Mongolia`, `Liaoning`, `Jilin`, `Heilongjiang`, `Jiangsu`, `Zhejiang`, `Anhui`, `Fujian`, `Jiangxi`, `Shandong`, `Henan`, `Hubei`, `Hunan`, `Guangdong`, `Guangxi`, `Hainan`, `Sichuan`, `Guizhou`, `Yunnan`, `Tibet`, `Shaanxi`, `Gansu`, `Qinghai`, `Ningxia`, `Xinjiang`. Plus direct-controlled municipalities Beijing, Shanghai, Tianjin, Chongqing (no parentheses in cn.ts, so no region matching needed for them — but the GeoJSON should still include them).

Natural Earth admin-1 uses English names. We'll filter to Chinese provinces only.

- [ ] **Step 1: Add `cn` source to the fetch script**

Edit `scripts/fetch-admin-geojson.mjs`. Add this entry to `SOURCES`:

```javascript
cn: {
  url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CHN.geo.json',
  outPath: 'public/data/admin/cn-provinces.geojson',
  transform: (feature) => ({
    ...feature,
    properties: { name: feature.properties.name }
  })
}
```

- [ ] **Step 2: Run the script for China**

```bash
node scripts/fetch-admin-geojson.mjs cn
```

Expected output: `Written N features to public/data/admin/cn-provinces.geojson`

- [ ] **Step 3: Verify feature names align with cn.ts**

```bash
node -e "
const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('public/data/admin/cn-provinces.geojson', 'utf8'));
const names = gj.features.map(f => f.properties.name).sort();
console.log('Feature count:', names.length);
console.log('All names:', names);
"
```

Check that the names cover the regions referenced in `cn.ts`. The cn.ts labels use short English names (e.g. `Hebei`, `Inner Mongolia`, `Tibet`). If the downloaded source uses different casing or wording (e.g. `Nei Mongol` instead of `Inner Mongolia`), you must add a name-mapping table — see the manual correction step below.

- [ ] **Step 4: If feature names don't match — add a CN_NAME_MAP**

If the GeoJSON source uses different names (common for Inner Mongolia, Tibet, Xinjiang), add a mapping to the `cn` transform in the script:

```javascript
cn: {
  url: '...',
  outPath: 'public/data/admin/cn-provinces.geojson',
  nameMap: {
    'Nei Mongol': 'Inner Mongolia',
    'Xizang': 'Tibet',
    'Guangxi Zhuang': 'Guangxi',
    'Ningxia Hui': 'Ningxia',
    'Xinjiang Uygur': 'Xinjiang'
  },
  transform(feature) {
    const raw = feature.properties.name;
    const mapped = this.nameMap[raw] ?? raw;
    return { ...feature, properties: { name: mapped } };
  }
}
```

Re-run: `node scripts/fetch-admin-geojson.mjs cn`

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-admin-geojson.mjs public/data/admin/cn-provinces.geojson
git commit -m "feat: add cn-provinces GeoJSON"
```

---

## Task 3: Create India state data and GeoJSON

**Files:**
- Create: `src/lib/data/regions/in.ts`
- Modify: `src/lib/data/regions/index.ts`
- Modify: `scripts/fetch-admin-geojson.mjs` (add `in` entry)
- Create: `public/data/admin/in-states.geojson`

- [ ] **Step 1: Create `src/lib/data/regions/in.ts`**

```typescript
import type { PlaceItems } from '@/lib/utils/places';

export const inPlaces: PlaceItems[] = [
	{
		category: 'State Capitals',
		places: [
			{ name: 'Patna (Bihar)', latitude: 25.5941, longitude: 85.1376 },
			{ name: 'Raipur (Chhattisgarh)', latitude: 21.2514, longitude: 81.6296 },
			{ name: 'Panaji (Goa)', latitude: 15.4909, longitude: 73.8278 },
			{ name: 'Gandhinagar (Gujarat)', latitude: 23.2156, longitude: 72.6369 },
			{ name: 'Chandigarh (Haryana)', latitude: 30.7333, longitude: 76.7794 },
			{ name: 'Shimla (Himachal Pradesh)', latitude: 31.1048, longitude: 77.1734 },
			{ name: 'Ranchi (Jharkhand)', latitude: 23.3441, longitude: 85.3096 },
			{ name: 'Bengaluru (Karnataka)', latitude: 12.9716, longitude: 77.5946 },
			{ name: 'Thiruvananthapuram (Kerala)', latitude: 8.5241, longitude: 76.9366 },
			{ name: 'Bhopal (Madhya Pradesh)', latitude: 23.2599, longitude: 77.4126 },
			{ name: 'Mumbai (Maharashtra)', latitude: 19.076, longitude: 72.8777 },
			{ name: 'Imphal (Manipur)', latitude: 24.817, longitude: 93.9368 },
			{ name: 'Shillong (Meghalaya)', latitude: 25.5788, longitude: 91.8933 },
			{ name: 'Aizawl (Mizoram)', latitude: 23.7271, longitude: 92.7176 },
			{ name: 'Kohima (Nagaland)', latitude: 25.6751, longitude: 94.1086 },
			{ name: 'Bhubaneswar (Odisha)', latitude: 20.2961, longitude: 85.8245 },
			{ name: 'Chandigarh (Punjab)', latitude: 30.7333, longitude: 76.7794 },
			{ name: 'Jaipur (Rajasthan)', latitude: 26.9124, longitude: 75.7873 },
			{ name: 'Gangtok (Sikkim)', latitude: 27.3389, longitude: 88.6065 },
			{ name: 'Chennai (Tamil Nadu)', latitude: 13.0827, longitude: 80.2707 },
			{ name: 'Hyderabad (Telangana)', latitude: 17.385, longitude: 78.4867 },
			{ name: 'Agartala (Tripura)', latitude: 23.8315, longitude: 91.2868 },
			{ name: 'Lucknow (Uttar Pradesh)', latitude: 26.8467, longitude: 80.9462 },
			{ name: 'Dehradun (Uttarakhand)', latitude: 30.3165, longitude: 78.0322 },
			{ name: 'Kolkata (West Bengal)', latitude: 22.5726, longitude: 88.3639 },
			{ name: 'New Delhi (Delhi)', latitude: 28.6139, longitude: 77.209 },
			{ name: 'Jammu (Jammu and Kashmir)', latitude: 32.7266, longitude: 74.857 },
			{ name: 'Leh (Ladakh)', latitude: 34.1526, longitude: 77.5771 },
			{ name: 'Itanagar (Arunachal Pradesh)', latitude: 27.0844, longitude: 93.6053 },
			{ name: 'Dispur (Assam)', latitude: 26.1445, longitude: 91.7362 }
		]
	}
];
```

- [ ] **Step 2: Update `src/lib/data/regions/index.ts`**

Add the import and change the `in` mapping:

```typescript
import { inPlaces } from './in';
```

Change:
```typescript
in: predefinedPlaces,
```
To:
```typescript
in: [...inPlaces, ...predefinedPlaces],
```

This preserves the existing CBSE quiz categories while adding the new State Capitals category first.

- [ ] **Step 3: Add `in` source to the fetch script**

Add to `SOURCES` in `scripts/fetch-admin-geojson.mjs`:

```javascript
in: {
  url: 'https://raw.githubusercontent.com/datameet/india-election-data/master/assembly-constituencies/States_2019.geojson',
  outPath: 'public/data/admin/in-states.geojson',
  nameMap: {
    'Jammu & Kashmir': 'Jammu and Kashmir',
    'Uttaranchal': 'Uttarakhand',
    'Orissa': 'Odisha',
    'NCT of Delhi': 'Delhi',
    'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli',
    'Daman & Diu': 'Daman and Diu'
  },
  transform(feature) {
    const raw = feature.properties.NAME_1 ?? feature.properties.ST_NM ?? feature.properties.name;
    const mapped = this.nameMap[raw] ?? raw;
    return { ...feature, properties: { name: mapped } };
  }
}
```

- [ ] **Step 4: Run the script for India**

```bash
node scripts/fetch-admin-geojson.mjs in
```

If the URL returns a 404 or wrong format, try this alternative source and adjust the property key accordingly:

```
https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson
```

Check output: `Written N features to public/data/admin/in-states.geojson`

- [ ] **Step 5: Verify feature names match in.ts**

```bash
node -e "
const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('public/data/admin/in-states.geojson', 'utf8'));
const names = new Set(gj.features.map(f => f.properties.name).sort());

// States from in.ts (the region label inside parentheses)
const expected = ['Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir',
  'Ladakh','Arunachal Pradesh','Assam'];

const missing = expected.filter(e => !names.has(e));
if (missing.length) console.log('MISSING:', missing);
else console.log('All state names matched!');
"
```

Fix any mismatches by adding entries to the `nameMap` in the script and re-running.

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-admin-geojson.mjs public/data/admin/in-states.geojson \
        src/lib/data/regions/in.ts src/lib/data/regions/index.ts
git commit -m "feat: add India state capitals data and in-states GeoJSON"
```

---

## Task 4: Add UK nations GeoJSON and update gb.ts

**Files:**
- Modify: `src/lib/data/regions/gb.ts`
- Modify: `scripts/fetch-admin-geojson.mjs` (add `gb` entry)
- Create: `public/data/admin/gb-nations.geojson`

The UK will highlight its 4 constituent nations (England, Scotland, Wales, Northern Ireland). We add a new `Nation Capitals` category to `gb.ts` using `City (Nation)` format.

- [ ] **Step 1: Add `Nation Capitals` category to `src/lib/data/regions/gb.ts`**

Add this as the **first** category in the `gbPlaces` array:

```typescript
{
  category: 'Nation Capitals',
  places: [
    { name: 'London (England)', latitude: 51.5074, longitude: -0.1278 },
    { name: 'Edinburgh (Scotland)', latitude: 55.9533, longitude: -3.1883 },
    { name: 'Cardiff (Wales)', latitude: 51.4816, longitude: -3.1791 },
    { name: 'Belfast (Northern Ireland)', latitude: 54.5973, longitude: -5.9301 }
  ]
},
```

- [ ] **Step 2: Add `gb` source to the fetch script**

Add to `SOURCES` in `scripts/fetch-admin-geojson.mjs`:

```javascript
gb: {
  url: 'https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/gb/topo_eer.json',
  outPath: 'public/data/admin/gb-nations.geojson',
  transform: (feature) => ({
    ...feature,
    properties: { name: feature.properties.EER13NM ?? feature.properties.name }
  })
}
```

> **Note:** If this URL returns electoral regions instead of nations, use this alternative which has the 4-nation breakdown:
> `https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson`
> filtered to `GBR` and subdivided. The simplest reliable option is to inline the 4-nation GeoJSON directly (see Step 2a).

- [ ] **Step 2a (fallback): Inline the 4-nation GeoJSON if fetch source is wrong**

If the fetched data doesn't produce exactly 4 features named `England`, `Scotland`, `Wales`, `Northern Ireland`, add this entry to SOURCES instead:

```javascript
gb: {
  url: 'https://raw.githubusercontent.com/radicallyopensecurity/opendata/main/uk-countries.geojson',
  outPath: 'public/data/admin/gb-nations.geojson',
  transform: (feature) => ({
    ...feature,
    properties: { name: feature.properties.CTRY22NM ?? feature.properties.name }
  })
}
```

Or use the ONS Open Geography Portal API which reliably returns the 4 countries:
```
https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Countries_December_2022_GB_BUC/FeatureServer/0/query?where=1%3D1&outFields=CTRY22NM&f=geojson
```

- [ ] **Step 3: Run the script for UK**

```bash
node scripts/fetch-admin-geojson.mjs gb
```

- [ ] **Step 4: Verify output has exactly 4 features**

```bash
node -e "
const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('public/data/admin/gb-nations.geojson', 'utf8'));
console.log('Features:', gj.features.map(f => f.properties.name));
"
```

Expected: `['England', 'Scotland', 'Wales', 'Northern Ireland']`

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-admin-geojson.mjs public/data/admin/gb-nations.geojson \
        src/lib/data/regions/gb.ts
git commit -m "feat: add UK nations GeoJSON and Nation Capitals category to gb.ts"
```

---

## Task 5: Wire up all 4 countries in countryRegions.ts

**Files:**
- Modify: `src/lib/utils/countryRegions.ts`

- [ ] **Step 1: Update `SupportedCountryCode` type and `COUNTRY_REGION_CONFIGS`**

In `src/lib/utils/countryRegions.ts`, make the following changes:

**Change line 13** from:
```typescript
type SupportedCountryCode = 'de' | 'us';
```
To:
```typescript
type SupportedCountryCode = 'de' | 'us' | 'jp' | 'cn' | 'in' | 'gb';
```

**Add `JP_PREFECTURE_NAME_OVERRIDES`** after the `DE_FEATURE_TO_DISPLAY_LABEL` block (around line 76):

```typescript
// jp.ts uses English prefecture names directly (e.g. "Hokkaido"), which match
// the GeoJSON feature names from dataofjapan/land after our transform.
// No alias map needed — normalizeRegionName handles the comparison.
```

**Add entries to `COUNTRY_REGION_CONFIGS`** after the `de` entry:

```typescript
jp: {
  countryCode: 'jp',
  enabledCategory: 'Prefecture Capitals',
  geojsonPath: '/data/admin/jp-prefectures.geojson',
  featureNameProperty: 'name',
  parsePlaceRegionLabel: (place) => {
    const match = place.name.match(/\(([^)]+)\)\s*$/);
    return match?.[1]?.trim() ?? null;
  },
  normalizeFeatureName: (featureName) => normalizeRegionName(featureName),
  toDisplayLabel: (featureName) => featureName
},
cn: {
  countryCode: 'cn',
  enabledCategory: 'Province Capitals',
  geojsonPath: '/data/admin/cn-provinces.geojson',
  featureNameProperty: 'name',
  parsePlaceRegionLabel: (place) => {
    const match = place.name.match(/\(([^)]+)\)\s*$/);
    return match?.[1]?.trim() ?? null;
  },
  normalizeFeatureName: (featureName) => normalizeRegionName(featureName),
  toDisplayLabel: (featureName) => featureName
},
in: {
  countryCode: 'in',
  enabledCategory: 'State Capitals',
  geojsonPath: '/data/admin/in-states.geojson',
  featureNameProperty: 'name',
  parsePlaceRegionLabel: (place) => {
    const match = place.name.match(/\(([^)]+)\)\s*$/);
    return match?.[1]?.trim() ?? null;
  },
  normalizeFeatureName: (featureName) => normalizeRegionName(featureName),
  toDisplayLabel: (featureName) => featureName
},
gb: {
  countryCode: 'gb',
  enabledCategory: 'Nation Capitals',
  geojsonPath: '/data/admin/gb-nations.geojson',
  featureNameProperty: 'name',
  parsePlaceRegionLabel: (place) => {
    const match = place.name.match(/\(([^)]+)\)\s*$/);
    return match?.[1]?.trim() ?? null;
  },
  normalizeFeatureName: (featureName) => normalizeRegionName(featureName),
  toDisplayLabel: (featureName) => featureName
},
```

- [ ] **Step 2: Fix the `resolveCountryPlaceSelection` function**

The current implementation has a `de`-specific branch for `featureName` (lines 204-208 in countryRegions.ts). Generalize it so it doesn't hard-code `de`:

```typescript
// Before (around line 204):
const featureName =
  countryCode === 'de'
    ? (DE_STATE_LABEL_TO_FEATURE[normalizeRegionName(regionLabel)] ?? regionLabel)
    : regionLabel;
```

This stays as-is — for `jp`, `cn`, `in`, `gb` the `featureName` will just be the `regionLabel` directly, which is correct since those countries don't need a separate label→feature mapping.

- [ ] **Step 3: Build and type-check**

```bash
cd /Users/chenguangwei/Documents/workspaceself/ace-map
npm run build 2>&1 | tail -30
```

Expected: no TypeScript errors. The `COUNTRY_REGION_INDEX` map is constructed from `Object.values(COUNTRY_REGION_CONFIGS)` so new entries are automatically indexed.

- [ ] **Step 4: Smoke test in the browser**

```bash
npm run dev
```

Open the Japan Map Quiz, select the "Prefecture Capitals" category. Click a prefecture capital — the corresponding prefecture polygon should highlight on the map. Repeat for China (Province Capitals), India (State Capitals), and UK (Nation Capitals).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/countryRegions.ts
git commit -m "feat: add jp, cn, in, gb to country region overlay configs"
```

---

## Self-Review

**Spec coverage:**
- ✅ Japan prefecture boundaries: Tasks 1 + 5
- ✅ China province boundaries: Tasks 2 + 5
- ✅ India state boundaries: Tasks 3 + 5
- ✅ UK nation boundaries: Tasks 4 + 5
- ✅ Region highlighting on answer reveal: handled by existing Game.tsx logic via `getCountryRegionStaticSource` / `resolveCountryPlaceSelection` — no changes needed there

**Potential issues:**
- The GeoJSON sources in the fetch script are best-effort URLs. If a URL returns a 404 or wrong format, the script's Step 3/4 verification will catch it and the task includes fallback instructions.
- `Beijing`, `Shanghai`, `Tianjin`, `Chongqing` in cn.ts have no `(Province)` suffix — `parsePlaceRegionLabel` returns `null` for them, so no region highlight fires. This is correct behavior (they are direct-controlled municipalities, not provinces).
- `Chandigarh` appears in both Haryana and Punjab state capitals in in.ts. The `COUNTRY_REGION_INDEX` will store only the last one for the `chandigarh` key. This means one of the two places won't resolve. Acceptable edge case — Chandigarh is a union territory that serves as capital of both states.
