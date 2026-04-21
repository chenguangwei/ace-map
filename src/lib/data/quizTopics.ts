import {
	CONTINENT_LABELS,
	type Continent,
	FEATURED_COUNTRIES,
	getCountryByCode
} from '@/lib/data/countries';
import { type GameMode, Strictness, WorldStrictness } from '@/lib/utils/places';
import {
	getCountryCategories,
	getCountryRegions,
	worldPlaces
} from './regions';

export interface QuizGameConfig {
	mode: GameMode;
	countryCode?: string;
	category: 'all' | string[];
	strictness: number;
}

export type QuizTopicKind = 'root' | 'subtopic';

export interface QuizTopic {
	slug: string;
	kind: QuizTopicKind;
	parentSlug?: string;
	countryCode?: string;
	section: 'popular' | 'continents' | 'countries';
	badge: string;
	title: string;
	shortTitle: string;
	seoTitle: string;
	seoDescription: string;
	description: string;
	primaryKeyword: string;
	searchIntent: string;
	learningFocus: string;
	questionCount: number;
	categoryLabels?: string[];
	benefits: string[];
	highlights: string[];
	faq: Array<{
		question: string;
		answer: string;
	}>;
	relatedSlugs: string[];
	gameConfig: QuizGameConfig;
}

interface QuizTopicSectionMeta {
	id: QuizTopic['section'];
	title: string;
	description: string;
}

interface CountrySubtopicDef {
	slug: string;
	parentSlug: string;
	countryCode: string;
	title: string;
	shortTitle: string;
	primaryKeyword: string;
	categories: string[];
	learningFocus: string;
	searchIntent: string;
	description: string;
	seoDescription?: string;
	benefits?: string[];
	highlights?: string[];
	faq?: Array<{
		question: string;
		answer: string;
	}>;
}

const DAILY_CHALLENGE_EPOCH = Date.UTC(2026, 0, 1);

const quizSectionMeta: QuizTopicSectionMeta[] = [
	{
		id: 'popular',
		title: 'Popular Geography Quizzes',
		description:
			'High-intent quiz pages designed to capture broad geography and map quiz searches.'
	},
	{
		id: 'continents',
		title: 'Continent Map Quizzes',
		description:
			'Focused quizzes for users searching for continent-specific country practice.'
	},
	{
		id: 'countries',
		title: 'Country-Focused Map Quizzes',
		description:
			'Deeper quiz pages for countries, states, capitals, and landmark practice.'
	}
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

const countPlaces = (groups: typeof worldPlaces) =>
	groups.reduce((total, group) => total + group.places.length, 0);

const WORLD_TOPIC_DEFS = [
	{
		slug: 'world-map-quiz',
		continent: null,
		title: 'World Map Quiz',
		shortTitle: 'World Quiz',
		badge: 'Top Query',
		description:
			'Practice locating countries on a clean world map with instant distance feedback and fast replay loops.',
		primaryKeyword: 'world map quiz',
		searchIntent: 'Broad geography quiz and map quiz searches',
		learningFocus: 'Countries across every continent',
		questionCount: countPlaces(worldPlaces),
		gameConfig: {
			mode: 'world' as const,
			category: 'all' as const,
			strictness: WorldStrictness.Medium
		}
	},
	{
		slug: 'asia-countries-quiz',
		continent: 'asia' as Continent,
		title: 'Asia Countries Quiz',
		shortTitle: 'Asia Quiz',
		badge: 'Continent Focus',
		description:
			'Train on Asian countries only, with an interactive map flow optimized for repeat practice.',
		primaryKeyword: 'asia countries quiz',
		searchIntent: 'Continent-specific geography practice',
		learningFocus: 'Asian countries and regional recall',
		questionCount:
			worldPlaces.find((group) => group.category === 'Asia')?.places
				.length ?? 0,
		gameConfig: {
			mode: 'world' as const,
			category: ['Asia'],
			strictness: WorldStrictness.Medium
		}
	},
	{
		slug: 'europe-countries-quiz',
		continent: 'europe' as Continent,
		title: 'Europe Countries Quiz',
		shortTitle: 'Europe Quiz',
		badge: 'Continent Focus',
		description:
			'Learn European country positions with instant corrections and compact replay loops.',
		primaryKeyword: 'europe countries quiz',
		searchIntent: 'Continent-specific geography practice',
		learningFocus: 'European country recognition and map memory',
		questionCount:
			worldPlaces.find((group) => group.category === 'Europe')?.places
				.length ?? 0,
		gameConfig: {
			mode: 'world' as const,
			category: ['Europe'],
			strictness: WorldStrictness.High
		}
	},
	{
		slug: 'americas-countries-quiz',
		continent: 'americas' as Continent,
		title: 'Americas Countries Quiz',
		shortTitle: 'Americas Quiz',
		badge: 'Continent Focus',
		description:
			'Practice North and South American countries in one replayable map challenge.',
		primaryKeyword: 'americas countries quiz',
		searchIntent: 'Continent-specific geography practice',
		learningFocus:
			'North America, Central America, and South America recall',
		questionCount:
			worldPlaces.find((group) => group.category === 'Americas')?.places
				.length ?? 0,
		gameConfig: {
			mode: 'world' as const,
			category: ['Americas'],
			strictness: WorldStrictness.Medium
		}
	},
	{
		slug: 'africa-countries-quiz',
		continent: 'africa' as Continent,
		title: 'Africa Countries Quiz',
		shortTitle: 'Africa Quiz',
		badge: 'Continent Focus',
		description:
			'Drill African countries with immediate answer comparison and clean map interactions.',
		primaryKeyword: 'africa countries quiz',
		searchIntent: 'Continent-specific geography practice',
		learningFocus: 'African country placement and recognition',
		questionCount:
			worldPlaces.find((group) => group.category === 'Africa')?.places
				.length ?? 0,
		gameConfig: {
			mode: 'world' as const,
			category: ['Africa'],
			strictness: WorldStrictness.Medium
		}
	},
	{
		slug: 'oceania-countries-quiz',
		continent: 'oceania' as Continent,
		title: 'Oceania Countries Quiz',
		shortTitle: 'Oceania Quiz',
		badge: 'Continent Focus',
		description:
			'Focus on Oceania with a small, high-replay map quiz covering Australia, New Zealand, and island nations.',
		primaryKeyword: 'oceania countries quiz',
		searchIntent: 'Continent-specific geography practice',
		learningFocus: 'Oceania country and island placement',
		questionCount:
			worldPlaces.find((group) => group.category === 'Oceania')?.places
				.length ?? 0,
		gameConfig: {
			mode: 'world' as const,
			category: ['Oceania'],
			strictness: WorldStrictness.High
		}
	}
] as const;

const baseBenefits = [
	'Immediate submit feedback with visible correct-vs-guessed positions',
	'Distance-based grading that rewards close answers',
	'Fast restart loop for repeated map memory practice'
];

const buildWorldTopic = (def: (typeof WORLD_TOPIC_DEFS)[number]): QuizTopic => {
	const readableCategory =
		def.gameConfig.category === 'all'
			? 'countries from every continent'
			: `${def.gameConfig.category[0]} countries`;

	return {
		slug: def.slug,
		kind: 'root',
		section: def.continent ? 'continents' : 'popular',
		badge: def.badge,
		title: def.title,
		shortTitle: def.shortTitle,
		seoTitle: `${def.title} | Interactive Geography Practice`,
		seoDescription: `${def.description} Start the ${def.primaryKeyword} on MapQuiz.pro and get instant answer checks.`,
		description: def.description,
		primaryKeyword: def.primaryKeyword,
		searchIntent: def.searchIntent,
		learningFocus: def.learningFocus,
		questionCount: def.questionCount,
		benefits: [
			...baseBenefits,
			`Focused pool of ${readableCategory} to keep repetition tight`
		],
		highlights: [
			`${def.questionCount} map targets`,
			def.gameConfig.category === 'all'
				? 'All continents'
				: def.gameConfig.category[0],
			'Mobile-friendly tap input'
		],
		faq: [
			{
				question: `Who is the ${def.title.toLowerCase()} for?`,
				answer: 'It works for students, trivia players, and anyone who wants a fast geography practice loop without creating an account.'
			},
			{
				question: 'How does scoring work?',
				answer: 'Each answer is graded by map distance. After submitting, you can compare your pin with the correct location before moving on.'
			},
			{
				question: 'Can I replay this topic quickly?',
				answer: 'Yes. Each quiz can be restarted immediately, which makes it useful for repeat memorization sessions.'
			}
		],
		relatedSlugs:
			def.slug === 'world-map-quiz'
				? [
						'asia-countries-quiz',
						'europe-countries-quiz',
						'americas-countries-quiz'
					]
				: [
						'world-map-quiz',
						'asia-countries-quiz',
						'europe-countries-quiz'
					]
						.filter((slug) => slug !== def.slug)
						.slice(0, 3),
		gameConfig: {
			...def.gameConfig,
			category:
				def.gameConfig.category === 'all'
					? 'all'
					: [...def.gameConfig.category]
		}
	};
};

const COUNTRY_SUBTOPIC_DEFS: CountrySubtopicDef[] = [
	{
		slug: 'japan-prefectures-quiz',
		parentSlug: 'japan-map-quiz',
		countryCode: 'jp',
		title: 'Japan Prefectures Quiz',
		shortTitle: 'Japan Prefectures',
		primaryKeyword: 'japan prefectures quiz',
		categories: ['Prefecture Capitals'],
		learningFocus: 'Japanese prefectures and prefecture capital recall',
		searchIntent: 'Japan prefecture geography practice',
		description:
			'Practice Japan prefectures on an interactive map with instant answer feedback and repeatable study loops.',
		seoDescription:
			'Learn Japan prefectures with an interactive map quiz built for fast recall, instant answer checks, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice the full Japan prefecture set from Hokkaido to Okinawa in one replayable loop',
			'Spot weak regions quickly when neighboring prefectures start to blur together',
			'Use repeated runs to tighten recall before moving into capitals or landmarks'
		],
		highlights: ['47 prefecture targets', 'North-to-south recall', 'Best next step before capitals'],
		faq: [
			{
				question: 'Does this Japan prefectures quiz cover all 47 prefectures?',
				answer: 'Yes. This page is designed around the full prefecture set so you can practice broad national recall instead of a partial region only.'
			},
			{
				question: 'Is this page about prefectures or prefecture capitals?',
				answer: 'The page is optimized for prefecture-level recall first, using the prefecture capital data set as the anchor points on the map.'
			},
			{
				question: 'What should I practice after prefectures?',
				answer: 'The strongest next step is Japan capitals or Japan landmarks, because both narrow your recall into more specific location patterns.'
			}
		]
	},
	{
		slug: 'japan-capitals-quiz',
		parentSlug: 'japan-map-quiz',
		countryCode: 'jp',
		title: 'Japan Capitals Quiz',
		shortTitle: 'Japan Capitals',
		primaryKeyword: 'japan capitals quiz',
		categories: ['Prefecture Capitals'],
		learningFocus: 'Prefecture capital recall across Japan',
		searchIntent: 'Japan capitals and prefecture capital practice',
		description:
			'Practice Japan prefecture capitals with a focused interactive map quiz built for fast recall.',
		seoDescription:
			'Practice Japan capitals on an interactive map quiz focused on prefecture capital recall, instant correction, and repeat study.',
		benefits: [
			'Train the capital layer directly instead of stopping at prefecture recognition',
			'Catch common mix-ups such as capital city versus larger neighboring city',
			'Use immediate answer review to lock in prefecture-capital pairs faster'
		],
		highlights: ['Prefecture capital focus', 'Fast capital-city review', 'Useful after prefecture drills'],
		faq: [
			{
				question: 'Does this Japan capitals quiz use prefecture capitals?',
				answer: 'Yes. The quiz focuses on prefecture capitals rather than a generic city list, so the practice stays tied to administrative geography.'
			},
			{
				question: 'Is this useful if I already know the prefectures?',
				answer: 'Yes. It is the natural second layer after prefecture recall because it forces you to connect each prefecture with its capital city.'
			},
			{
				question: 'Will this help with confusing city pairs like Kyoto and Osaka?',
				answer: 'Yes. The map format is useful for separating nearby but easily confused cities by repeatedly tying them back to place on the map.'
			}
		]
	},
	{
		slug: 'japan-landmarks-quiz',
		parentSlug: 'japan-map-quiz',
		countryCode: 'jp',
		title: 'Japan Landmarks Quiz',
		shortTitle: 'Japan Landmarks',
		primaryKeyword: 'japan landmarks quiz',
		categories: ['Famous Landmarks'],
		learningFocus: 'Famous landmarks across Japan',
		searchIntent: 'Japan landmarks geography practice',
		description:
			'Test yourself on famous Japan landmarks with an interactive map quiz and instant corrections.',
		seoDescription:
			'Test your knowledge of Japan landmarks with an interactive map quiz covering famous places, instant corrections, and repeat review.',
		benefits: [
			'Switch from administrative geography into iconic place recognition across Japan',
			'Build spatial memory around famous destinations instead of only memorizing names',
			'Use a lighter landmark-focused loop for travel, trivia, or culture-driven study'
		],
		highlights: ['Iconic place recall', 'Culture-and-geography blend', 'Fast landmark replay'],
		faq: [
			{
				question: 'What kind of places appear in this Japan landmarks quiz?',
				answer: 'The quiz is built around famous landmarks and widely recognized locations rather than prefecture capitals or administrative units.'
			},
			{
				question: 'Is this page better for travel-style geography practice?',
				answer: 'Yes. It is especially useful when you want to recognize famous places on a map rather than only study political geography.'
			},
			{
				question: 'Should I do landmarks before or after prefectures?',
				answer: 'Most users should do prefectures first, then landmarks, because the landmark layer becomes easier once the country frame is already familiar.'
			}
		]
	},
	{
		slug: 'germany-states-quiz',
		parentSlug: 'germany-map-quiz',
		countryCode: 'de',
		title: 'Germany States Quiz',
		shortTitle: 'Germany States',
		primaryKeyword: 'germany states quiz',
		categories: ['Federal State Capitals'],
		learningFocus: 'German states and state-level geography',
		searchIntent: 'Germany states geography practice',
		description:
			'Learn German states with an interactive map quiz designed for fast practice and replay.',
		seoDescription:
			'Learn Germany states with an interactive map quiz focused on fast recall, immediate answer checks, and repeat practice.',
		benefits: [
			'Practice German state geography in one tight loop instead of memorizing names in isolation',
			'Improve recall of where each Land sits relative to major neighboring states',
			'Use repeated runs to build the national frame before moving into capitals and cities'
		],
		highlights: ['German Länder focus', 'Strong state-level recall', 'Good base before capitals'],
		faq: [
			{
				question: 'Is this Germany states quiz built around the Länder?',
				answer: 'Yes. The page is aimed at state-level German geography so you can recognize and place the Länder more confidently on the map.'
			},
			{
				question: 'Is this better as a starting point than state capitals?',
				answer: 'Usually yes. Learning the state framework first makes capital recall much easier in the next study step.'
			},
			{
				question: 'Can I use this for school-style geography practice?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough for classroom-style state geography review.'
			}
		]
	},
	{
		slug: 'germany-state-capitals-quiz',
		parentSlug: 'germany-map-quiz',
		countryCode: 'de',
		title: 'Germany State Capitals Quiz',
		shortTitle: 'Germany State Capitals',
		primaryKeyword: 'germany state capitals quiz',
		categories: ['Federal State Capitals'],
		learningFocus: 'German state capital recall',
		searchIntent: 'Germany state capitals map quiz searches',
		description:
			'Practice German state capitals on an interactive map with immediate answer checks and repeat review.',
		seoDescription:
			'Practice Germany state capitals on an interactive map quiz with fast answer review and repeatable geography study.',
		benefits: [
			'Focus directly on capital recall across Germany instead of a mixed city pool',
			'Catch common mistakes where the biggest city is mistaken for the state capital',
			'Use repeated short runs to reinforce state-capital pairs efficiently'
		],
		highlights: ['Capital recall only', 'State-to-capital pairing', 'Useful after Länder practice'],
		faq: [
			{
				question: 'Does this page focus on German state capitals only?',
				answer: 'Yes. It narrows the quiz to state-capital geography so the practice stays distinct from a broader major-cities drill.'
			},
			{
				question: 'Will this help with capital-versus-largest-city confusion?',
				answer: 'Yes. That is one of the main reasons to isolate this topic into its own page and replay loop.'
			},
			{
				question: 'What should I do after Germany state capitals?',
				answer: 'A strong follow-up is Germany cities, which broadens the geography beyond administrative capitals into a wider urban layer.'
			}
		]
	},
	{
		slug: 'germany-cities-quiz',
		parentSlug: 'germany-map-quiz',
		countryCode: 'de',
		title: 'Germany Cities Quiz',
		shortTitle: 'Germany Cities',
		primaryKeyword: 'germany cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across Germany',
		searchIntent: 'Germany cities map quiz searches',
		description:
			'Test your knowledge of major German cities with a replayable interactive map quiz.',
		seoDescription:
			'Test yourself on Germany cities with an interactive map quiz covering major urban centers and repeatable geography practice.',
		benefits: [
			'Shift from state geography into Germany’s major urban network',
			'Practice city placement in a format better suited to travel, news, and general knowledge',
			'Replay missed cities quickly without leaving the same country context'
		],
		highlights: ['Major-city focus', 'Urban geography layer', 'Good for general knowledge'],
		faq: [
			{
				question: 'What cities appear in this Germany cities quiz?',
				answer: 'The page focuses on major German cities rather than a full administrative list, so it stays useful for broader geography and general knowledge practice.'
			},
			{
				question: 'Is this different from the Germany state capitals quiz?',
				answer: 'Yes. The cities page is broader and more general, while the capitals page is specifically about administrative capitals.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It works well for students, quiz players, and anyone who wants a city-focused Germany map drill without creating an account.'
			}
		]
	},
	{
		slug: 'canada-provinces-quiz',
		parentSlug: 'canada-map-quiz',
		countryCode: 'ca',
		title: 'Canada Provinces Quiz',
		shortTitle: 'Canada Provinces',
		primaryKeyword: 'canada provinces quiz',
		categories: ['Province & Territory Capitals'],
		learningFocus: 'Canadian provinces, territories, and capital-level recall',
		searchIntent: 'Canada provinces geography practice',
		description:
			'Practice Canada provinces and territories on an interactive map with instant answer feedback and repeatable review.',
		seoDescription:
			'Learn Canada provinces and territories with an interactive map quiz designed for quick recall and repeat geography practice.',
		benefits: [
			'Practice provinces and territories in one map loop instead of memorizing them as a flat list',
			'Strengthen national geography before drilling capitals or cities separately',
			'Use repeat runs to fix east-west and north-south confusion across Canada'
		],
		highlights: ['Province-and-territory coverage', 'Strong national frame', 'Best first Canada drill'],
		faq: [
			{
				question: 'Does this Canada provinces quiz include the territories too?',
				answer: 'Yes. The page is built around both provinces and territories so the country frame is complete rather than provincial only.'
			},
			{
				question: 'Should I start here before province capitals?',
				answer: 'Usually yes. Learning the provincial and territorial map first makes later capital recall much easier.'
			},
			{
				question: 'Is this page useful for basic Canada geography revision?',
				answer: 'Yes. It is designed as a practical first-step drill for users who want a quick but complete Canada map practice loop.'
			}
		]
	},
	{
		slug: 'canada-cities-quiz',
		parentSlug: 'canada-map-quiz',
		countryCode: 'ca',
		title: 'Canada Cities Quiz',
		shortTitle: 'Canada Cities',
		primaryKeyword: 'canada cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across Canada',
		searchIntent: 'Canada cities map quiz searches',
		description:
			'Test yourself on major Canadian cities with a replayable interactive map quiz built for fast geography practice.',
		seoDescription:
			'Practice Canada cities on an interactive map quiz focused on major metros, instant answer checks, and repeat review.',
		benefits: [
			'Practice major Canadian metros in a way that feels more intuitive than reading a city list',
			'Build a usable mental map of Canada’s largest urban centers across multiple regions',
			'Use quick replays to separate nearby or commonly confused city locations'
		],
		highlights: ['Major metros only', 'Practical city recall', 'Useful after provinces'],
		faq: [
			{
				question: 'Does this page focus on major cities instead of capitals only?',
				answer: 'Yes. The page is meant for broad city recognition across Canada, not just the province and territory capitals.'
			},
			{
				question: 'Is this useful for travel-style geography knowledge?',
				answer: 'Yes. The major-cities focus makes it useful for general knowledge, travel, and news-oriented geography recall.'
			},
			{
				question: 'What should I study next after Canada cities?',
				answer: 'A natural next step is Canada landmarks, which adds national parks and iconic locations to the same country map frame.'
			}
		]
	},
	{
		slug: 'canada-landmarks-quiz',
		parentSlug: 'canada-map-quiz',
		countryCode: 'ca',
		title: 'Canada Landmarks Quiz',
		shortTitle: 'Canada Landmarks',
		primaryKeyword: 'canada landmarks quiz',
		categories: ['National Parks & Wonders'],
		learningFocus: 'National parks and natural wonders across Canada',
		searchIntent: 'Canada landmarks geography practice',
		description:
			'Practice famous Canada landmarks, parks, and natural wonders with an interactive map quiz and instant corrections.',
		seoDescription:
			'Test your knowledge of Canada landmarks with an interactive map quiz covering national parks, wonders, and repeatable review.',
		benefits: [
			'Move beyond provinces and cities into Canada’s best-known natural geography',
			'Practice iconic places in a more memorable format than static travel lists',
			'Use the same map loop to connect landmarks back to the larger country frame'
		],
		highlights: ['Parks and wonders', 'Travel-style geography', 'Memorable place recall'],
		faq: [
			{
				question: 'What kinds of places appear in this Canada landmarks quiz?',
				answer: 'The page focuses on well-known parks, natural wonders, and iconic locations rather than administrative units or general city lists.'
			},
			{
				question: 'Is this page good for a lighter geography drill?',
				answer: 'Yes. Landmark pages are often easier to revisit because the locations are more narrative and visually memorable than purely administrative lists.'
			},
			{
				question: 'Can I use this alongside Canada provinces practice?',
				answer: 'Yes. The two pages work well together because one builds the political frame while the other adds memorable physical locations.'
			}
		]
	},
	{
		slug: 'australia-states-quiz',
		parentSlug: 'australia-map-quiz',
		countryCode: 'au',
		title: 'Australia States Quiz',
		shortTitle: 'Australia States',
		primaryKeyword: 'australia states quiz',
		categories: ['State & Territory Capitals'],
		learningFocus: 'Australian states, territories, and state-capital geography',
		searchIntent: 'Australia states geography practice',
		description:
			'Practice Australian states and territories on an interactive map with instant answer checks and repeat play.',
		seoDescription:
			'Learn Australia states and territories with an interactive map quiz built for fast recall and repeat geography practice.',
		benefits: [
			'Practice the Australia state and territory frame before narrowing into cities or landmarks',
			'Fix the broad national map quickly with a replayable country-specific loop',
			'Use repeated runs to reduce confusion between large neighboring regions'
		],
		highlights: ['State-and-territory frame', 'Best Australia starting drill', 'Fast national recall'],
		faq: [
			{
				question: 'Does this Australia states quiz include territories as well?',
				answer: 'Yes. The page is meant to cover both states and territories so the full country structure is easier to learn.'
			},
			{
				question: 'Should I use this page before Australia cities?',
				answer: 'Yes. For most users the state-and-territory frame is the best first layer before moving into city recall.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for revision sessions and specific enough to reinforce state geography quickly.'
			}
		]
	},
	{
		slug: 'australia-cities-quiz',
		parentSlug: 'australia-map-quiz',
		countryCode: 'au',
		title: 'Australia Cities Quiz',
		shortTitle: 'Australia Cities',
		primaryKeyword: 'australia cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across Australia',
		searchIntent: 'Australia cities map quiz searches',
		description:
			'Test your knowledge of major Australian cities with a focused interactive map quiz designed for fast recall.',
		seoDescription:
			'Practice Australia cities on an interactive map quiz focused on major urban centers, quick answer checks, and repeat review.',
		benefits: [
			'Focus on Australia’s main urban centers without mixing in landmarks or state-only prompts',
			'Build coastal and inland city recall in a way that feels more practical than reading lists',
			'Replay missed cities quickly while staying inside the same country context'
		],
		highlights: ['Major-city coverage', 'Urban Australia focus', 'Good after state drills'],
		faq: [
			{
				question: 'What kind of cities appear in this Australia cities quiz?',
				answer: 'The page focuses on major Australian cities rather than only capital cities, so it works well for broader city recognition practice.'
			},
			{
				question: 'Is this different from Australia states practice?',
				answer: 'Yes. The states page teaches the country framework, while this one is more about the urban geography layer.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It is useful for students, quiz players, and anyone who wants a city-focused Australia map drill without extra setup.'
			}
		]
	},
	{
		slug: 'australia-landmarks-quiz',
		parentSlug: 'australia-map-quiz',
		countryCode: 'au',
		title: 'Australia Landmarks Quiz',
		shortTitle: 'Australia Landmarks',
		primaryKeyword: 'australia landmarks quiz',
		categories: ['Natural Wonders'],
		learningFocus: 'Natural wonders and iconic places across Australia',
		searchIntent: 'Australia landmarks geography practice',
		description:
			'Practice Australia landmarks and natural wonders with an interactive map quiz that supports repeat study loops.',
		seoDescription:
			'Test your knowledge of Australia landmarks with an interactive map quiz covering natural wonders and repeatable study loops.',
		benefits: [
			'Practice iconic Australian places in a more memorable format than a plain landmark list',
			'Connect natural wonders back to the larger state and territory frame',
			'Use a lighter, more visual geography loop for travel-style recall and trivia'
		],
		highlights: ['Natural wonder focus', 'Iconic-place recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of landmarks appear in this Australia landmarks quiz?',
				answer: 'The page focuses on natural wonders and iconic places rather than administrative geography or a broad city list.'
			},
			{
				question: 'Is this page useful after Australia states practice?',
				answer: 'Yes. Once you know the state frame, landmarks become easier to place and remember in the right part of the country.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	},
	{
		slug: 'france-regions-quiz',
		parentSlug: 'france-map-quiz',
		countryCode: 'fr',
		title: 'France Regions Quiz',
		shortTitle: 'France Regions',
		primaryKeyword: 'france regions quiz',
		categories: ['Regional Capitals'],
		learningFocus: 'French regions and regional capital recall',
		searchIntent: 'France regions geography practice',
		description:
			'Practice France regions and regional capitals on an interactive map with instant answer feedback and repeatable review.',
		seoDescription:
			'Learn France regions with an interactive map quiz covering regional capitals, instant feedback, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice French regions in one map loop instead of memorizing a flat list',
			'Build a clear national frame before drilling cities or landmarks separately',
			'Use repeated runs to distinguish neighboring regions across the country'
		],
		highlights: ['Regional capital focus', 'Full France coverage', 'Best first France drill'],
		faq: [
			{
				question: 'Does this France regions quiz cover all metropolitan regions?',
				answer: 'Yes. The page is built around the full set of French metropolitan regions so you can learn the country frame before moving into cities.'
			},
			{
				question: 'Should I start here before France cities?',
				answer: 'Usually yes. Learning the regional framework first makes city and landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce regional geography efficiently.'
			}
		]
	},
	{
		slug: 'france-cities-quiz',
		parentSlug: 'france-map-quiz',
		countryCode: 'fr',
		title: 'France Cities Quiz',
		shortTitle: 'France Cities',
		primaryKeyword: 'france cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across France',
		searchIntent: 'France cities map quiz searches',
		description:
			'Test yourself on major French cities with a replayable interactive map quiz built for fast geography practice.',
		seoDescription:
			'Practice France cities on an interactive map quiz covering major urban centers, instant answer checks, and repeat study.',
		benefits: [
			'Focus on France\u2019s main urban centers without mixing in regional administrative prompts',
			'Build a practical mental map of French cities from Paris to Bordeaux',
			'Replay missed cities quickly while staying inside the same country context'
		],
		highlights: ['Major-city coverage', 'Urban France focus', 'Good after regions drill'],
		faq: [
			{
				question: 'What kind of cities appear in this France cities quiz?',
				answer: 'The page focuses on major French cities rather than only regional capitals, so it works well for broader city recognition practice.'
			},
			{
				question: 'Is this different from France regions practice?',
				answer: 'Yes. The regions page teaches the country framework, while this one focuses on the urban geography layer.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It works for students, quiz players, and anyone who wants a city-focused France map drill without extra setup.'
			}
		]
	},
	{
		slug: 'france-landmarks-quiz',
		parentSlug: 'france-map-quiz',
		countryCode: 'fr',
		title: 'France Landmarks Quiz',
		shortTitle: 'France Landmarks',
		primaryKeyword: 'france landmarks quiz',
		categories: ['Famous Landmarks'],
		learningFocus: 'Famous landmarks and iconic places across France',
		searchIntent: 'France landmarks geography practice',
		description:
			'Practice France landmarks with an interactive map quiz covering famous sites and iconic locations.',
		seoDescription:
			'Test your knowledge of France landmarks with an interactive map quiz covering famous sites, instant corrections, and repeat review.',
		benefits: [
			'Switch from administrative geography into iconic place recognition across France',
			'Build spatial memory around famous destinations instead of only memorizing names',
			'Use a lighter, more visual loop for travel-style recall and cultural trivia'
		],
		highlights: ['Iconic place recall', 'Culture-and-geography blend', 'Fast landmark replay'],
		faq: [
			{
				question: 'What kind of places appear in this France landmarks quiz?',
				answer: 'The quiz focuses on famous landmarks and widely recognized locations rather than regional capitals or administrative units.'
			},
			{
				question: 'Is this page better for travel-style geography practice?',
				answer: 'Yes. It is especially useful when you want to recognize famous French places on a map rather than only study political geography.'
			},
			{
				question: 'Should I do landmarks before or after regions?',
				answer: 'Most users should do regions first, then landmarks, because the landmark layer becomes easier once the country frame is already familiar.'
			}
		]
	},
	{
		slug: 'uk-cities-quiz',
		parentSlug: 'united-kingdom-map-quiz',
		countryCode: 'gb',
		title: 'UK Cities Quiz',
		shortTitle: 'UK Cities',
		primaryKeyword: 'uk cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across the United Kingdom',
		searchIntent: 'UK cities map quiz searches',
		description:
			'Practice major UK cities with an interactive map quiz built for fast recall and repeat study.',
		seoDescription:
			'Practice UK cities on an interactive map quiz covering major urban centers across England, Scotland, Wales, and Northern Ireland.',
		benefits: [
			'Train on major UK cities without mixing in historical or county prompts',
			'Build a usable mental map of British urban centers from London to Glasgow',
			'Use quick replays to separate nearby or commonly confused city locations'
		],
		highlights: ['Major-city coverage', 'All four nations', 'Good for general knowledge'],
		faq: [
			{
				question: 'Does this UK cities quiz include cities from Scotland, Wales, and Northern Ireland?',
				answer: 'Yes. The page covers major cities from all four nations of the United Kingdom, not just English cities.'
			},
			{
				question: 'Is this useful alongside UK landmarks practice?',
				answer: 'Yes. Cities and landmarks complement each other — one covers urban geography, the other covers historic and iconic places.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It works for students, quiz players, and anyone who wants a city-focused UK map drill without account creation.'
			}
		]
	},
	{
		slug: 'uk-landmarks-quiz',
		parentSlug: 'united-kingdom-map-quiz',
		countryCode: 'gb',
		title: 'UK Landmarks Quiz',
		shortTitle: 'UK Landmarks',
		primaryKeyword: 'uk landmarks quiz',
		categories: ['Historical Landmarks'],
		learningFocus: 'Historical landmarks and iconic places across the UK',
		searchIntent: 'UK landmarks geography practice',
		description:
			'Test yourself on UK landmarks with an interactive map quiz covering historic sites and famous locations.',
		seoDescription:
			'Test your knowledge of UK landmarks with an interactive map quiz covering historical sites, famous locations, and repeat geography study.',
		benefits: [
			'Practice iconic British landmarks in a more memorable format than a plain list',
			'Connect historical sites back to their country and region on the map',
			'Use a lighter, more visual loop for cultural and travel-style geography practice'
		],
		highlights: ['Historic site focus', 'Iconic-place recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of landmarks appear in this UK landmarks quiz?',
				answer: 'The page focuses on historical sites and famous landmarks rather than city geography or administrative counties.'
			},
			{
				question: 'Is this page useful after UK cities practice?',
				answer: 'Yes. Once you know major city locations, the landmark layer becomes easier to place and remember in the right part of the UK.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	},
	{
		slug: 'england-counties-quiz',
		parentSlug: 'united-kingdom-map-quiz',
		countryCode: 'gb',
		title: 'England Counties Quiz',
		shortTitle: 'England Counties',
		primaryKeyword: 'england counties quiz',
		categories: ['Counties & Regions'],
		learningFocus: 'English counties and regional geography',
		searchIntent: 'England counties geography practice',
		description:
			'Practice England counties and regional geography with an interactive map quiz focused on repeatable recall.',
		seoDescription:
			'Learn England counties with an interactive map quiz designed for fast recall, instant answer checks, and repeat geography practice.',
		benefits: [
			'Practice English county geography in one tight loop instead of memorizing names in isolation',
			'Improve recall of where each county sits relative to its neighbors',
			'Use repeated runs to build the county framework before moving into cities or landmarks'
		],
		highlights: ['County-level geography', 'England focus', 'Good admin-geography drill'],
		faq: [
			{
				question: 'Does this England counties quiz cover all historic counties?',
				answer: 'The page is built around the major counties and regions of England to give you a practical country frame rather than an exhaustive administrative list.'
			},
			{
				question: 'Is this better as a starting point than UK cities?',
				answer: 'It depends on your goal. Counties give you a political-geography frame; cities give you a practical urban-geography frame. Both are useful.'
			},
			{
				question: 'Can I use this for school-style geography review?',
				answer: 'Yes. The loop is simple enough for revision sessions and specific enough to reinforce county geography quickly.'
			}
		]
	},
	{
		slug: 'italy-regions-quiz',
		parentSlug: 'italy-map-quiz',
		countryCode: 'it',
		title: 'Italy Regions Quiz',
		shortTitle: 'Italy Regions',
		primaryKeyword: 'italy regions quiz',
		categories: ['Regional Capitals'],
		learningFocus: 'Italian regions and regional capital recall',
		searchIntent: 'Italy regions geography practice',
		description:
			'Practice Italy regions and regional capitals on an interactive map with instant answer checks and repeat play.',
		seoDescription:
			'Learn Italy regions with an interactive map quiz covering regional capitals, instant feedback, and repeat geography practice on MapQuiz.pro.',
		benefits: [
			'Practice Italian regions in one map loop instead of memorizing a flat list',
			'Build the national framework from the Alps to Sicily before drilling cities or landmarks',
			'Use repeated runs to distinguish neighboring regions across the boot'
		],
		highlights: ['Regional capital focus', 'Full Italy coverage', 'Best first Italy drill'],
		faq: [
			{
				question: 'Does this Italy regions quiz cover all 20 regions?',
				answer: 'Yes. The page is built around all Italian regions so you can learn the full country frame before moving into city or landmark recall.'
			},
			{
				question: 'Should I start here before Italy landmarks?',
				answer: 'Usually yes. Learning the regional framework first makes landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce regional geography efficiently.'
			}
		]
	},
	{
		slug: 'italy-landmarks-quiz',
		parentSlug: 'italy-map-quiz',
		countryCode: 'it',
		title: 'Italy Landmarks Quiz',
		shortTitle: 'Italy Landmarks',
		primaryKeyword: 'italy landmarks quiz',
		categories: ['UNESCO Heritage Sites'],
		learningFocus: 'UNESCO heritage sites and iconic places across Italy',
		searchIntent: 'Italy landmarks geography practice',
		description:
			'Practice Italy landmarks and UNESCO heritage sites with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of Italy landmarks with an interactive map quiz covering UNESCO heritage sites, famous places, and repeat review.',
		benefits: [
			'Switch from administrative regions into iconic site recognition across Italy',
			'Build spatial memory around UNESCO-listed places instead of only memorizing names',
			'Use a lighter, more visual loop for travel-style recall and cultural trivia'
		],
		highlights: ['UNESCO site focus', 'Culture-and-geography blend', 'Fast landmark replay'],
		faq: [
			{
				question: 'What kind of places appear in this Italy landmarks quiz?',
				answer: 'The quiz focuses on UNESCO heritage sites and famous landmarks rather than regional capitals or administrative units.'
			},
			{
				question: 'Is this page better for travel-style geography practice?',
				answer: 'Yes. It is especially useful when you want to recognize iconic Italian places on a map rather than only study political geography.'
			},
			{
				question: 'Should I do landmarks before or after regions?',
				answer: 'Most users should do regions first, then landmarks, because the landmark layer becomes easier once the country frame is already familiar.'
			}
		]
	},
	{
		slug: 'spain-regions-quiz',
		parentSlug: 'spain-map-quiz',
		countryCode: 'es',
		title: 'Spain Regions Quiz',
		shortTitle: 'Spain Regions',
		primaryKeyword: 'spain regions quiz',
		categories: ['Autonomous Community Capitals'],
		learningFocus: 'Spain autonomous communities and capital-level recall',
		searchIntent: 'Spain regions geography practice',
		description:
			'Practice Spain autonomous communities and capitals with an interactive map quiz designed for fast recall.',
		seoDescription:
			'Learn Spain regions with an interactive map quiz covering autonomous community capitals, instant feedback, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice Spain\'s autonomous communities in one map loop instead of memorizing a flat list',
			'Build the national framework from Galicia to Catalonia before drilling landmarks or cities',
			'Use repeated runs to distinguish neighboring communities across the peninsula'
		],
		highlights: ['Autonomous community focus', 'Full Spain coverage', 'Best first Spain drill'],
		faq: [
			{
				question: 'Does this Spain regions quiz cover all 17 autonomous communities?',
				answer: 'Yes. The page is built around all autonomous communities so you can learn the full country frame before moving into city or landmark recall.'
			},
			{
				question: 'Should I start here before Spain landmarks?',
				answer: 'Usually yes. Learning the regional framework first makes landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce regional geography efficiently.'
			}
		]
	},
	{
		slug: 'spain-landmarks-quiz',
		parentSlug: 'spain-map-quiz',
		countryCode: 'es',
		title: 'Spain Landmarks Quiz',
		shortTitle: 'Spain Landmarks',
		primaryKeyword: 'spain landmarks quiz',
		categories: ['Famous Landmarks'],
		learningFocus: 'Famous landmarks and iconic places across Spain',
		searchIntent: 'Spain landmarks geography practice',
		description:
			'Test yourself on Spain landmarks with an interactive map quiz covering famous sites and iconic destinations.',
		seoDescription:
			'Test your knowledge of Spain landmarks with an interactive map quiz covering famous sites, iconic destinations, and repeat geography study.',
		benefits: [
			'Switch from regional geography into iconic site recognition across Spain',
			'Build spatial memory around famous destinations instead of only memorizing names',
			'Use a lighter, more visual loop for travel-style recall and cultural trivia'
		],
		highlights: ['Iconic place recall', 'Culture-and-geography blend', 'Fast landmark replay'],
		faq: [
			{
				question: 'What kind of places appear in this Spain landmarks quiz?',
				answer: 'The quiz focuses on famous landmarks and widely recognized locations rather than autonomous community capitals or administrative units.'
			},
			{
				question: 'Is this page better for travel-style geography practice?',
				answer: 'Yes. It is especially useful when you want to recognize iconic Spanish places on a map rather than only study political geography.'
			},
			{
				question: 'Should I do landmarks before or after regions?',
				answer: 'Most users should do regions first, then landmarks, because the landmark layer becomes easier once the country frame is already familiar.'
			}
		]
	},
	{
		slug: 'brazil-states-quiz',
		parentSlug: 'brazil-map-quiz',
		countryCode: 'br',
		title: 'Brazil States Quiz',
		shortTitle: 'Brazil States',
		primaryKeyword: 'brazil states quiz',
		categories: ['State Capitals'],
		learningFocus: 'Brazilian states and state capital recall',
		searchIntent: 'Brazil states geography practice',
		description:
			'Practice Brazil states and state capitals on an interactive map with instant answer feedback and repeatable review.',
		seoDescription:
			'Learn Brazil states with an interactive map quiz covering state capitals, instant feedback, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice all 26 Brazilian states and the Federal District in one replayable map loop',
			'Build a spatial sense of Brazil\'s five major regions before drilling cities or landmarks',
			'Use repeated runs to distinguish neighboring states across this large country'
		],
		highlights: ['State capital focus', 'Full Brazil coverage', 'Best first Brazil drill'],
		faq: [
			{
				question: 'Does this Brazil states quiz include all 26 states?',
				answer: 'Yes. The page is built around all Brazilian states so you can learn the full country frame before moving into landmarks or cities.'
			},
			{
				question: 'Should I start here before Brazil landmarks?',
				answer: 'Usually yes. Learning the state framework first makes landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce state geography efficiently.'
			}
		]
	},
	{
		slug: 'brazil-landmarks-quiz',
		parentSlug: 'brazil-map-quiz',
		countryCode: 'br',
		title: 'Brazil Landmarks Quiz',
		shortTitle: 'Brazil Landmarks',
		primaryKeyword: 'brazil landmarks quiz',
		categories: ['Famous Landmarks'],
		learningFocus: 'Famous landmarks and iconic places across Brazil',
		searchIntent: 'Brazil landmarks geography practice',
		description:
			'Practice Brazil landmarks and iconic places with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of Brazil landmarks with an interactive map quiz covering famous sites, natural wonders, and repeat review.',
		benefits: [
			'Move beyond state geography into Brazil\'s most iconic natural and cultural landmarks',
			'Practice famous places in a more memorable format than a plain landmark list',
			'Use the same map loop to connect landmarks back to the larger country frame'
		],
		highlights: ['Natural wonder focus', 'Iconic-place recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of places appear in this Brazil landmarks quiz?',
				answer: 'The page focuses on well-known natural wonders, cultural sites, and famous landmarks rather than state capitals or administrative units.'
			},
			{
				question: 'Is this page useful after Brazil states practice?',
				answer: 'Yes. Once you know the state frame, landmarks become easier to place and remember in the right part of the country.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	},
	{
		slug: 'south-korea-cities-quiz',
		parentSlug: 'south-korea-map-quiz',
		countryCode: 'kr',
		title: 'South Korea Cities Quiz',
		shortTitle: 'South Korea Cities',
		primaryKeyword: 'south korea cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across South Korea',
		searchIntent: 'South Korea cities map quiz searches',
		description:
			'Test yourself on major South Korean cities with a focused interactive map quiz designed for fast recall.',
		seoDescription:
			'Practice South Korea cities on an interactive map quiz covering major urban centers, instant answer checks, and repeat study.',
		benefits: [
			'Focus on South Korea\'s main urban centers without mixing in province or landmark prompts',
			'Build a practical mental map of Korean cities from Seoul to Busan',
			'Replay missed cities quickly while staying inside the same country context'
		],
		highlights: ['Major-city coverage', 'Urban Korea focus', 'Good for general knowledge'],
		faq: [
			{
				question: 'What kind of cities appear in this South Korea cities quiz?',
				answer: 'The page focuses on major South Korean cities and metropolitan areas rather than only provincial capitals.'
			},
			{
				question: 'Is this different from South Korea provinces practice?',
				answer: 'Yes. The provinces page teaches the country framework, while this one is more about the urban geography layer.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It works for students, quiz players, and anyone who wants a city-focused South Korea map drill without extra setup.'
			}
		]
	},
	{
		slug: 'south-korea-provinces-quiz',
		parentSlug: 'south-korea-map-quiz',
		countryCode: 'kr',
		title: 'South Korea Provinces Quiz',
		shortTitle: 'South Korea Provinces',
		primaryKeyword: 'south korea provinces quiz',
		categories: ['Provinces'],
		learningFocus: 'South Korean provinces and administrative regions',
		searchIntent: 'South Korea provinces geography practice',
		description:
			'Practice South Korea provinces and administrative regions on an interactive map with instant answer checks.',
		seoDescription:
			'Learn South Korea provinces with an interactive map quiz covering administrative regions, instant feedback, and repeat practice.',
		benefits: [
			'Practice South Korean provinces in one map loop instead of memorizing a flat list',
			'Build the national administrative framework before drilling cities or landmarks separately',
			'Use repeated runs to distinguish the relatively compact but diverse provincial geography'
		],
		highlights: ['Province-level geography', 'Full Korea coverage', 'Good admin-geography drill'],
		faq: [
			{
				question: 'Does this South Korea provinces quiz include all provinces and special cities?',
				answer: 'Yes. The page covers the major provinces and administrative regions so you can learn the full country structure.'
			},
			{
				question: 'Should I start here before South Korea cities?',
				answer: 'Either order works well. Provinces give you a political framework; cities give you a practical urban layer.'
			},
			{
				question: 'Is this useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce provincial geography efficiently.'
			}
		]
	},
	{
		slug: 'south-korea-landmarks-quiz',
		parentSlug: 'south-korea-map-quiz',
		countryCode: 'kr',
		title: 'South Korea Landmarks Quiz',
		shortTitle: 'South Korea Landmarks',
		primaryKeyword: 'south korea landmarks quiz',
		categories: ['Landmarks'],
		learningFocus: 'Famous landmarks and iconic places across South Korea',
		searchIntent: 'South Korea landmarks geography practice',
		description:
			'Practice South Korea landmarks and iconic places with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of South Korea landmarks with an interactive map quiz covering famous sites and repeat geography practice.',
		benefits: [
			'Switch from administrative geography into iconic place recognition across South Korea',
			'Build spatial memory around famous destinations instead of only memorizing names',
			'Use a lighter, more visual loop for travel-style recall and cultural trivia'
		],
		highlights: ['Iconic place recall', 'Culture-and-geography blend', 'Fast landmark replay'],
		faq: [
			{
				question: 'What kind of places appear in this South Korea landmarks quiz?',
				answer: 'The quiz focuses on famous landmarks and widely recognized locations rather than provincial capitals or administrative units.'
			},
			{
				question: 'Is this page better for travel-style geography practice?',
				answer: 'Yes. It is especially useful when you want to recognize iconic Korean places on a map rather than only study political geography.'
			},
			{
				question: 'Should I do landmarks before or after provinces?',
				answer: 'Most users should do provinces or cities first, then landmarks, because the landmark layer becomes easier once the country frame is already familiar.'
			}
		]
	},
	{
		slug: 'russia-cities-quiz',
		parentSlug: 'russia-map-quiz',
		countryCode: 'ru',
		title: 'Russia Cities Quiz',
		shortTitle: 'Russia Cities',
		primaryKeyword: 'russia cities quiz',
		categories: ['Major Cities'],
		learningFocus: 'Major cities across Russia',
		searchIntent: 'Russia cities map quiz searches',
		description:
			'Test yourself on major Russian cities with a focused interactive map quiz designed for fast recall across this vast country.',
		seoDescription:
			'Practice Russia cities on an interactive map quiz covering major urban centers, instant answer checks, and repeat geography study.',
		benefits: [
			'Focus on Russia\'s main urban centers spread from Kaliningrad to Vladivostok',
			'Build a practical mental map of Russian cities without needing to memorize every region',
			'Replay missed cities quickly to reinforce location recall across this large country'
		],
		highlights: ['Major-city coverage', 'Vast country frame', 'Good for general knowledge'],
		faq: [
			{
				question: 'What kind of cities appear in this Russia cities quiz?',
				answer: 'The page focuses on major Russian cities and regional centers rather than a full exhaustive list, so it stays practical for geography recall.'
			},
			{
				question: 'Is Russia too large for a city-level quiz?',
				answer: 'The quiz is designed around a curated set of major cities to make practice manageable and useful rather than overwhelming.'
			},
			{
				question: 'Who is this page most useful for?',
				answer: 'It works for students, quiz players, and anyone who wants a city-focused Russia map drill without extra setup.'
			}
		]
	},
	{
		slug: 'russia-landmarks-quiz',
		parentSlug: 'russia-map-quiz',
		countryCode: 'ru',
		title: 'Russia Landmarks Quiz',
		shortTitle: 'Russia Landmarks',
		primaryKeyword: 'russia landmarks quiz',
		categories: ['Landmarks & Nature'],
		learningFocus: 'Landmarks and natural wonders across Russia',
		searchIntent: 'Russia landmarks geography practice',
		description:
			'Practice Russia landmarks and natural wonders with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of Russia landmarks with an interactive map quiz covering natural wonders, famous sites, and repeat review.',
		benefits: [
			'Move beyond city geography into Russia\'s most iconic natural and cultural landmarks',
			'Practice famous places in a more memorable format than a plain landmark list',
			'Use the same map loop to connect landmarks back to the larger country frame'
		],
		highlights: ['Natural wonder focus', 'Iconic-place recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of places appear in this Russia landmarks quiz?',
				answer: 'The page focuses on well-known natural wonders, UNESCO sites, and famous landmarks rather than major cities or administrative regions.'
			},
			{
				question: 'Is this page useful after Russia cities practice?',
				answer: 'Yes. Once you know major city locations, landmarks become easier to place and remember in the right part of the country.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	},
	{
		slug: 'mexico-states-quiz',
		parentSlug: 'mexico-map-quiz',
		countryCode: 'mx',
		title: 'Mexico States Quiz',
		shortTitle: 'Mexico States',
		primaryKeyword: 'mexico states quiz',
		categories: ['State Capitals'],
		learningFocus: 'Mexican states and state capital recall',
		searchIntent: 'Mexico states geography practice',
		description:
			'Practice Mexico states and state capitals on an interactive map with instant answer feedback and repeatable review.',
		seoDescription:
			'Learn Mexico states with an interactive map quiz covering state capitals, instant feedback, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice all 31 Mexican states and the Federal Entity in one replayable map loop',
			'Build a spatial sense of Mexico\'s geography before drilling landmarks or historic sites',
			'Use repeated runs to distinguish neighboring states from Baja California to the Yucatan'
		],
		highlights: ['State capital focus', 'Full Mexico coverage', 'Best first Mexico drill'],
		faq: [
			{
				question: 'Does this Mexico states quiz include all 31 states?',
				answer: 'Yes. The page is built around all Mexican states so you can learn the full country frame before moving into landmarks or cities.'
			},
			{
				question: 'Should I start here before Mexico landmarks?',
				answer: 'Usually yes. Learning the state framework first makes landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce state geography efficiently.'
			}
		]
	},
	{
		slug: 'mexico-landmarks-quiz',
		parentSlug: 'mexico-map-quiz',
		countryCode: 'mx',
		title: 'Mexico Landmarks Quiz',
		shortTitle: 'Mexico Landmarks',
		primaryKeyword: 'mexico landmarks quiz',
		categories: ['Historic Sites'],
		learningFocus: 'Historic sites and iconic places across Mexico',
		searchIntent: 'Mexico landmarks geography practice',
		description:
			'Practice Mexico historic sites and landmarks with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of Mexico landmarks with an interactive map quiz covering historic sites, ancient ruins, and repeat review.',
		benefits: [
			'Move beyond state geography into Mexico\'s most iconic archaeological and cultural sites',
			'Practice famous historic places in a more memorable format than a plain landmark list',
			'Use the same map loop to connect landmarks back to the larger country frame'
		],
		highlights: ['Historic site focus', 'Ancient-ruins recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of places appear in this Mexico landmarks quiz?',
				answer: 'The page focuses on historic sites, ancient ruins, and famous landmarks rather than state capitals or administrative units.'
			},
			{
				question: 'Is this page useful after Mexico states practice?',
				answer: 'Yes. Once you know the state frame, landmarks become easier to place and remember in the right part of the country.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	},
	{
		slug: 'indonesia-provinces-quiz',
		parentSlug: 'indonesia-map-quiz',
		countryCode: 'id',
		title: 'Indonesia Provinces Quiz',
		shortTitle: 'Indonesia Provinces',
		primaryKeyword: 'indonesia provinces quiz',
		categories: ['Provincial Capitals'],
		learningFocus: 'Indonesian provinces and provincial capital recall',
		searchIntent: 'Indonesia provinces geography practice',
		description:
			'Practice Indonesia provinces and provincial capitals on an interactive map with instant answer checks.',
		seoDescription:
			'Learn Indonesia provinces with an interactive map quiz covering provincial capitals, instant feedback, and repeat practice on MapQuiz.pro.',
		benefits: [
			'Practice Indonesian provinces spread across the archipelago in one replayable map loop',
			'Build a spatial sense of Indonesia\'s geography from Sumatra to Papua',
			'Use repeated runs to distinguish the many provinces across this vast island nation'
		],
		highlights: ['Provincial capital focus', 'Full archipelago coverage', 'Best first Indonesia drill'],
		faq: [
			{
				question: 'Does this Indonesia provinces quiz cover all provinces?',
				answer: 'Yes. The page is built around the full set of Indonesian provinces so you can learn the country frame before moving into landmarks.'
			},
			{
				question: 'Should I start here before Indonesia landmarks?',
				answer: 'Usually yes. Learning the provincial framework first makes landmark recall much easier in the next step.'
			},
			{
				question: 'Is this page useful for school-style geography review?',
				answer: 'Yes. The loop is simple enough for quick revision and specific enough to reinforce provincial geography efficiently.'
			}
		]
	},
	{
		slug: 'indonesia-landmarks-quiz',
		parentSlug: 'indonesia-map-quiz',
		countryCode: 'id',
		title: 'Indonesia Landmarks Quiz',
		shortTitle: 'Indonesia Landmarks',
		primaryKeyword: 'indonesia landmarks quiz',
		categories: ['Landmarks & Nature'],
		learningFocus: 'Landmarks and natural wonders across Indonesia',
		searchIntent: 'Indonesia landmarks geography practice',
		description:
			'Practice Indonesia landmarks and natural wonders with an interactive map quiz built for repeat geography study.',
		seoDescription:
			'Test your knowledge of Indonesia landmarks with an interactive map quiz covering natural wonders, famous sites, and repeat review.',
		benefits: [
			'Move beyond provincial geography into Indonesia\'s most iconic natural and cultural landmarks',
			'Practice famous places in a more memorable format than a plain landmark list',
			'Use the same map loop to connect landmarks back to the larger archipelago frame'
		],
		highlights: ['Natural wonder focus', 'Iconic-place recall', 'Travel-friendly geography'],
		faq: [
			{
				question: 'What kinds of places appear in this Indonesia landmarks quiz?',
				answer: 'The page focuses on well-known natural wonders and famous landmarks rather than provincial capitals or administrative units.'
			},
			{
				question: 'Is this page useful after Indonesia provinces practice?',
				answer: 'Yes. Once you know the provincial frame, landmarks become easier to place and remember across the right islands.'
			},
			{
				question: 'Does this work for casual geography practice too?',
				answer: 'Yes. Landmark-focused quizzes are often easier to revisit because the places feel more concrete and memorable.'
			}
		]
	}
];

const buildCountryRootTopic = (countryCode: string): QuizTopic | null => {
	const country = getCountryByCode(countryCode);
	if (!country) return null;

	const regionGroups = getCountryRegions(country.code);
	const categories = getCountryCategories(country.code);
	const questionCount = regionGroups.reduce(
		(total, group) => total + group.places.length,
		0
	);

	if (questionCount === 0) return null;

	const slug =
		country.code === 'in'
			? 'india-map-quiz'
			: `${slugify(country.name)}-map-quiz`;
	const focusCategories = categories.slice(0, 3);
	const readableFocus =
		focusCategories.length > 0
			? focusCategories.join(', ')
			: 'key regions and cities';
	const baseStrictness = Math.round(
		Strictness.Medium * country.strictnessMultiplier
	);

	return {
		slug,
		kind: 'root',
		countryCode: country.code,
		section: 'countries',
		badge: CONTINENT_LABELS[country.continent],
		title: `${country.name} Map Quiz`,
		shortTitle: country.name,
		seoTitle: `${country.name} Map Quiz | Interactive Geography Practice`,
		seoDescription: `Practice ${country.name} geography with an interactive map quiz covering ${readableFocus.toLowerCase()}.`,
		description: `Explore ${country.name} through a replayable map quiz focused on ${readableFocus.toLowerCase()}.`,
		primaryKeyword: `${country.name.toLowerCase()} map quiz`,
		searchIntent: `${country.name} geography practice and map quiz searches`,
		learningFocus: readableFocus,
		questionCount,
		benefits: [
			...baseBenefits,
			`Built around ${country.name} topics such as ${readableFocus.toLowerCase()}`
		],
		highlights: [
			`${questionCount} locations`,
			focusCategories[0] ?? 'Mixed topics',
			`${country.flag} ${country.name}`
		],
		faq: [
			{
				question: `What does this ${country.name} quiz cover?`,
				answer: `This topic uses ${country.name}-specific data sets including ${readableFocus.toLowerCase()}.`
			},
			{
				question: 'Is the quiz good for classroom or exam prep?',
				answer: 'Yes. It works well for quick recall practice because the map stays interactive and the answer review is immediate.'
			},
			{
				question: 'Can I use it on mobile?',
				answer: 'Yes. The game supports tap-to-place answers on smaller screens as well as desktop clicking.'
			}
		],
		relatedSlugs: [],
		gameConfig: {
			mode: 'country',
			countryCode: country.code,
			category: 'all',
			strictness: baseStrictness
		}
	};
};

const buildCountrySubtopic = (def: CountrySubtopicDef): QuizTopic | null => {
	const country = getCountryByCode(def.countryCode);
	if (!country) return null;

	const regionGroups = getCountryRegions(country.code).filter((group) =>
		def.categories.includes(group.category)
	);
	const questionCount = regionGroups.reduce(
		(total, group) => total + group.places.length,
		0
	);

	if (questionCount === 0) return null;

	const baseStrictness = Math.round(
		Strictness.Medium * country.strictnessMultiplier
	);

	return {
		slug: def.slug,
		kind: 'subtopic',
		parentSlug: def.parentSlug,
		countryCode: country.code,
		section: 'countries',
		badge: CONTINENT_LABELS[country.continent],
		title: def.title,
		shortTitle: def.shortTitle,
		seoTitle: `${def.title} | Interactive Geography Practice`,
		seoDescription:
			def.seoDescription ??
			`${def.description} Replay missed answers and improve faster on MapQuiz.pro.`,
		description: def.description,
		primaryKeyword: def.primaryKeyword,
		searchIntent: def.searchIntent,
		learningFocus: def.learningFocus,
		questionCount,
		categoryLabels: [...def.categories],
		benefits:
			def.benefits ??
			[
				...baseBenefits,
				`Focused only on ${def.categories.join(', ').toLowerCase()}`
			],
		highlights:
			def.highlights ??
			[
				`${questionCount} map targets`,
				def.categories[0],
				`${country.flag} ${country.name}`
			],
		faq:
			def.faq ??
			[
				{
					question: `What does this ${def.shortTitle.toLowerCase()} quiz cover?`,
					answer: `This page focuses on ${def.categories.join(', ').toLowerCase()} in ${country.name}.`
				},
				{
					question: 'Can I replay missed answers?',
					answer: 'Yes. You can repeat the quiz and use the review flow to focus on places you missed.'
				},
				{
					question: 'Does it work on mobile?',
					answer: 'Yes. The quiz supports tap-based map input on phones and tablets.'
				}
			],
		relatedSlugs: [],
		gameConfig: {
			mode: 'country',
			countryCode: country.code,
			category: [...def.categories],
			strictness: baseStrictness
		}
	};
};

const worldTopics = WORLD_TOPIC_DEFS.map(buildWorldTopic);
const countryTopics = FEATURED_COUNTRIES.map((country) =>
	buildCountryRootTopic(country.code)
).filter((topic): topic is QuizTopic => topic !== null);
const countrySubtopics = COUNTRY_SUBTOPIC_DEFS.map(buildCountrySubtopic).filter(
	(topic): topic is QuizTopic => topic !== null
);

const allTopics = [...worldTopics, ...countryTopics, ...countrySubtopics];

const topicsBySlug = new Map(allTopics.map((topic) => [topic.slug, topic]));

for (const topic of countryTopics) {
	const country = getCountryByCode(topic.countryCode ?? '');
	const continentSlug = country
		? `${country.continent}-countries-quiz`
		: 'world-map-quiz';
	const childTopics = countrySubtopics
		.filter((child) => child.parentSlug === topic.slug)
		.map((child) => child.slug);
	const peerCountries = country
		? FEATURED_COUNTRIES.filter(
				(candidate) =>
					candidate.code !== country.code &&
					candidate.continent === country.continent
			)
				.slice(0, 2)
				.map((candidate) =>
					candidate.code === 'in'
						? 'india-map-quiz'
						: `${slugify(candidate.name)}-map-quiz`
				)
		: [];

	topic.relatedSlugs = [
		...childTopics,
		continentSlug,
		'world-map-quiz',
		...peerCountries
	]
		.filter((slug, index, list) => list.indexOf(slug) === index)
		.slice(0, 4);
}

for (const topic of countrySubtopics) {
	const siblings = countrySubtopics
		.filter(
			(candidate) =>
				candidate.parentSlug === topic.parentSlug &&
				candidate.slug !== topic.slug
		)
		.map((candidate) => candidate.slug);

	topic.relatedSlugs = [topic.parentSlug, ...siblings]
		.filter((slug): slug is string => Boolean(slug))
		.slice(0, 3);
}

export const QUIZ_SECTIONS = quizSectionMeta;

export const quizTopics = allTopics;

export const getQuizTopicBySlug = (slug: string) =>
	topicsBySlug.get(slug) ?? null;

export const getQuizTopicsBySection = (section: QuizTopic['section']) =>
	quizTopics.filter((topic) => topic.section === section);

export const getQuizTopicsByKind = (kind: QuizTopicKind) =>
	quizTopics.filter((topic) => topic.kind === kind);

export const getCountrySubtopics = (countryCode?: string) =>
	quizTopics.filter(
		(topic) =>
			topic.kind === 'subtopic' &&
			(countryCode ? topic.countryCode === countryCode : true)
	);

export const getRelatedQuizTopics = (slug: string, limit = 3) => {
	const topic = getQuizTopicBySlug(slug);
	if (!topic) return [];

	return topic.relatedSlugs
		.map((relatedSlug) => getQuizTopicBySlug(relatedSlug))
		.filter(
			(relatedTopic): relatedTopic is QuizTopic => relatedTopic !== null
		)
		.slice(0, limit);
};

export const buildGameHref = (config: QuizGameConfig) => {
	const categoryParam =
		config.category === 'all' ? 'all' : config.category.join(',');
	const params = new URLSearchParams({
		mode: config.mode,
		category: categoryParam,
		strictness: String(config.strictness)
	});

	if (config.countryCode) {
		params.set('country', config.countryCode);
	}

	return `/game?${params.toString()}`;
};

export const inferTopicSlugFromGameConfig = (config: QuizGameConfig) => {
	if (config.mode === 'world') {
		if (config.category === 'all') return 'world-map-quiz';
		if (config.category.length === 1) {
			return `${config.category[0].toLowerCase()}-countries-quiz`;
		}
		return 'world-map-quiz';
	}

	if (config.mode === 'country') {
		if (config.countryCode === 'in') return 'india-map-quiz';
		const country = getCountryByCode(config.countryCode ?? '');
		return country ? `${slugify(country.name)}-map-quiz` : null;
	}

	return 'india-map-quiz';
};

export const getRecommendedQuizTopics = (input: {
	mode?: GameMode;
	countryCode?: string;
	category?: 'all' | string[];
	currentSlug?: string;
	limit?: number;
}) => {
	if (input.currentSlug) {
		return getRelatedQuizTopics(input.currentSlug, input.limit ?? 3);
	}

	if (input.mode === 'country' && input.countryCode) {
		const country = getCountryByCode(input.countryCode);
		if (country) {
			const slug =
				country.code === 'in'
					? 'india-map-quiz'
					: `${slugify(country.name)}-map-quiz`;
			return getRelatedQuizTopics(slug, input.limit ?? 3);
		}
	}

	if (input.mode === 'world') {
		const categories = Array.isArray(input.category) ? input.category : [];
		if (categories[0]) {
			const slug = `${categories[0].toLowerCase()}-countries-quiz`;
			return getRelatedQuizTopics(slug, input.limit ?? 3);
		}
		return getRelatedQuizTopics('world-map-quiz', input.limit ?? 3);
	}

	return quizTopics.slice(0, input.limit ?? 3);
};

export const getDailyChallengeTopic = (date = new Date()) => {
	const dayIndex = Math.floor(
		(Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate()
		) -
			DAILY_CHALLENGE_EPOCH) /
			86_400_000
	);

	return quizTopics[
		((dayIndex % quizTopics.length) + quizTopics.length) % quizTopics.length
	];
};

export const formatChallengeDate = (date = new Date()) =>
	date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
