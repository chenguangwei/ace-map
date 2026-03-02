'use client';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/react';
import { Select, SelectItem } from '@heroui/select';
// @ts-expect-error - i dont wana install types for this
import confetti from 'canvas-confetti';
import { ChartBarStacked, Clock, Flame, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { decodeResult } from '../utils/game';
import { categories, numToStrictness, Strictness } from '../utils/places';

const count = 200;
const defaults = {
	origin: { y: -0.7 },
	angle: 270
};

const gradients = {
	0: 'from-rose-400/80 to-red-600/80 dark:from-rose-600/80 dark:to-red-800/80',
	50: 'from-yellow-400/80 to-yellow-600/80 dark:from-yellow-600/80 dark:to-yellow-800/80',
	75: 'from-emerald-400/80 to-emerald-600/80 dark:from-emerald-600/80 dark:to-emerald-800/80'
};
const txtColors = {
	0: 'text-rose-800 dark:text-rose-100',
	50: 'text-yellow-800 dark:text-yellow-100',
	75: 'text-emerald-800 dark:text-emerald-100'
};
const shadows = {
	0: 'sm:shadow-rose-500/50',
	50: 'sm:shadow-yellow-500/50',
	75: 'sm:shadow-emerald-500/50'
};
const messages = {
	0: {
		title: 'You can do better!',
		message: 'You can do better! Try again.'
	},
	50: {
		title: 'Good job!',
		message: 'Good job! You are getting there.'
	},
	75: {
		title: 'Great job!',
		message: 'Great job! You are doing amazing.'
	}
};

const fire = (particleRatio: number, opts: Record<string, any>) => {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio)
	});
};

const Result = (props: { code: string }) => {
	const router = useRouter();
	const result = useMemo(() => decodeResult(props.code), [props.code]);

	useEffect(() => {
		fire(0.4, {
			spread: 26,
			startVelocity: 55
		});
		fire(0.2, {
			spread: 60
		});
		fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8
		});
		fire(0.5, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2
		});
		fire(0.5, {
			spread: 120,
			startVelocity: 45
		});
	}, []);

	const accuracy = useMemo(() => {
		if (result.total === 0) return 0;
		return Math.round((result.score / result.total) * 100);
	}, [result]);

	const gradient = useMemo(() => {
		if (accuracy >= 75) return gradients[75];
		if (accuracy >= 50) return gradients[50];
		return gradients[0];
	}, [accuracy]);

	const textColor = useMemo(() => {
		if (accuracy >= 75) return txtColors[75];
		if (accuracy >= 50) return txtColors[50];
		return txtColors[0];
	}, [accuracy]);

	const shadow = useMemo(() => {
		if (accuracy >= 75) return shadows[75];
		if (accuracy >= 50) return shadows[50];
		return shadows[0];
	}, [accuracy]);

	const messageData = useMemo(() => {
		if (accuracy >= 75) return messages[75];
		if (accuracy >= 50) return messages[50];
		return messages[0];
	}, [accuracy]);

	const formattedTime = useMemo(() => {
		const minutes = result.time > 60 ? Math.floor(result.time / 60) : 0;
		const seconds = minutes > 0 ? result.time - minutes * 60 : result.time;

		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}, [result.time]);

	const strictness = useMemo(() => {
		const st = numToStrictness(result.strictness);

		switch (st) {
			case Strictness.Low:
				return 'Low';
			case Strictness.Medium:
				return 'Medium';
			case Strictness.High:
				return 'High';
			default:
				return 'Unknown';
		}
	}, [result]);

	return (
		<div
			className={`max-w-2xl sm:shadow-2xl sm:mx-4 sm:grid sm:grid-cols-2 sm:rounded-3xl ${shadow}`}
		>
			<div
				className={`grid content-start items-center justify-center text-center gap-4 result py-6 px-12 bg-linear-to-b  rounded-b-3xl sm:rounded-3xl ${gradient} ${textColor}`}
			>
				<h1 className="text-xl">Your Result</h1>

				<p
					className={`w-32 mx-auto aspect-square bg-linear-to-b rounded-full grid place-content-center ${gradient}`}
				>
					<span className="text-4xl font-bold">{accuracy}%</span>
				</p>

				<h2 className="text-2xl font-semibold">{messageData.title}</h2>

				<p>{messageData.message}</p>
			</div>

			<div className="p-6 grid content-start gap-6 bg-zinc-50/80 dark:bg-zinc-950/80">
				<h1 className="text-xl font-bold">Summary</h1>

				<div className="grid gap-4">
					<div>
						<div className="rounded-lg p-2 flex justify-between gap-4">
							<div className="flex gap-2 items-center">
								<Target className="size-6" />
								<p>Accuracy</p>
							</div>
							<p className="font-bold">{accuracy}%</p>
						</div>
					</div>

					<div>
						<div className="rounded-lg p-2 flex justify-between gap-4">
							<div className="flex gap-2 items-center">
								<Clock className="size-6" />
								<p>Time</p>
							</div>
							<Chip>{formattedTime}</Chip>
						</div>
					</div>

					<div>
						<div className="rounded-lg p-2 flex justify-between gap-4">
							<div className="flex gap-2 items-center">
								<Flame className="size-6" />
								<p>Strictness</p>
							</div>
							<p className="font-bold">{strictness}</p>
						</div>
					</div>

					<div>
						<div className="rounded-lg p-2 flex justify-between gap-4">
							<div className="flex gap-2 items-center">
								<ChartBarStacked className="size-6" />
								<p>Category</p>
							</div>
							<Select
								label="Categories"
								selectedKeys={
									result.category === 'all'
										? ['all']
										: result.category
								}
								className="w-full"
							>
								{['All', ...categories].map((cat) => (
									<SelectItem key={cat}>{cat}</SelectItem>
								))}
							</Select>
						</div>
					</div>
				</div>

				<Button
					radius="full"
					type="button"
					color="success"
					onPress={() => router.push('/')}
				>
					Play Again
				</Button>
			</div>
		</div>
	);
};

export default Result;
