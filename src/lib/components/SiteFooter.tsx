'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const SiteFooter = () => {
	const t = useTranslations('Footer');

	return (
		<footer className="border-t border-slate-200/80 bg-white/92">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="max-w-2xl">
						<Link
							href="/"
							className="text-xl font-semibold text-slate-950 transition hover:text-sky-700"
						>
							MapQuiz<span className="text-amber-500">.pro</span>
						</Link>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{t('description')}
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-2">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
								{t('exploreTitle')}
							</p>
							<div className="mt-4 flex flex-col gap-3 text-sm font-semibold text-slate-700">
								<Link href="/" className="transition hover:text-slate-950">
									{t('home')}
								</Link>
								<Link
									href="/quizzes"
									className="transition hover:text-slate-950"
								>
									{t('quizLibrary')}
								</Link>
								<Link
									href="/blog"
									className="transition hover:text-slate-950"
								>
									{t('blog')}
								</Link>
								<Link
									href="/faq"
									className="transition hover:text-slate-950"
								>
									{t('faq')}
								</Link>
							</div>
						</div>

						<div>
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
								{t('contentTitle')}
							</p>
							<p className="mt-4 text-sm leading-6 text-slate-600">
								{t('contentDescription')}
							</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<Link
									href="/blog"
									className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
								>
									{t('readGuides')}
								</Link>
								<Link
									href="/faq"
									className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
								>
									{t('openFaq')}
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-2 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
					<p>{t('copyright')}</p>
					<p>{t('tagline')}</p>
				</div>
			</div>
		</footer>
	);
};

export default SiteFooter;
