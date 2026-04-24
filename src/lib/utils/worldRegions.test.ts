import { describe, expect, it } from 'vitest';
import {
	isWorldMicroRegionName,
	resolveWorldFeatureSelection,
	WORLD_MICRO_REGION_RULES,
	worldMicroRegionFeatureCollection
} from '@/lib/utils/worldRegions';

describe('world region micro target helpers', () => {
	it('keeps the micro target rule thresholds explicit', () => {
		expect(WORLD_MICRO_REGION_RULES.maxWidthDegrees).toBe(2.4);
		expect(WORLD_MICRO_REGION_RULES.maxHeightDegrees).toBe(1.8);
		expect(WORLD_MICRO_REGION_RULES.maxBoundingArea).toBe(2.2);
	});

	it('keeps micro target assist points for tiny island countries', () => {
		const names = worldMicroRegionFeatureCollection.features.map(
			(feature) => feature.properties.name
		);

		expect(names).toContain('Maldives');
		expect(names).toContain('Singapore');
		expect(names).toContain('Bahrain');
		expect(names).toContain('Luxembourg');
		expect(names).toContain('Qatar');
		expect(names).toContain('Trinidad and Tobago');
		expect(names).not.toContain('Japan');
		expect(names).not.toContain('France');
	});

	it('flags micro regions by geometry-derived thresholds for target prompts', () => {
		expect(isWorldMicroRegionName('Maldives')).toBe(true);
		expect(isWorldMicroRegionName('Luxembourg')).toBe(true);
		expect(isWorldMicroRegionName('Trinidad and Tobago')).toBe(true);
		expect(isWorldMicroRegionName('Rwanda')).toBe(true);
		expect(isWorldMicroRegionName('maldives')).toBe(true);
		expect(isWorldMicroRegionName('Japan')).toBe(false);
		expect(isWorldMicroRegionName('China')).toBe(false);
	});

	it('can resolve Maldives through the world feature selection flow', () => {
		const selection = resolveWorldFeatureSelection('Maldives');
		expect(selection).not.toBeNull();
		expect(selection?.label).toBe('Maldives');
		expect(selection?.place.latitude).toBeCloseTo(3.2028, 3);
		expect(selection?.place.longitude).toBeCloseTo(73.2207, 3);
	});
});
