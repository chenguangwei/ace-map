'use client';

import { Button } from '@heroui/button';
import { Sparkles, WandSparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { CampaignRemixApiResponse } from '@/lib/campaigns/remix';
import { type Campaign, deriveCampaignRemixDraft } from '@/lib/data/campaigns';

const CampaignRemixStudio = ({
	campaign,
	labels,
	defaultPrompt
}: {
	campaign: Campaign;
	labels: {
		eyebrow: string;
		title: string;
		description: string;
		promptLabel: string;
		promptPlaceholder: string;
		quickIdeas: string;
		preview: string;
		generate: string;
		generating: string;
		playDraft: string;
		useIdea: string;
		fallbackNotice: string;
		liveNotice: string;
		requestFailed: string;
	};
	defaultPrompt?: string;
}) => {
	const locale = useLocale();
	const [prompt, setPrompt] = useState(
		defaultPrompt?.trim() || campaign.remixPromptExamples[0] || ''
	);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedDraft, setGeneratedDraft] = useState<
		CampaignRemixApiResponse['draft'] | null
	>(null);
	const [error, setError] = useState<string | null>(null);
	const draft = useMemo(
		() => deriveCampaignRemixDraft(campaign, prompt),
		[campaign, prompt]
	);
	const effectiveDraft = generatedDraft ?? draft;

	const handleGenerate = async () => {
		const trimmedPrompt = prompt.trim();
		if (!trimmedPrompt) return;

		setIsGenerating(true);
		setError(null);

		try {
			const response = await fetch('/api/campaign-remix', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					campaignSlug: campaign.slug,
					locale,
					prompt: trimmedPrompt
				})
			});

			if (!response.ok) {
				throw new Error(labels.requestFailed);
			}

			const payload = (await response.json()) as CampaignRemixApiResponse;
			setGeneratedDraft(payload.draft);
		} catch (requestError) {
			setGeneratedDraft({
				...draft,
				source: 'fallback',
				model: null,
				warning: labels.requestFailed
			});
			setError(
				requestError instanceof Error
					? requestError.message
					: labels.requestFailed
			);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<section className="rounded-[28px] border border-violet-200/80 bg-[linear-gradient(180deg,rgba(245,243,255,0.94),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_44px_rgba(109,40,217,0.08)]">
			<div className="flex items-center gap-3">
				<span className="rounded-2xl bg-violet-100 p-3 text-violet-700">
					<WandSparkles className="size-5" />
				</span>
				<div>
					<p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700">
						{labels.eyebrow}
					</p>
					<h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
						{labels.title}
					</h2>
				</div>
			</div>

			<p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
				{labels.description}
			</p>

			<label className="mt-5 block">
				<span className="text-sm font-semibold text-slate-800">
					{labels.promptLabel}
				</span>
				<textarea
					value={prompt}
					onChange={(event) => {
						setPrompt(event.target.value);
						setGeneratedDraft(null);
						setError(null);
					}}
					rows={3}
					placeholder={labels.promptPlaceholder}
					className="mt-2 w-full rounded-[22px] border border-violet-200 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.04)] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
				/>
			</label>

			<div className="mt-5">
				<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
					{labels.quickIdeas}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{campaign.remixPromptExamples.map((idea) => (
						<Button
							key={idea}
							radius="full"
							size="sm"
							variant="flat"
							onPress={() => {
								setPrompt(idea);
								setGeneratedDraft(null);
								setError(null);
							}}
							className="bg-white/88 text-slate-700"
						>
							{labels.useIdea}: {idea}
						</Button>
					))}
				</div>
			</div>

			<div className="mt-6 rounded-[24px] border border-violet-200/80 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
				<div className="flex items-center gap-2 text-violet-700">
					<Sparkles className="size-4" />
					<p className="text-sm font-bold uppercase tracking-[0.18em]">
						{labels.preview}
					</p>
				</div>
				<h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
					{effectiveDraft.title}
				</h3>
				<p className="mt-2 text-sm leading-6 text-slate-600">
					{effectiveDraft.summary}
				</p>
				<p className="mt-3 text-sm leading-6 text-slate-700">
					{effectiveDraft.premise}
				</p>
				<div className="mt-5 flex flex-wrap gap-3">
					<Button
						radius="full"
						color="secondary"
						onPress={handleGenerate}
						isDisabled={!prompt.trim() || isGenerating}
					>
						{isGenerating ? labels.generating : labels.generate}
					</Button>
					<Link
						href={effectiveDraft.playHref}
						className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						{labels.playDraft}
					</Link>
				</div>
				{generatedDraft?.source === 'fallback' && (
					<p className="mt-4 text-sm font-medium text-amber-700">
						{labels.fallbackNotice}
						{generatedDraft.warning
							? ` ${generatedDraft.warning}`
							: ''}
					</p>
				)}
				{generatedDraft?.source === 'openai' && (
					<p className="mt-4 text-sm font-medium text-emerald-700">
						{labels.liveNotice}
						{generatedDraft.model ? ` ${generatedDraft.model}` : ''}
					</p>
				)}
				{error && (
					<p className="mt-3 text-sm font-medium text-rose-700">
						{error}
					</p>
				)}
			</div>
		</section>
	);
};

export default CampaignRemixStudio;
