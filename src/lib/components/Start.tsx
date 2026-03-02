'use client';
import { Radio, RadioGroup } from '@heroui/radio';
import { Button } from '@heroui/react';
import { Select, SelectItem } from '@heroui/select';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { startViewTransition } from '../utils/dom';
import { categories, Strictness } from '../utils/places';

const Start = () => {
	const [value, setValue] = useState<Set<string>>(new Set([]));
	const [strictness, setStrictness] = useState<Strictness>(Strictness.Medium);

	const urlFriendlyCategories = useMemo(() => {
		const v = Array.from(value);
		const stringified = v.length === 0 ? 'all' : v.join(',');
		return encodeURIComponent(stringified);
	}, [value]);

	const router = useRouter();

	return (
		<div className="flex flex-col gap-6 justify-center max-w-sm bg-zinc-50/80 dark:bg-zinc-950/80 rounded-2xl p-6 z-10">
			<div className="flex flex-col items-center justify-center gap-2">
				<Select
					label="Categories"
					placeholder="Select the categories"
					selectedKeys={value}
					variant="bordered"
					// @ts-expect-error
					onSelectionChange={setValue}
					selectionMode="multiple"
					className="max-w-xs"
				>
					{categories.map((category) => (
						<SelectItem key={category}>{category}</SelectItem>
					))}
				</Select>
				<h3 className="text-default-500 text-small text-center">
					If none is selected, `all` will be passed as category
				</h3>
			</div>

			<RadioGroup
				label="Select strictness"
				orientation="horizontal"
				defaultValue="medium"
				onValueChange={(v) => {
					switch (v) {
						case 'low':
							setStrictness(Strictness.Low);
							break;
						case 'medium':
							setStrictness(Strictness.Medium);
							break;
						case 'high':
							setStrictness(Strictness.High);
							break;
					}
				}}
			>
				<Radio value="low">Low</Radio>
				<Radio value="medium">Medium</Radio>
				<Radio value="high">High</Radio>
			</RadioGroup>
			<Button
				onPress={() => {
					startViewTransition(() => {
						router.push(
							`/game?category=${urlFriendlyCategories}&strictness=${strictness}`
						);
					});
				}}
				fullWidth
			>
				Start
			</Button>
		</div>
	);
};

export default Start;
