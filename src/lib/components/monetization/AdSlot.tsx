const AdSlot = ({
	slot,
	label = 'Sponsored',
	className = '',
	description = 'Reserved non-intrusive placement for future ads or house promos.'
}: {
	slot: string;
	label?: string;
	className?: string;
	description?: string;
}) => (
	<aside
		data-ad-slot={slot}
		className={`rounded-[28px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))] p-5 text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${className}`}
	>
		<div className="flex items-center justify-between gap-3">
			<span className="rounded-full border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
				{label}
			</span>
			<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
				{slot}
			</span>
		</div>
		<p className="mt-4 text-sm font-semibold text-slate-900">
			Monetization-ready placement
		</p>
		<p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
	</aside>
);

export default AdSlot;
