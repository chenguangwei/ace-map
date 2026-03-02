'use client';
import { Spinner } from '@heroui/spinner';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { type SubmitInfo, useGame } from '@/lib/utils/game';
import { numToStrictness, Strictness } from '@/lib/utils/places';
import GameBar from './GameBar';

const Game = dynamic(() => import('@/lib/components/game/Game'), {
	ssr: false,
	loading: () => (
		<Spinner size="lg" color="secondary" aria-label="Map loading..." />
	)
});

export interface InfoState {
	info: SubmitInfo | null;
	setInfo: Dispatch<SetStateAction<SubmitInfo | null>>;
}

const Main = () => {
	const gameState = useGame();
	const [infoState, setInfoState] = useState<SubmitInfo | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		const category = searchParams.get('category');
		const strictness = searchParams.get('strictness');
		const arrayfied =
			category === 'all'
				? 'all'
				: Array.from(new Set(category?.split(',') ?? []));

		gameState.setCategory(arrayfied);
		gameState.setStrictness(
			numToStrictness(strictness ? Number(strictness) : Strictness.Medium)
		);
	}, [gameState.setCategory, searchParams.get, gameState.setStrictness]);

	return (
		<>
			<div className="grow flex justify-center items-center p-2 sm:p-4 lg:p-6 xl:p-8 overflow-hidden size-full">
				<Game
					gameState={gameState}
					info={infoState}
					setInfo={setInfoState}
				/>
			</div>
			<GameBar
				gameState={gameState}
				info={infoState}
				setInfo={setInfoState}
			/>
		</>
	);
};

export default Main;
