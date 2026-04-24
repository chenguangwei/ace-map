import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import CampaignCard from '@/lib/components/campaigns/CampaignCard';
import { type AppLocale, getCampaigns } from '@/lib/data/campaigns';
import { buildPageMetadata } from '@/lib/seo';

export const generateMetadata = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'CampaignsPage' });
	const title = `${t('headline')} | MapQuiz.pro`;
	const description = t('subheadline');

	return buildPageMetadata({
		locale,
		path: '/campaigns',
		title,
		description
	});
};

const CampaignsPage = async ({
	params
}: {
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({
		locale,
		namespace: 'CampaignsPage'
	});
	const campaigns = getCampaigns(locale as AppLocale);

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
			<section className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
				<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700">
					{t('badge')}
				</span>
				<h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
					{t('headline')}
				</h1>
				<p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
					{t('subheadline')}
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/game"
						className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
					>
						{t('openClassic')}
					</Link>
					<Link
						href="/quizzes"
						className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						{t('browseQuizLibrary')}
					</Link>
				</div>
			</section>

			<section className="mt-10">
				<div className="max-w-3xl">
					<h2 className="text-3xl font-bold tracking-tight text-slate-950">
						{t('featuredTitle')}
					</h2>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						{t('featuredDescription')}
					</p>
				</div>
				<div className="mt-6 grid gap-5 xl:grid-cols-3">
					{campaigns.map((campaign) => (
						<CampaignCard
							key={campaign.slug}
							campaign={campaign}
							labels={{
								viewCampaign: t('viewCampaign'),
								playFirstMission: t('playFirstMission'),
								minutesLabel: (minutes) =>
									t('minutesLabel', { count: minutes }),
								missionsLabel: (count) =>
									t('missionsLabel', { count }),
								remixLabel: t('remixExamples')
							}}
						/>
					))}
				</div>
			</section>
		</main>
	);
};

export default CampaignsPage;
