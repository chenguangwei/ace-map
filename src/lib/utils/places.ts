export interface Place {
	latitude: number;
	longitude: number;
	name: string;
}

export interface PlaceItems {
	category: string;
	places: Place[];
}

export interface PlaceWithoutName {
	latitude: number;
	longitude: number;
	selectionKey?: string;
	selectionLabel?: string;
}

export type GameMode = 'india' | 'world' | 'country';

export enum Strictness {
	High = 50000, // 50 km
	Medium = 150000, // 150 km
	Low = 400000 // 400 km
}

/** World-mode strictness values (much larger scale) */
export enum WorldStrictness {
	High = 300000, // 300 km
	Medium = 800000, // 800 km
	Low = 2000000 // 2000 km
}

export const numToStrictness = (num: number): Strictness => {
	if (num <= Strictness.High) return Strictness.High;
	if (num <= Strictness.Medium) return Strictness.Medium;
	return Strictness.Low;
};

export const strictnessLabel = (
	value: number,
	mode: GameMode = 'india'
): string => {
	if (mode === 'world') {
		if (value <= WorldStrictness.High) return 'High';
		if (value <= WorldStrictness.Medium) return 'Medium';
		return 'Low';
	}
	if (value <= Strictness.High) return 'High';
	if (value <= Strictness.Medium) return 'Medium';
	return 'Low';
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculate Haversine distance in meters between two coordinates
 */
export const haversineDistance = (
	a: PlaceWithoutName,
	b: PlaceWithoutName
): number => {
	const R = 6371000;
	const lat1 = toRadians(a.latitude);
	const lat2 = toRadians(b.latitude);
	const dLat = toRadians(b.latitude - a.latitude);
	const dLon = toRadians(b.longitude - a.longitude);

	const sin2 =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
};

/**
 * Check if the user's guess is nearly correct (Haversine distance)
 */
export const isNearlyCorrect = (
	userGuess: PlaceWithoutName,
	correctLocation: PlaceWithoutName,
	strictness: number
): boolean => haversineDistance(userGuess, correctLocation) <= strictness;

/**
 * Format a distance (meters) to a human-readable string
 */
export const formatDistance = (meters: number): string => {
	if (meters < 1000) return `${Math.round(meters)} m`;
	if (meters < 1_000_000) return `${(meters / 1000).toFixed(0)} km`;
	return `${(meters / 1_000_000).toFixed(1)}M km`;
};

/**
 * Get places from the India predefined list based on categories
 */
export const getPlace = (
	categories: 'all' | string[],
	source: PlaceItems[] = predefinedPlaces
): Place[] => {
	if (categories === 'all') {
		return source.reduce((acc, curr) => {
			acc.push(...curr.places);
			return acc;
		}, [] as Place[]);
	}

	return source.reduce((acc, curr) => {
		if (categories.includes(curr.category)) {
			acc.push(...curr.places);
		}
		return acc;
	}, [] as Place[]);
};

// ─────────────────────────────────────────────────────────────────
// India (legacy / default country) data
// ─────────────────────────────────────────────────────────────────

export const predefinedPlaces: PlaceItems[] = [
	{
		category: 'History',
		places: [
			{
				name: 'Calcutta session 1920',
				latitude: 22.5744,
				longitude: 88.3629
			},
			{
				name: 'Nagpur session 1920',
				latitude: 21.1458,
				longitude: 79.0882
			},
			{
				name: 'Madras session 1927',
				latitude: 13.0843,
				longitude: 80.2705
			},
			{
				name: 'Jallianwala Bagh',
				latitude: 31.634,
				longitude: 74.8723
			},
			{
				name: 'Dandi',
				latitude: 21.335169,
				longitude: 72.623028
			},
			{
				name: 'Kheda Satyagraha',
				latitude: 22.750227,
				longitude: 72.687173
			},
			{
				name: 'Champaran Satyagraha',
				latitude: 27.133535,
				longitude: 84.355844
			},
			{
				name: 'Ahmedabad session 1930',
				latitude: 23.034225,
				longitude: 72.576982
			}
		]
	},
	{
		category: 'Dams',
		places: [
			{
				name: 'Salal dam',
				latitude: 33.143148,
				longitude: 74.811205
			},
			{
				name: 'Bhakra Nangal dam',
				latitude: 31.409785,
				longitude: 76.434977
			},
			{
				name: 'Tehri dam',
				latitude: 30.383948,
				longitude: 78.498002
			},
			{
				name: 'Rana Partap Sagar',
				latitude: 24.801937,
				longitude: 75.590917
			},
			{
				name: 'Sardar Sarovar dam',
				latitude: 21.830705,
				longitude: 73.748923
			},
			{
				name: 'Hirakud dam',
				latitude: 21.530735,
				longitude: 83.870452
			},
			{
				name: 'Nagarjuna Sagar dam',
				latitude: 16.576096,
				longitude: 79.312493
			},
			{
				name: 'Tungabhadra dam',
				latitude: 15.292981,
				longitude: 76.344694
			}
		]
	},
	{
		category: 'Iron mines',
		places: [
			{
				name: 'Mayurbhanj',
				latitude: 22.096123,
				longitude: 86.133442
			},
			{
				name: 'Durg',
				latitude: 21.208591,
				longitude: 81.309463
			},
			{
				name: 'Bailadila',
				latitude: 18.694127,
				longitude: 81.219029
			},
			{
				name: 'Bellary',
				latitude: 15.142529,
				longitude: 76.87726
			},
			{
				name: 'Kudremukh',
				latitude: 13.208832,
				longitude: 75.261275
			}
		]
	},
	{
		category: 'Coal mines',
		places: [
			{
				name: 'Raniganj',
				latitude: 23.61989,
				longitude: 87.096412
			},
			{
				name: 'Bokaro',
				latitude: 23.671241,
				longitude: 86.123586
			},
			{
				name: 'Talcher',
				latitude: 20.949345,
				longitude: 85.214226
			},
			{
				name: 'Neyveli',
				latitude: 11.542008,
				longitude: 79.479987
			}
		]
	},
	{
		category: 'Oil fields',
		places: [
			{
				name: 'Digboi',
				latitude: 27.396626,
				longitude: 95.627093
			},
			{
				name: 'Naharkatiya',
				latitude: 27.286863,
				longitude: 95.327319
			},
			{
				name: 'Mumbai High',
				latitude: 19.073132,
				longitude: 71.382375
			},
			{
				name: 'Bassien',
				latitude: 20.237408,
				longitude: 71.831715
			},
			{
				name: 'Kalol',
				latitude: 23.240066,
				longitude: 72.494599
			},
			{
				name: 'Ankleshwar',
				latitude: 21.623571,
				longitude: 73.023404
			}
		]
	},
	{
		category: 'Thermal plants',
		places: [
			{
				name: 'Namrup',
				latitude: 27.185346,
				longitude: 95.353397
			},
			{
				name: 'Singrauli',
				latitude: 24.203226,
				longitude: 82.65543
			},
			{
				name: 'Ramagundam',
				latitude: 18.753149,
				longitude: 79.498195
			}
		]
	},
	{
		category: 'Nuclear plants',
		places: [
			{
				name: 'Narora',
				latitude: 28.198472,
				longitude: 78.384307
			},
			{
				name: 'Kakrapar',
				latitude: 21.301679,
				longitude: 73.367522
			},
			{
				name: 'Tarapur',
				latitude: 19.831824,
				longitude: 72.661754
			},
			{
				name: 'Kalpakkam',
				latitude: 12.522974,
				longitude: 80.156553
			}
		]
	},
	{
		category: 'Cotton textile',
		places: [
			{
				name: 'Mumbai',
				latitude: 19.101299,
				longitude: 72.878237
			},
			{
				name: 'Indore',
				latitude: 22.709384,
				longitude: 75.861786
			},
			{
				name: 'Surat',
				latitude: 21.186072,
				longitude: 72.829491
			},
			{
				name: 'Kanpur',
				latitude: 26.441002,
				longitude: 80.316062
			},
			{
				name: 'Coimbatore',
				latitude: 11.016317,
				longitude: 76.948004
			}
		]
	},
	{
		category: 'Iron and steel',
		places: [
			{
				name: 'Duragpur',
				latitude: 23.531056,
				longitude: 87.292208
			},
			{
				name: 'Bokaro',
				latitude: 23.65927,
				longitude: 86.137658
			},
			{
				name: 'Jamshedpur',
				latitude: 22.794769,
				longitude: 86.199456
			},
			{
				name: 'Bhilai',
				latitude: 21.206885,
				longitude: 81.359442
			},
			{
				name: 'Vijaynagar',
				latitude: 15.183475,
				longitude: 76.659651
			},
			{
				name: 'Salem',
				latitude: 11.654491,
				longitude: 78.136788
			}
		]
	},
	{
		category: 'Software parks',
		places: [
			{
				name: 'Noida',
				latitude: 28.555279,
				longitude: 77.380523
			},
			{
				name: 'Gandhinagar',
				latitude: 23.222282,
				longitude: 72.643487
			},
			{
				name: 'Mumbai',
				latitude: 19.101299,
				longitude: 72.878237
			},
			{
				name: 'Pune',
				latitude: 18.514832,
				longitude: 73.864336
			},
			{
				name: 'Thiruvananthapuram',
				latitude: 8.516808,
				longitude: 76.946601
			},
			{
				name: 'Hyderabad',
				latitude: 17.375587,
				longitude: 78.486305
			},
			{
				name: 'Bengaluru',
				latitude: 12.947254,
				longitude: 77.588349
			},
			{
				name: 'Chennai',
				latitude: 13.097637,
				longitude: 80.230627
			}
		]
	},
	{
		category: 'Sea ports',
		places: [
			{
				name: 'Kandla',
				latitude: 23.015402,
				longitude: 70.190981
			},
			{
				name: 'Mumbai',
				latitude: 19.101299,
				longitude: 72.878237
			},
			{
				name: 'Marmagao',
				latitude: 15.384646,
				longitude: 73.821171
			},
			{
				name: 'New Mangalore',
				latitude: 12.92785,
				longitude: 74.822449
			},
			{
				name: 'Kochi',
				latitude: 9.92428,
				longitude: 76.301415
			},
			{
				name: 'Tuticorin',
				latitude: 8.774471,
				longitude: 78.138187
			},
			{
				name: 'Chennai',
				latitude: 13.097637,
				longitude: 80.230627
			},
			{
				name: 'Visakhapatnam',
				latitude: 17.722338,
				longitude: 83.24472
			},
			{
				name: 'Paradip',
				latitude: 20.272936,
				longitude: 86.675684
			},
			{
				name: 'Haldia',
				latitude: 22.077175,
				longitude: 88.08
			}
		]
	},
	{
		category: 'Airports',
		places: [
			{
				name: 'Sri Guru Ram Dass Jee International Airport',
				latitude: 31.705502,
				longitude: 74.806897
			},
			{
				name: 'Indira Gandhi International Airport',
				latitude: 28.555792,
				longitude: 77.100153
			},
			{
				name: 'Chhatrapati Shivaji Maharaj International Airport',
				latitude: 19.089341,
				longitude: 72.863665
			},
			{
				name: 'Meenam Bakkam International Airport',
				latitude: 12.989876,
				longitude: 80.166815
			},
			{
				name: 'Netaji Subhash Chandra Bose International Airport',
				latitude: 22.653326,
				longitude: 88.445138
			},
			{
				name: 'Rajiv Gandhi International Airport',
				latitude: 17.239925,
				longitude: 78.429863
			}
		]
	}
] as const;

export const categories = predefinedPlaces.map((place) => place.category);
