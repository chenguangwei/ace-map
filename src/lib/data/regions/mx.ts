import type { PlaceItems } from '@/lib/utils/places';

export const mxPlaces: PlaceItems[] = [
	{
		category: 'State Capitals',
		places: [
			{
				name: 'Mexico City (CDMX)',
				latitude: 19.4326,
				longitude: -99.1332
			},
			{
				name: 'Guadalajara (Jalisco)',
				latitude: 20.6597,
				longitude: -103.3496
			},
			{
				name: 'Monterrey (Nuevo León)',
				latitude: 25.6866,
				longitude: -100.3161
			},
			{ name: 'Puebla (Puebla)', latitude: 19.0414, longitude: -98.2063 },
			{
				name: 'Tijuana (Baja California)',
				latitude: 32.5149,
				longitude: -117.0382
			},
			{
				name: 'León (Guanajuato)',
				latitude: 21.1619,
				longitude: -101.6829
			},
			{
				name: 'Juárez (Chihuahua)',
				latitude: 31.6904,
				longitude: -106.4245
			},
			{
				name: 'Torreón (Coahuila)',
				latitude: 25.5428,
				longitude: -103.4068
			},
			{
				name: 'San Luis Potosí',
				latitude: 22.1565,
				longitude: -100.9855
			},
			{
				name: 'Mérida (Yucatán)',
				latitude: 20.9674,
				longitude: -89.5926
			},
			{
				name: 'Hermosillo (Sonora)',
				latitude: 29.0729,
				longitude: -110.9559
			},
			{ name: 'Chihuahua City', latitude: 28.6353, longitude: -106.0889 },
			{
				name: 'Cancún (Quintana Roo)',
				latitude: 21.1619,
				longitude: -86.8515
			},
			{
				name: 'Culiacán (Sinaloa)',
				latitude: 24.7994,
				longitude: -107.3879
			},
			{
				name: 'Acapulco (Guerrero)',
				latitude: 16.8531,
				longitude: -99.8237
			},
			{
				name: 'Veracruz (Veracruz)',
				latitude: 19.1738,
				longitude: -96.1342
			},
			{ name: 'Oaxaca City', latitude: 17.0732, longitude: -96.7266 },
			{
				name: 'Morelia (Michoacán)',
				latitude: 19.7059,
				longitude: -101.195
			}
		]
	},
	{
		category: 'Historic Sites',
		places: [
			{ name: 'Chichen Itza', latitude: 20.6843, longitude: -88.5678 },
			{ name: 'Teotihuacan', latitude: 19.6925, longitude: -98.8438 },
			{ name: 'Palenque', latitude: 17.4838, longitude: -92.0436 },
			{ name: 'Tulum', latitude: 20.2108, longitude: -87.4654 },
			{ name: 'Monte Albán', latitude: 17.0432, longitude: -96.7688 },
			{ name: 'Uxmal', latitude: 20.3596, longitude: -89.7712 },
			{ name: 'Copper Canyon', latitude: 27.5, longitude: -107.5 }
		]
	}
];
