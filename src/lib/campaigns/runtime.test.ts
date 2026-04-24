import { describe, expect, it } from 'vitest';
import { deriveCampaignDialogueFrame } from '@/lib/campaigns/runtime';
import { getCampaignBySlug, getCampaigns } from '@/lib/data/campaigns';

describe('campaign story content', () => {
	it('keeps mission preview counts aligned with mission counts', () => {
		for (const locale of ['en', 'zh', 'ja'] as const) {
			for (const campaign of getCampaigns(locale)) {
				expect(campaign.missionPreviews).toHaveLength(
					campaign.missionCount
				);
				expect(campaign.story.prologue.trim().length).toBeGreaterThan(
					40
				);
				expect(campaign.story.epilogue.trim().length).toBeGreaterThan(
					40
				);
				expect(campaign.story.factions.length).toBeGreaterThanOrEqual(
					3
				);
			}
		}
	});

	it('prefers mission-specific dialogue when rendering the live campaign frame', () => {
		const campaign = getCampaignBySlug('zh', 'lost-shipping-route');
		expect(campaign).not.toBeNull();
		if (!campaign) return;

		const mission = campaign.missionPreviews[0];
		const frame = deriveCampaignDialogueFrame({
			campaign,
			mission,
			targetLabel: '摩尔多瓦',
			selectedRegionLabel: null,
			hasResult: false,
			isCorrect: false
		});

		expect(frame.briefingLine).toContain('晨星号');
		expect(frame.actionLine).toContain('摩尔多瓦');
		expect(frame.actionLine).toContain('黑潮商会');
		expect(frame.footerLine).toContain('谎话');
	});
});
