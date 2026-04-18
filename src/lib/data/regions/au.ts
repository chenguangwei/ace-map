import type { PlaceItems } from '@/lib/utils/places';

export const auPlaces: PlaceItems[] = [
	{
		category: 'State & Territory Capitals',
		places: [
			{
				name: 'Sydney (New South Wales)',
				latitude: -33.8688,
				longitude: 151.2093
			},
			{
				name: 'Melbourne (Victoria)',
				latitude: -37.8136,
				longitude: 144.9631
			},
			{
				name: 'Brisbane (Queensland)',
				latitude: -27.4698,
				longitude: 153.0251
			},
			{
				name: 'Perth (Western Australia)',
				latitude: -31.9505,
				longitude: 115.8605
			},
			{
				name: 'Adelaide (South Australia)',
				latitude: -34.9285,
				longitude: 138.6007
			},
			{
				name: 'Hobart (Tasmania)',
				latitude: -42.8821,
				longitude: 147.3272
			},
			{
				name: 'Darwin (Northern Territory)',
				latitude: -12.4634,
				longitude: 130.8456
			},
			{ name: 'Canberra (ACT)', latitude: -35.2809, longitude: 149.13 }
		]
	},
	{
		category: 'Major Cities',
		places: [
			{ name: 'Gold Coast', latitude: -28.0167, longitude: 153.4 },
			{ name: 'Newcastle', latitude: -32.9283, longitude: 151.7817 },
			{ name: 'Sunshine Coast', latitude: -26.65, longitude: 153.0667 },
			{ name: 'Wollongong', latitude: -34.4278, longitude: 150.8931 },
			{ name: 'Geelong', latitude: -38.1499, longitude: 144.3617 },
			{ name: 'Townsville', latitude: -19.2576, longitude: 146.8177 },
			{ name: 'Cairns', latitude: -16.9203, longitude: 145.7709 },
			{ name: 'Toowoomba', latitude: -27.5598, longitude: 151.9507 }
		]
	},
	{
		category: 'Natural Wonders',
		places: [
			{
				name: 'Great Barrier Reef',
				latitude: -18.2871,
				longitude: 147.6992
			},
			{
				name: 'Uluru (Ayers Rock)',
				latitude: -25.3444,
				longitude: 131.0369
			},
			{
				name: 'Great Ocean Road',
				latitude: -38.7603,
				longitude: 143.6494
			},
			{
				name: 'Kakadu National Park',
				latitude: -13.0008,
				longitude: 132.4714
			},
			{ name: 'Blue Mountains', latitude: -33.7, longitude: 150.311 },
			{
				name: 'Daintree Rainforest',
				latitude: -16.1703,
				longitude: 145.4188
			},
			{ name: 'Whitsunday Islands', latitude: -20.1, longitude: 148.883 },
			{ name: 'Nullarbor Plain', latitude: -31.5, longitude: 127.0 },
			{ name: 'Kimberley Region', latitude: -17.0, longitude: 125.0 }
		]
	}
];
