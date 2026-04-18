import type { PlaceItems } from '@/lib/utils/places';

export const frPlaces: PlaceItems[] = [
	{
		category: 'Regional Capitals',
		places: [
			{
				name: 'Paris (Île-de-France)',
				latitude: 48.8566,
				longitude: 2.3522
			},
			{
				name: 'Lyon (Auvergne-Rhône-Alpes)',
				latitude: 45.764,
				longitude: 4.8357
			},
			{
				name: "Marseille (Provence-Alpes-Côte d'Azur)",
				latitude: 43.2965,
				longitude: 5.3698
			},
			{
				name: 'Bordeaux (Nouvelle-Aquitaine)',
				latitude: 44.8378,
				longitude: -0.5792
			},
			{
				name: 'Toulouse (Occitanie)',
				latitude: 43.6047,
				longitude: 1.4442
			},
			{
				name: 'Nantes (Pays de la Loire)',
				latitude: 47.2184,
				longitude: -1.5536
			},
			{
				name: 'Strasbourg (Grand Est)',
				latitude: 48.5734,
				longitude: 7.7521
			},
			{
				name: 'Lille (Hauts-de-France)',
				latitude: 50.6292,
				longitude: 3.0573
			},
			{
				name: 'Rennes (Brittany)',
				latitude: 48.1173,
				longitude: -1.6778
			},
			{ name: 'Rouen (Normandy)', latitude: 49.4432, longitude: 1.0993 },
			{
				name: 'Montpellier (Occitanie)',
				latitude: 43.6108,
				longitude: 3.8767
			},
			{
				name: 'Dijon (Bourgogne-Franche-Comté)',
				latitude: 47.322,
				longitude: 5.0415
			},
			{
				name: 'Orléans (Centre-Val de Loire)',
				latitude: 47.9029,
				longitude: 1.9039
			}
		]
	},
	{
		category: 'Major Cities',
		places: [
			{ name: 'Nice', latitude: 43.7102, longitude: 7.262 },
			{ name: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
			{ name: 'Grenoble', latitude: 45.1885, longitude: 5.7245 },
			{ name: 'Toulon', latitude: 43.1242, longitude: 5.928 },
			{ name: 'Cannes', latitude: 43.5528, longitude: 7.0174 },
			{ name: 'Reims', latitude: 49.2583, longitude: 4.0317 },
			{ name: 'Angers', latitude: 47.4784, longitude: -0.5632 },
			{ name: 'Brest', latitude: 48.3905, longitude: -4.4861 }
		]
	},
	{
		category: 'Famous Landmarks',
		places: [
			{ name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945 },
			{
				name: 'Palace of Versailles',
				latitude: 48.8049,
				longitude: 2.1204
			},
			{ name: 'Mont Saint-Michel', latitude: 48.636, longitude: -1.5115 },
			{ name: 'Lascaux Caves', latitude: 45.0531, longitude: 1.082 },
			{ name: 'Mont Blanc', latitude: 45.8326, longitude: 6.8652 },
			{
				name: 'D-Day Beaches (Normandy)',
				latitude: 49.3394,
				longitude: -0.8527
			},
			{ name: 'Châteaux de la Loire', latitude: 47.5, longitude: 1.3 },
			{ name: 'Carcassonne', latitude: 43.2119, longitude: 2.3499 },
			{
				name: "French Riviera (Côte d'Azur)",
				latitude: 43.7,
				longitude: 7.25
			}
		]
	}
];
