import type { PlaceItems } from '@/lib/utils/places';

export const krPlaces: PlaceItems[] = [
	{
		category: 'Major Cities',
		places: [
			{ name: 'Seoul', latitude: 37.5665, longitude: 126.978 },
			{ name: 'Busan', latitude: 35.1796, longitude: 129.0756 },
			{ name: 'Incheon', latitude: 37.4563, longitude: 126.7052 },
			{ name: 'Daegu', latitude: 35.8714, longitude: 128.6014 },
			{ name: 'Daejeon', latitude: 36.3504, longitude: 127.3845 },
			{ name: 'Gwangju', latitude: 35.1595, longitude: 126.8526 },
			{ name: 'Suwon', latitude: 37.2636, longitude: 127.0286 },
			{ name: 'Ulsan', latitude: 35.5384, longitude: 129.3114 },
			{ name: 'Changwon', latitude: 35.2279, longitude: 128.6811 },
			{ name: 'Seongnam', latitude: 37.4386, longitude: 127.1378 },
			{ name: 'Goyang', latitude: 37.6584, longitude: 126.832 },
			{ name: 'Yongin', latitude: 37.2411, longitude: 127.1775 }
		]
	},
	{
		category: 'Provinces',
		places: [
			{
				name: 'Gyeonggi Province',
				latitude: 37.4138,
				longitude: 127.5183
			},
			{
				name: 'North Gyeongsang',
				latitude: 36.4919,
				longitude: 128.8889
			},
			{
				name: 'South Gyeongsang',
				latitude: 35.4606,
				longitude: 128.2132
			},
			{ name: 'North Chungcheong', latitude: 36.8, longitude: 127.7 },
			{ name: 'South Chungcheong', latitude: 36.5184, longitude: 126.8 },
			{ name: 'North Jeolla', latitude: 35.7175, longitude: 127.153 },
			{ name: 'South Jeolla', latitude: 34.8679, longitude: 126.991 },
			{
				name: 'Gangwon Province',
				latitude: 37.8228,
				longitude: 128.1555
			},
			{ name: 'Jeju Island', latitude: 33.4996, longitude: 126.5312 }
		]
	},
	{
		category: 'Landmarks',
		places: [
			{
				name: 'Gyeongbokgung Palace',
				latitude: 37.5796,
				longitude: 126.977
			},
			{
				name: 'Namsan Tower (N Seoul Tower)',
				latitude: 37.5512,
				longitude: 126.9882
			},
			{
				name: 'Bukhansan National Park',
				latitude: 37.6594,
				longitude: 126.977
			},
			{ name: 'Jeju Hallasan', latitude: 33.3617, longitude: 126.5292 },
			{
				name: 'Seoraksan National Park',
				latitude: 38.1196,
				longitude: 128.4657
			},
			{ name: 'Haeinsa Temple', latitude: 35.7997, longitude: 128.0999 },
			{ name: 'Beopjusa Temple', latitude: 36.5428, longitude: 127.9101 },
			{
				name: 'DMZ (Demilitarized Zone)',
				latitude: 37.9524,
				longitude: 126.6739
			}
		]
	}
];
