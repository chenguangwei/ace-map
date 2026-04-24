import type { CampaignRemixDraft } from '@/lib/data/campaigns';

export interface GeneratedCampaignRemixDraft extends CampaignRemixDraft {
	source: 'openai' | 'fallback';
	model: string | null;
	warning?: string | null;
}

export interface CampaignRemixApiResponse {
	draft: GeneratedCampaignRemixDraft;
}
