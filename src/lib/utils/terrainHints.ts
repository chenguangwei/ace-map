import { type Continent, getCountryByCode } from '@/lib/data/countries';
import { getMapScopeForGame } from '@/lib/data/mapScopes';
import type { GameMode, Place } from '@/lib/utils/places';

export interface TerrainHintPack {
	cueLabel: string;
	latitudeBand: string;
	primary: string;
	questionFamily: TerrainQuestionFamily;
	scopeLabel: string;
	secondary: string;
	tags: string[];
}

export type TerrainQuestionFamily =
	| 'administrative'
	| 'feature'
	| 'resource'
	| 'settlement';

type DirectionalKey =
	| 'center'
	| 'east'
	| 'north'
	| 'northeast'
	| 'northwest'
	| 'south'
	| 'southeast'
	| 'southwest'
	| 'west';

interface TerrainProfile {
	family: string;
	relief: string;
	tags: string[];
	clues: Partial<Record<DirectionalKey, string>>;
}

const GLOBAL_BOUNDS = {
	west: -180,
	south: -60,
	east: 180,
	north: 84
};

const CONTINENT_TERRAIN_PROFILES: Record<Continent, TerrainProfile> = {
	africa: {
		family: 'continental plateaus, desert rims and equatorial basins',
		relief: 'plateau read',
		tags: ['plateaus', 'desert rims', 'rift belts'],
		clues: {
			north: 'Look for desert-toned belts and broad dry plains near the northern edge.',
			south: 'Bias toward southern uplands and longer temperate coastal arcs.',
			east: 'Eastern reads often sit near rift country, escarpments or Indian Ocean-facing slopes.',
			west: 'Western reads skew toward Atlantic-facing plains and basin edges.',
			center: 'Central Africa usually reads as basin and rainforest interior, not exposed coastal edge.'
		}
	},
	americas: {
		family: 'western mountain wall, interior plains and long Atlantic-Pacific coasts',
		relief: 'continental relief',
		tags: ['mountain wall', 'interior plains', 'double coasts'],
		clues: {
			northwest:
				'Northwest reads tend to hug Cordillera relief, rugged coasts or cold interior plateaus.',
			west: 'The western side of the Americas usually means mountain chains before broad plains.',
			southwest:
				'Southwest reads often feel drier, higher and closer to Pacific ranges or plateaus.',
			east: 'The eastern side usually opens into Atlantic-facing plains, shields and long seaboards.',
			center: 'Central reads often sit in interior plains, basins or river corridors rather than sharp coastlines.'
		}
	},
	asia: {
		family: 'mountain arcs, inland basins, river plains and long monsoon coasts',
		relief: 'mountain-basin contrast',
		tags: ['mountain arcs', 'river plains', 'monsoon coasts'],
		clues: {
			north: 'Northern Asia often reads colder, flatter or more continental before the true coastal fringes.',
			west: 'Western Asia leans toward plateaus, dry uplands and basin country.',
			east: 'Eastern Asia often reveals long coasts, deltas and humid lowland belts.',
			south: 'Southern Asia tends to compress monsoon plains, peninsulas and mountain walls.',
			center: 'Central reads usually live in continental interiors, basins or steppe belts rather than open seaboards.'
		}
	},
	europe: {
		family: 'river plains, broken peninsulas and mountain rims',
		relief: 'plain-to-rim gradient',
		tags: ['river plains', 'peninsulas', 'mountain rims'],
		clues: {
			north: 'Northern Europe often feels flatter, cooler and more glacial or coastal.',
			south: 'Southern Europe usually pulls toward mountain rims, peninsulas and warmer coasts.',
			east: 'Eastern Europe often opens into broader plains and continental interiors.',
			west: 'Western Europe reads as Atlantic-facing edge, shorter mountain chains and broken coastlines.',
			center: 'Central Europe is usually a transition zone of river corridors, uplands and interior basins.'
		}
	},
	oceania: {
		family: 'island arcs, arid interiors and long ocean-facing coasts',
		relief: 'coast-to-interior contrast',
		tags: ['island arcs', 'ocean rims', 'dry interior'],
		clues: {
			north: 'Northern Oceania reads more tropical, island-fragmented and sea-facing.',
			south: 'Southern Oceania tends toward temperate coasts and larger landmasses.',
			east: 'Eastern reads often break into island arcs and open Pacific-facing edges.',
			west: 'Western reads skew toward larger continental blocks and drier interior transitions.',
			center: 'Central reads usually mean interior plateau or desert logic before coastal complexity.'
		}
	}
};

const COUNTRY_TERRAIN_PROFILES: Record<string, TerrainProfile> = {
	au: {
		family: 'dry interior, coastal rims and eastern highlands',
		relief: 'arid core',
		tags: ['desert interior', 'coastal rim', 'eastern ranges'],
		clues: {
			center: 'Australia usually gives the game away in the dry interior rather than the wetter rim.',
			east: 'The east side leans toward the Great Dividing Range and denser coastal settlement belts.',
			north: 'Northern reads are tropical and closer to the humid rim than the red center.',
			south: 'Southern reads usually hug temperate coastal edges and lower relief corridors.',
			west: 'Western Australia often feels broader, drier and more plateau-like than the east.'
		}
	},
	br: {
		family: 'Amazon basin, Atlantic edge and central highlands',
		relief: 'basin-plus-plateau read',
		tags: ['amazon basin', 'atlantic edge', 'central plateau'],
		clues: {
			north: 'Northern Brazil often reads as Amazon basin rather than exposed ridge country.',
			east: 'The east side points to Atlantic-facing escarpments, longer coast and settled belts.',
			south: 'Southern Brazil feels cooler, greener and more upland than the equatorial north.',
			west: 'Western reads slide toward interior frontier, wetlands and basin margins.',
			center: 'Central Brazil usually means plateau and interior drainage, not immediate coastline.'
		}
	},
	ca: {
		family: 'Cordillera west, shield core and long southern corridor',
		relief: 'west-to-shield gradient',
		tags: ['cordillera', 'shield lakes', 'southern corridor'],
		clues: {
			west: 'Western Canada leans hard into mountain relief and Pacific-draining corridors.',
			east: 'Eastern Canada often feels shield-heavy, river-fed or Atlantic-facing.',
			north: 'Northern reads push into tundra, archipelago logic and sparse relief.',
			south: 'Southern Canada concentrates the lower, more connected settlement corridor.',
			center: 'Central reads often sit in shield-and-lake country or open prairie transitions.'
		}
	},
	cn: {
		family: 'western plateaus, northern dry belts and eastern river plains',
		relief: 'plateau-to-coast gradient',
		tags: ['plateaus', 'river plains', 'humid south'],
		clues: {
			west: 'Western China usually means plateau, basin or dry highland before any easy coast read.',
			east: 'Eastern China is the long coastal plain and delta side of the map.',
			north: 'Northern China leans drier and broader, closer to steppe and loess logic.',
			south: 'Southern China often feels wetter, hillier and more folded than the north.',
			center: 'Central China usually means river systems and interior basins rather than frontier rims.'
		}
	},
	de: {
		family: 'northern low plain, central uplands and alpine south',
		relief: 'plain-upland-alpine stack',
		tags: ['north plain', 'central uplands', 'alpine south'],
		clues: {
			north: 'Northern Germany is flatter and lower, with a true plain read.',
			south: 'Southern Germany quickly trends toward alpine foreland and stronger relief.',
			east: 'Eastern reads are usually gentler and more open than the southwest mountain edges.',
			west: 'Western Germany often feels more valley-cut and upland than the northern plain.',
			center: 'Central Germany is the classic uplands-and-river corridor transition zone.'
		}
	},
	es: {
		family: 'meseta interior, mountain rims and Mediterranean-Atlantic edges',
		relief: 'high interior plateau',
		tags: ['meseta', 'mountain rims', 'mediterranean coast'],
		clues: {
			center: 'Spain often reads from the elevated central plateau before the coasts.',
			east: 'Eastern Spain points toward the Mediterranean strip and nearby ranges.',
			west: 'Western Spain stays more Atlantic-facing and plateau-backed than the east.',
			north: 'The north edge is greener, shorter and closer to mountain rims.',
			south: 'Southern reads drift toward Andalusian basins and warmer coastal belts.'
		}
	},
	fr: {
		family: 'Atlantic west, northern plains and mountain rims to the south-east',
		relief: 'plain-with-rims',
		tags: ['atlantic edge', 'northern plains', 'mountain rims'],
		clues: {
			west: 'Western France is Atlantic-facing and usually softer in relief than the alpine side.',
			east: 'Eastern France sharpens toward alpine, Jura and Rhine-side relief.',
			north: 'Northern France tends to read flatter and more open.',
			south: 'Southern France compresses mountain edges, Mediterranean pull and stronger terrain.',
			center: 'Central France often sits in the upland transition between plains and mountain rims.'
		}
	},
	gb: {
		family: 'western uplands, eastern lowlands and northern highlands',
		relief: 'upland-west / lowland-east',
		tags: ['western uplands', 'eastern lowlands', 'highland north'],
		clues: {
			west: 'The western UK usually means rougher uplands and Atlantic-facing relief.',
			east: 'The eastern side reads lower, broader and more open than the west.',
			north: 'Northern UK pushes toward highland logic before lowland plains.',
			south: 'Southern UK is lower, softer and more settled than the far north.',
			center: 'Central UK tends to balance uplands and lower corridors rather than dramatic coasts.'
		}
	},
	id: {
		family: 'volcanic island arcs, broken seas and equatorial belts',
		relief: 'island-arc relief',
		tags: ['volcanic arcs', 'broken seas', 'equatorial islands'],
		clues: {
			west: 'Western Indonesia leans into denser volcanic island chains and heavier relief.',
			east: 'Eastern Indonesia feels more broken, fragmented and sea-split.',
			north: 'Northern reads stay very ocean-exposed and island-fragmented.',
			south: 'Southern reads hug the ocean-facing volcanic arc rather than interior plains.',
			center: 'Central Indonesia is still archipelago logic first: islands, straits and relief pockets.'
		}
	},
	in: {
		family: 'Himalayan north, plateau core and coastal peninsulas',
		relief: 'mountain wall plus peninsula',
		tags: ['himalayan wall', 'deccan plateau', 'coastal plains'],
		clues: {
			north: 'Northern India runs into the Himalayan wall fast; it rarely reads as open low plain only.',
			south: 'Southern India is peninsula logic: plateau spine with coasts on both sides.',
			east: 'Eastern India gets wetter, more deltaic and closer to Bay-facing plains.',
			west: 'Western India mixes arid edge, coastal strip and plateau shoulder.',
			center: 'Central India usually feels plateau-first, with broad uplands and river basins.'
		}
	},
	it: {
		family: 'alpine north, Apennine spine and twin coasts',
		relief: 'peninsula mountain spine',
		tags: ['alpine wall', 'apennines', 'twin coasts'],
		clues: {
			north: 'Northern Italy is where the alpine wall and Po plain do the heavy lifting.',
			south: 'Southern Italy narrows into peninsula and island logic with a strong mountain spine.',
			east: 'The east side hugs the Adriatic strip and nearby ridges.',
			west: 'The west side reads more Tyrrhenian-facing with mountain slopes close behind.',
			center: 'Central Italy is classic Apennine spine: not fully coastal, not broad interior plain.'
		}
	},
	jp: {
		family: 'narrow island arc, mountain spine and exposed coasts',
		relief: 'mountainous island chain',
		tags: ['island arc', 'mountain spine', 'exposed coast'],
		clues: {
			north: 'Northern Japan feels cooler and more rugged before the denser southern belts.',
			south: 'Southern Japan stays ocean-facing and volcanic-arc in character.',
			east: 'Eastern Japan hugs exposed Pacific coasts with relief close behind.',
			west: 'Western Japan still reads coastal, but with more inland sea and sheltered transitions.',
			center: 'Central Japan is mountain-spine country; broad interior plains are not the default read.'
		}
	},
	kr: {
		family: 'east-facing mountains, western lowlands and broken southern coast',
		relief: 'east-high / west-lower',
		tags: ['east mountains', 'west lowlands', 'south coast'],
		clues: {
			east: 'South Korea reads steepest toward the east, where mountains crowd the coast.',
			west: 'The west side is lower and more open than the east mountain wall.',
			south: 'The south edge gets more broken and coast-heavy.',
			north: 'Northern reads push into rugged interior spine rather than open coastal plain.',
			center: 'Central Korea is a compact interior of ridges and valleys, not a wide flat basin.'
		}
	},
	mx: {
		family: 'sierras, central highlands and gulf-pacific contrasts',
		relief: 'mountain-framed plateau',
		tags: ['sierras', 'central highlands', 'gulf plain'],
		clues: {
			north: 'Northern Mexico trends drier, broader and more plateau-desert in feel.',
			south: 'Southern Mexico is rougher, more tropical and more folded than the north.',
			east: 'Eastern Mexico opens toward Gulf-facing lower plains.',
			west: 'Western Mexico leans harder into Pacific slopes and Sierra relief.',
			center: 'Central Mexico is highland country first, not low coast.'
		}
	},
	ru: {
		family: 'huge continental interior, northern arctic rim and southern mountain margins',
		relief: 'continental scale read',
		tags: ['continental interior', 'arctic rim', 'southern margins'],
		clues: {
			north: 'Northern Russia leans toward arctic rim, tundra and sparse coastal exposure.',
			south: 'Southern Russia is where steppe and mountain-margin logic starts to matter.',
			east: 'Eastern Russia feels more remote, broken and mountain-taiga heavy.',
			west: 'Western Russia opens into the broader European plain.',
			center: 'Central Russia is scale itself: continental interior before obvious coast.'
		}
	},
	us: {
		family: 'western cordillera, central plains and Appalachian-east coast split',
		relief: 'mountains-to-plains gradient',
		tags: ['cordillera', 'great plains', 'appalachians'],
		clues: {
			west: 'The west side of the US usually means ranges, basins and harder relief before broad plains.',
			center: 'The central US reads flatter and more open: plains, basins and long corridors.',
			east: 'Eastern US is more broken by Appalachians, piedmont and long Atlantic-facing belts.',
			south: 'Southern US often opens into coastal plain, lower basins and Gulf-side reads.',
			north: 'Northern US reads cooler and broader, often closer to plains, lakes or mountain rims.'
		}
	}
};

const QUESTION_FAMILY_LABELS: Record<TerrainQuestionFamily, string> = {
	administrative: 'Boundary read',
	feature: 'Landform cue',
	resource: 'Resource belt',
	settlement: 'Settlement cue'
};

const toZone = (progress: number) => {
	if (progress <= 0.22) return 'outer-low';
	if (progress <= 0.4) return 'inner-low';
	if (progress >= 0.78) return 'outer-high';
	if (progress >= 0.6) return 'inner-high';
	return 'center';
};

const getLatitudeBand = (latitude: number) => {
	const absoluteLatitude = Math.abs(latitude);
	if (absoluteLatitude < 12) return 'equatorial belt';
	if (absoluteLatitude < 24) return 'tropical band';
	if (absoluteLatitude < 36) return 'subtropical belt';
	if (absoluteLatitude < 52) return 'temperate belt';
	return 'high-latitude belt';
};

const getScopeLabel = ({
	category,
	countryCode,
	mode
}: {
	category: 'all' | string[];
	countryCode: string;
	mode: GameMode;
}) => {
	if (mode === 'country') {
		return getCountryByCode(countryCode)?.name ?? countryCode.toUpperCase();
	}

	if (mode === 'world' && category !== 'all' && category.length === 1) {
		return category[0];
	}

	return 'World';
};

const getDirectionalKey = (
	verticalZone: string,
	horizontalZone: string
): DirectionalKey => {
	const vertical =
		verticalZone === 'center'
			? 'center'
			: verticalZone === 'outer-high' || verticalZone === 'inner-high'
				? 'north'
				: 'south';
	const horizontal =
		horizontalZone === 'center'
			? 'center'
			: horizontalZone === 'outer-high' || horizontalZone === 'inner-high'
				? 'east'
				: 'west';

	if (vertical === 'center' && horizontal === 'center') return 'center';
	if (vertical === 'center') return horizontal;
	if (horizontal === 'center') return vertical;
	return `${vertical}${horizontal}` as DirectionalKey;
};

const getPositionLabel = (direction: DirectionalKey) => {
	switch (direction) {
		case 'north':
			return 'northern belt';
		case 'northeast':
			return 'northeast corner';
		case 'northwest':
			return 'northwest corner';
		case 'south':
			return 'southern belt';
		case 'southeast':
			return 'southeast corner';
		case 'southwest':
			return 'southwest corner';
		case 'east':
			return 'eastern flank';
		case 'west':
			return 'western flank';
		default:
			return 'central interior';
	}
};

const getTerrainProfile = ({
	category,
	countryCode,
	mode
}: {
	category: 'all' | string[];
	countryCode: string;
	mode: GameMode;
}) => {
	if (mode === 'country') {
		return COUNTRY_TERRAIN_PROFILES[countryCode] ?? null;
	}

	if (mode === 'world' && category !== 'all' && category.length === 1) {
		const continentName = category[0].toLowerCase() as Continent;
		return CONTINENT_TERRAIN_PROFILES[continentName] ?? null;
	}

	return null;
};

const inferQuestionFamily = (
	category: 'all' | string[],
	mode: GameMode
): TerrainQuestionFamily => {
	if (mode === 'world') return 'administrative';
	if (category === 'all' || category.length === 0) return 'administrative';

	const label = category.join(' ').toLowerCase();

	if (
		/capital|city|cities|county|province|prefecture|state|region|country/.test(
			label
		)
	) {
		return /city|cities|capital/.test(label)
			? 'settlement'
			: 'administrative';
	}

	if (
		/park|landmark|nature|wonder|heritage|historic|history|site/.test(label)
	) {
		return 'feature';
	}

	if (
		/port|airport|dam|mine|oil|thermal|nuclear|steel|textile|software/.test(
			label
		)
	) {
		return 'resource';
	}

	return 'administrative';
};

const getFamilyGuidance = (
	family: TerrainQuestionFamily,
	scopeLabel: string
) => {
	switch (family) {
		case 'feature':
			return `Expect bolder physical signatures in ${scopeLabel}: coastlines, volcanic arcs, mountain belts or exposed natural edges.`;
		case 'resource':
			return `Bias toward working corridors in ${scopeLabel}: river basins, coasts, extractive belts and connected interior plains.`;
		case 'settlement':
			return `Urban targets in ${scopeLabel} usually favor lower corridors, coasts, basins or transport-friendly plains over rough relief.`;
		default:
			return `Treat ${scopeLabel} as a boundary read first: compare uplands, plains, coasts and neighboring relief transitions.`;
	}
};

export const getTerrainHintPack = ({
	category,
	countryCode,
	mode,
	place
}: {
	category: 'all' | string[];
	countryCode: string;
	mode: GameMode;
	place: Place | null;
}): TerrainHintPack | null => {
	if (!place) return null;

	const scope = getMapScopeForGame({ mode, countryCode, category });
	const bounds = scope?.bounds ?? GLOBAL_BOUNDS;
	const horizontalProgress =
		(place.longitude - bounds.west) / (bounds.east - bounds.west);
	const verticalProgress =
		(place.latitude - bounds.south) / (bounds.north - bounds.south);
	const horizontalZone = toZone(horizontalProgress);
	const verticalZone = toZone(verticalProgress);
	const direction = getDirectionalKey(verticalZone, horizontalZone);
	const positionLabel = getPositionLabel(direction);
	const latitudeBand = getLatitudeBand(place.latitude);
	const scopeLabel = getScopeLabel({ mode, countryCode, category });
	const hemisphereLabel =
		place.latitude >= 0 ? 'northern hemisphere' : 'southern hemisphere';
	const profile = getTerrainProfile({ mode, countryCode, category });
	const reliefCue = profile?.clues[direction] ?? profile?.clues.center;
	const questionFamily = inferQuestionFamily(category, mode);
	const familyGuidance = getFamilyGuidance(questionFamily, scopeLabel);

	return {
		cueLabel: QUESTION_FAMILY_LABELS[questionFamily],
		questionFamily,
		scopeLabel,
		latitudeBand,
		primary:
			reliefCue ??
			`Read the ${positionLabel} of ${scopeLabel} before locking the guess.`,
		secondary: profile
			? `${familyGuidance} ${profile.family} • ${latitudeBand} • ${hemisphereLabel}`
			: `${familyGuidance} ${latitudeBand} • ${positionLabel} • ${hemisphereLabel}`,
		tags: profile
			? [
					scopeLabel,
					QUESTION_FAMILY_LABELS[questionFamily],
					profile.relief,
					...profile.tags
				]
			: [
					scopeLabel,
					QUESTION_FAMILY_LABELS[questionFamily],
					positionLabel,
					latitudeBand
				]
	};
};
