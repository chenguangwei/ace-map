import type { SiteFaqGroup } from '@/lib/data/content';

const SiteFaqGroupList = ({
	groups,
	previewCount
}: {
	groups: SiteFaqGroup[];
	previewCount?: number;
}) => (
	<div className="space-y-8">
		{groups.map((group) => (
			<section key={group.id}>
				<div className="max-w-3xl">
					<h3 className="text-2xl font-bold tracking-tight text-slate-950">
						{group.title}
					</h3>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						{group.description}
					</p>
				</div>
				<div className="mt-5 space-y-4">
					{group.items
						.slice(0, previewCount ?? group.items.length)
						.map((item) => (
							<details
								key={item.question}
								className="rounded-[24px] border border-slate-200 bg-white p-5"
							>
								<summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
									{item.question}
								</summary>
								<p className="mt-3 text-sm leading-6 text-slate-600">
									{item.answer}
								</p>
							</details>
						))}
				</div>
			</section>
		))}
	</div>
);

export default SiteFaqGroupList;
