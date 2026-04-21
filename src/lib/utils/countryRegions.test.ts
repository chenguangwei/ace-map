import { describe, expect, it } from 'vitest';
import { FEATURED_COUNTRIES } from '@/lib/data/countries';
import { getCountryRegions } from '@/lib/data/regions';
import {
	getCountryRegionStaticSource,
	resolveCountryPlaceSelection
} from './countryRegions';

describe('country region helpers', () => {
	it('provides admin-boundary sources for every featured country', () => {
		for (const country of FEATURED_COUNTRIES) {
			expect(getCountryRegionStaticSource(country.code)).not.toBeNull();
		}
	});

	it('keeps capital-city quizzes on point mode', () => {
		const usCapital =
			getCountryRegions('us').find(
				(group) => group.category === 'State Capitals'
			)?.places[0] ?? null;
		expect(usCapital).not.toBeNull();
		expect(resolveCountryPlaceSelection('us', usCapital)).toBeNull();
	});

	it('still resolves true province quizzes as region selections', () => {
		const koreanProvince =
			getCountryRegions('kr').find(
				(group) => group.category === 'Provinces'
			)?.places[0] ?? null;
		expect(koreanProvince).not.toBeNull();
		expect(
			resolveCountryPlaceSelection('kr', koreanProvince)
		).not.toBeNull();
	});
});
