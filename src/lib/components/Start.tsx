'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Globe, Map as MapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { CountryDef } from '@/lib/data/countries';
import { FEATURED_COUNTRIES } from '@/lib/data/countries';
import { startViewTransition } from '../utils/dom';
import { Strictness, WorldStrictness } from '../utils/places';

// ─── types ────────────────────────────────────────────────────────────────────

type Step = 'mode' | 'country' | 'world-config';

// ─── precision options ────────────────────────────────────────────────────────

const COUNTRY_PRECISION = [
	{ value: Strictness.Low, label: 'Easy' },
	{ value: Strictness.Medium, label: 'Normal' },
	{ value: Strictness.High, label: 'Hard' }
];

const WORLD_PRECISION = [
	{ value: WorldStrictness.Low, label: 'Easy' },
	{ value: WorldStrictness.Medium, label: 'Normal' },
	{ value: WorldStrictness.High, label: 'Hard' }
];

// ─── motion variants ──────────────────────────────────────────────────────────

const panel = {
	initial: { opacity: 0, y: 16, scale: 0.98 },
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring' as const, stiffness: 360, damping: 32 }
	},
	exit: {
		opacity: 0,
		y: -10,
		scale: 0.98,
		transition: { duration: 0.14, ease: 'easeIn' as const }
	}
};

// ─── sub-components ───────────────────────────────────────────────────────────

/** iOS-style segmented precision control */
const PrecisionControl = ({
	options,
	value,
	onChange
}: {
	options: { value: number; label: string }[];
	value: number;
	onChange: (v: number) => void;
}) => (
	<div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5 gap-0.5">
		{options.map((opt) => {
			const active = value === opt.value;
			return (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={[
						'flex-1 py-2 text-sm font-semibold rounded-[9px] transition-all duration-150 cursor-pointer',
						active
							? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm'
							: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
					].join(' ')}
				>
					{opt.label}
				</button>
			);
		})}
	</div>
);

/** Category filter chip */
const CatChip = ({
	label,
	active,
	onToggle
}: {
	label: string;
	active: boolean;
	onToggle: () => void;
}) => (
	<button
		type="button"
		onClick={onToggle}
		className={[
			'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer select-none',
			active
				? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900 shadow-sm'
				: 'bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500 dark:hover:border-zinc-400'
		].join(' ')}
	>
		{label}
	</button>
);

/** Country selection card — click = auto-navigate to game */
const CountryCard = ({
	country,
	selected,
	onClick
}: {
	country: CountryDef;
	selected: boolean;
	onClick: () => void;
}) => (
	<motion.button
		type="button"
		onClick={onClick}
		whileTap={{ scale: 0.93 }}
		className={[
			'group relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl',
			'border-2 transition-colors duration-150 cursor-pointer outline-none',
			'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100',
			selected
				? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900/8 dark:bg-zinc-100/10'
				: 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500'
		].join(' ')}
	>
		{/* Flag */}
		<span className="text-3xl leading-none">{country.flag}</span>

		{/* Name */}
		<span
			className={[
				'text-[11px] font-medium text-center leading-tight line-clamp-2',
				selected
					? 'text-zinc-900 dark:text-zinc-100 font-semibold'
					: 'text-zinc-600 dark:text-zinc-400'
			].join(' ')}
		>
			{country.name}
		</span>

		{/* Check badge */}
		<AnimatePresence>
			{selected && (
				<motion.span
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 500, damping: 28 }}
					className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow"
				>
					<Check
						className="size-3 text-white dark:text-zinc-900"
						strokeWidth={3}
					/>
				</motion.span>
			)}
		</AnimatePresence>
	</motion.button>
);

// ─── main component ───────────────────────────────────────────────────────────

const Start = () => {
	const [step, setStep] = useState<Step>('mode');
	const [selectedCountry, setSelectedCountry] = useState<CountryDef | null>(
		null
	);
	const [precision, setPrecision] = useState<number>(Strictness.Medium);
	const [worldPrecision, setWorldPrecision] = useState<number>(
		WorldStrictness.Medium
	);
	const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());

	const router = useRouter();

	const worldCategories = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

	const urlCats = useMemo(() => {
		const arr = Array.from(selectedCats);
		return arr.length === 0 ? 'all' : encodeURIComponent(arr.join(','));
	}, [selectedCats]);

	const toggleCat = (cat: string) =>
		setSelectedCats((prev) => {
			const next = new Set(prev);
			next.has(cat) ? next.delete(cat) : next.add(cat);
			return next;
		});

	/** Navigate immediately to the country game */
	const goToCountry = (country: CountryDef) => {
		const url = `/game?mode=country&country=${country.code}&category=all&strictness=${Math.round(precision * country.strictnessMultiplier)}`;
		startViewTransition(() => router.push(url));
	};

	const goToWorld = () => {
		const url = `/game?mode=world&category=${urlCats}&strictness=${worldPrecision}`;
		startViewTransition(() => router.push(url));
	};

	return (
		<div className="w-full max-w-md px-4 z-10">
			<AnimatePresence mode="wait">
				{/* ── Step 1: Mode selection ──────────────────────────── */}
				{step === 'mode' && (
					<motion.div
						key="mode"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-black/8 border border-zinc-200/60 dark:border-zinc-800"
					>
						<p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-5">
							Select Mode
						</p>

						<div className="flex flex-col gap-3">
							{/* World Countries */}
							<button
								type="button"
								onClick={() => setStep('world-config')}
								className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] cursor-pointer text-left"
							>
								<span className="p-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 shrink-0">
									<Globe
										className="size-5 text-white dark:text-zinc-900"
										strokeWidth={1.8}
									/>
								</span>
								<span className="flex-1 min-w-0">
									<span className="block font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">
										World Countries
									</span>
									<span className="block text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
										Guess countries on a world map
									</span>
								</span>
								<ArrowLeft
									className="size-4 text-zinc-400 rotate-180 group-hover:translate-x-0.5 transition-transform shrink-0"
									strokeWidth={1.8}
								/>
							</button>

							{/* Explore Country */}
							<button
								type="button"
								onClick={() => setStep('country')}
								className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] cursor-pointer text-left"
							>
								<span className="p-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 shrink-0">
									<MapIcon
										className="size-5 text-white dark:text-zinc-900"
										strokeWidth={1.8}
									/>
								</span>
								<span className="flex-1 min-w-0">
									<span className="block font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">
										Explore a Country
									</span>
									<span className="block text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
										Pick a country and guess its regions
									</span>
								</span>
								<ArrowLeft
									className="size-4 text-zinc-400 rotate-180 group-hover:translate-x-0.5 transition-transform shrink-0"
									strokeWidth={1.8}
								/>
							</button>
						</div>
					</motion.div>
				)}

				{/* ── Step 2a: Country pick + immediate navigate ──────── */}
				{step === 'country' && (
					<motion.div
						key="country"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-black/8 border border-zinc-200/60 dark:border-zinc-800"
					>
						{/* Header */}
						<div className="flex items-center gap-3 mb-4">
							<button
								type="button"
								onClick={() => setStep('mode')}
								className="p-2 -ml-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
								aria-label="Back"
							>
								<ArrowLeft
									className="size-4 text-zinc-600 dark:text-zinc-400"
									strokeWidth={1.8}
								/>
							</button>
							<div className="flex-1 min-w-0">
								<p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">
									Choose a Country
								</p>
								<p className="text-xs text-zinc-400 mt-0.5">
									Tap any country to start instantly
								</p>
							</div>
						</div>

						{/* Precision */}
						<div className="mb-4">
							<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
								Precision
							</p>
							<PrecisionControl
								options={COUNTRY_PRECISION}
								value={precision}
								onChange={setPrecision}
							/>
						</div>

						{/* Country grid */}
						<div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-0.5">
							{FEATURED_COUNTRIES.map((country) => (
								<CountryCard
									key={country.code}
									country={country}
									selected={
										selectedCountry?.code === country.code
									}
									onClick={() => {
										setSelectedCountry(country);
										goToCountry(country);
									}}
								/>
							))}
						</div>

						<p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-3">
							{FEATURED_COUNTRIES.length} countries available
						</p>
					</motion.div>
				)}

				{/* ── Step 2b: World mode config ────────────────────────── */}
				{step === 'world-config' && (
					<motion.div
						key="world-config"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-black/8 border border-zinc-200/60 dark:border-zinc-800"
					>
						{/* Header */}
						<div className="flex items-center gap-3 mb-5">
							<button
								type="button"
								onClick={() => setStep('mode')}
								className="p-2 -ml-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
								aria-label="Back"
							>
								<ArrowLeft
									className="size-4 text-zinc-600 dark:text-zinc-400"
									strokeWidth={1.8}
								/>
							</button>
							<div className="flex-1">
								<p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">
									World Countries
								</p>
								<p className="text-xs text-zinc-400 mt-0.5">
									Configure your game
								</p>
							</div>
						</div>

						{/* Continent filter */}
						<div className="mb-5">
							<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
								Continents{' '}
								<span className="font-normal normal-case text-zinc-400">
									— none = all
								</span>
							</p>
							<div className="flex flex-wrap gap-1.5">
								{worldCategories.map((cat) => (
									<CatChip
										key={cat}
										label={cat}
										active={selectedCats.has(cat)}
										onToggle={() => toggleCat(cat)}
									/>
								))}
							</div>
						</div>

						{/* Precision */}
						<div className="mb-5">
							<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
								Precision
							</p>
							<PrecisionControl
								options={WORLD_PRECISION}
								value={worldPrecision}
								onChange={setWorldPrecision}
							/>
						</div>

						{/* Start button */}
						<button
							type="button"
							onClick={goToWorld}
							className="w-full py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-[15px] active:scale-[0.98] transition-transform cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200"
						>
							Start Game
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Start;
