import { NextResponse } from 'next/server';
import type { CampaignRemixApiResponse } from '@/lib/campaigns/remix';
import {
	type AppLocale,
	deriveCampaignRemixDraft,
	getCampaignBySlug
} from '@/lib/data/campaigns';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

const remixSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		title: { type: 'string' },
		summary: { type: 'string' },
		premise: { type: 'string' }
	},
	required: ['title', 'summary', 'premise']
} as const;

type RemixPayload = {
	title?: string;
	summary?: string;
	premise?: string;
};

const readResponseText = (payload: Record<string, unknown>) => {
	const output = Array.isArray(payload.output) ? payload.output : [];
	for (const item of output) {
		if (!item || typeof item !== 'object') continue;
		const content = Array.isArray((item as { content?: unknown }).content)
			? ((item as { content: unknown[] }).content ?? [])
			: [];
		for (const chunk of content) {
			if (!chunk || typeof chunk !== 'object') continue;
			const text = (chunk as { text?: unknown }).text;
			if (typeof text === 'string' && text.trim()) return text;
		}
	}
	return null;
};

const buildFallbackResponse = (
	fallbackDraft: ReturnType<typeof deriveCampaignRemixDraft>,
	model: string | null,
	warning: string
): CampaignRemixApiResponse => ({
	draft: {
		...fallbackDraft,
		source: 'fallback',
		model,
		warning
	}
});

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			campaignSlug?: string;
			locale?: string;
			prompt?: string;
		};
		const locale =
			body.locale === 'zh' || body.locale === 'ja' ? body.locale : 'en';
		const prompt = body.prompt?.trim() ?? '';
		const campaignSlug = body.campaignSlug?.trim() ?? '';

		if (!campaignSlug || !prompt) {
			return NextResponse.json(
				{ error: 'campaignSlug and prompt are required.' },
				{ status: 400 }
			);
		}

		const campaign = getCampaignBySlug(locale as AppLocale, campaignSlug);
		if (!campaign) {
			return NextResponse.json(
				{ error: 'Unknown campaign.' },
				{ status: 404 }
			);
		}

		const fallbackDraft = deriveCampaignRemixDraft(campaign, prompt);
		const apiKey = process.env.OPENAI_API_KEY?.trim() || null;
		const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

		if (!apiKey) {
			return NextResponse.json(
				buildFallbackResponse(
					fallbackDraft,
					null,
					'OPENAI_API_KEY is not configured, so this preview uses the local fallback draft.'
				)
			);
		}

		const sourceTopics = campaign.relatedQuizSlugs.join(', ');
		const localeInstruction =
			locale === 'zh'
				? 'Write all fields in Simplified Chinese.'
				: locale === 'ja'
					? 'Write all fields in Japanese.'
					: 'Write all fields in English.';

		const openAiResponse = await fetch(OPENAI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model,
				input: [
					{
						role: 'developer',
						content: [
							{
								type: 'input_text',
								text:
									'You generate short campaign remix copy for a map quiz product. Keep it concise, playful, student-safe, and grounded in the provided geography quiz topics. Do not invent new map facts, locations, or question pools. Keep every field compact and usable in a UI. ' +
									localeInstruction
							}
						]
					},
					{
						role: 'user',
						content: [
							{
								type: 'input_text',
								text: `Base campaign title: ${campaign.title}
Base campaign summary: ${campaign.summary}
Base campaign premise: ${campaign.premise}
Campaign template: ${campaign.templateLabel}
Related source topics: ${sourceTopics}
User remix prompt: ${prompt}

Rewrite the campaign into a lightweight remix preview. Keep the title under 70 characters, the summary under 180 characters, and the premise under 220 characters.`
							}
						]
					}
				],
				text: {
					format: {
						type: 'json_schema',
						name: 'campaign_remix_preview',
						strict: true,
						schema: remixSchema
					}
				}
			})
		});

		if (!openAiResponse.ok) {
			const message = await openAiResponse.text();
			return NextResponse.json(
				buildFallbackResponse(
					fallbackDraft,
					model,
					`OpenAI request failed, so this preview uses the local fallback draft. ${message.slice(0, 220)}`
				)
			);
		}

		const payload = (await openAiResponse.json()) as Record<
			string,
			unknown
		>;
		const responseText = readResponseText(payload);
		if (!responseText) {
			return NextResponse.json(
				buildFallbackResponse(
					fallbackDraft,
					model,
					'OpenAI returned no structured text, so this preview uses the local fallback draft.'
				)
			);
		}

		let parsed: RemixPayload;
		try {
			parsed = JSON.parse(responseText) as RemixPayload;
		} catch {
			return NextResponse.json(
				buildFallbackResponse(
					fallbackDraft,
					model,
					'OpenAI returned invalid structured JSON, so this preview uses the local fallback draft.'
				)
			);
		}

		const response: CampaignRemixApiResponse = {
			draft: {
				...fallbackDraft,
				title: parsed.title?.trim() || fallbackDraft.title,
				summary: parsed.summary?.trim() || fallbackDraft.summary,
				premise: parsed.premise?.trim() || fallbackDraft.premise,
				source: 'openai',
				model
			}
		};

		return NextResponse.json(response);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Unexpected remix error.';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
