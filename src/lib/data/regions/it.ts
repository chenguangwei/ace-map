import type { PlaceItems } from '@/lib/utils/places';

export const itPlaces: PlaceItems[] = [
	{
		category: 'Regional Capitals',
		places: [
			{ name: 'Rome (Lazio)', latitude: 41.9028, longitude: 12.4964 },
			{ name: 'Milan (Lombardy)', latitude: 45.4654, longitude: 9.1859 },
			{
				name: 'Naples (Campania)',
				latitude: 40.8518,
				longitude: 14.2681
			},
			{ name: 'Turin (Piedmont)', latitude: 45.0703, longitude: 7.6869 },
			{ name: 'Palermo (Sicily)', latitude: 38.1157, longitude: 13.3615 },
			{ name: 'Genoa (Liguria)', latitude: 44.4056, longitude: 8.9463 },
			{
				name: 'Florence (Tuscany)',
				latitude: 43.7696,
				longitude: 11.2558
			},
			{ name: 'Bari (Apulia)', latitude: 41.1171, longitude: 16.8719 },
			{ name: 'Catania (Sicily)', latitude: 37.5079, longitude: 15.083 },
			{ name: 'Venice (Veneto)', latitude: 45.4408, longitude: 12.3155 },
			{ name: 'Verona (Veneto)', latitude: 45.4384, longitude: 10.9916 },
			{
				name: 'Bologna (Emilia-Romagna)',
				latitude: 44.4949,
				longitude: 11.3426
			},
			{
				name: 'Cagliari (Sardinia)',
				latitude: 39.2238,
				longitude: 9.1217
			},
			{
				name: 'Trieste (Friuli-Venezia Giulia)',
				latitude: 45.6495,
				longitude: 13.7768
			},
			{ name: 'Trento (Trentino)', latitude: 46.0664, longitude: 11.1257 }
		]
	},
	{
		category: 'UNESCO Heritage Sites',
		places: [
			{ name: 'Colosseum', latitude: 41.8902, longitude: 12.4922 },
			{ name: 'Pompeii', latitude: 40.7489, longitude: 14.4989 },
			{
				name: 'Leaning Tower of Pisa',
				latitude: 43.723,
				longitude: 10.3966
			},
			{ name: 'Dolomites', latitude: 46.4102, longitude: 11.844 },
			{ name: 'Cinque Terre', latitude: 44.1228, longitude: 9.7235 },
			{ name: 'Amalfi Coast', latitude: 40.6333, longitude: 14.6029 },
			{
				name: 'Valley of Temples (Agrigento)',
				latitude: 37.2909,
				longitude: 13.5884
			},
			{ name: 'Mount Etna', latitude: 37.751, longitude: 14.9934 }
		]
	}
];
