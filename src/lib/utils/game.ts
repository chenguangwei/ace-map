import { addToast } from '@heroui/toast';
import {
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef
} from 'react';
import { resolveCountryPlaceSelection } from './countryRegions';
import {
	formatDistance,
	type GameMode,
	getPlace,
	haversineDistance,
	type Place,
	type PlaceItems,
	type PlaceWithoutName,
	Strictness,
	WorldStrictness
} from './places';
import { resolveWorldPlaceSelection } from './worldRegions';

type GameStatus = 'idle' | 'running' | 'paused';

export type Marker = Omit<Place, 'name'>;
export type SubmitInfo = {
	toMark: Place & { isMarked?: boolean };
	guess: PlaceWithoutName;
	distance: number;
	isCorrect: boolean;
	updateGame: () => void;
} | null;

export interface GameState {
	status: GameStatus;
	mode: GameMode;
	countryCode: string;
	timer: RefObject<number>;
	score: {
		total: number;
		current: number;
	};
	streak: number;
	bestStreak: number;
	category: 'all' | string[];
	strictness: number;
	currentMarker: PlaceWithoutName | 'submitted' | 'none';
	toMark: Place | null;
	setMode: (mode: GameMode) => void;
	setCountryCode: (code: string) => void;
	setCategory: (category: 'all' | string[]) => void;
	setStrictness: (strictness: number) => void;
	setCurrentMarker: (marker: PlaceWithoutName | 'submitted' | 'none') => void;
	setPlaceSource: (source: PlaceItems[]) => void;
	submitMarker: () => SubmitInfo;
	resetAndStart: () => void;
	next: (info: SubmitInfo) => void;
	start: () => void;
	pause: () => void;
	resume: () => void;
	reset: () => void;
}

export interface EncodedResult {
	score: number;
	total: number;
	time: number;
	category: 'all' | string[];
	strictness: number;
	mode: GameMode;
	countryCode: string;
	streak: number;
	bestStreak: number;
}

export const encodeResult = (state: GameState): string => {
	const data: EncodedResult = {
		score: state.score.current,
		total: state.score.total,
		time: state.timer.current ?? 0,
		category: state.category,
		strictness: state.strictness,
		mode: state.mode,
		countryCode: state.countryCode,
		streak: state.streak,
		bestStreak: state.bestStreak
	};
	return encodeURIComponent(btoa(JSON.stringify(data)));
};

export const decodeResult = (data: string): EncodedResult | null => {
	try {
		const parsed = JSON.parse(atob(decodeURIComponent(data)));
		return {
			mode: 'india',
			countryCode: 'in',
			streak: 0,
			bestStreak: 0,
			...parsed
		} as EncodedResult;
	} catch {
		return null;
	}
};

const shufflePlaces = (places: Place[]): Place[] => {
	const shuffled = [...places];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

type MarkedPlace = Place & { isMarked?: boolean };

interface State {
	status: GameStatus;
	mode: GameMode;
	countryCode: string;
	score: { total: number; current: number };
	streak: number;
	bestStreak: number;
	category: 'all' | string[];
	strictness: number;
	currentMarker: PlaceWithoutName | 'submitted' | 'none';
	toMarkPlaces: MarkedPlace[];
	placeSource: PlaceItems[];
}

type Action =
	| { type: 'SET_MODE'; payload: GameMode }
	| { type: 'SET_COUNTRY_CODE'; payload: string }
	| { type: 'SET_CATEGORY'; payload: 'all' | string[] }
	| { type: 'SET_STRICTNESS'; payload: number }
	| { type: 'SET_PLACE_SOURCE'; payload: PlaceItems[] }
	| {
			type: 'SET_CURRENT_MARKER';
			payload: PlaceWithoutName | 'submitted' | 'none';
	  }
	| { type: 'SET_STATUS'; payload: GameStatus }
	| { type: 'START_GAME'; payload: Place[] }
	| { type: 'SUBMIT_MARKER'; payload: { isCorrect: boolean } }
	| { type: 'MARK_PLACE_COMPLETE'; payload: Place }
	| { type: 'NEXT_PLACE' }
	| { type: 'RESET' };

const defaultStrictness = (mode: GameMode): number => {
	if (mode === 'world') return WorldStrictness.Medium;
	return Strictness.Medium;
};

const initialState: State = {
	status: 'idle',
	mode: 'india',
	countryCode: 'in',
	score: { total: 0, current: 0 },
	streak: 0,
	bestStreak: 0,
	category: 'all',
	strictness: Strictness.Medium,
	currentMarker: 'none',
	toMarkPlaces: [],
	placeSource: []
};

const gameReducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'SET_MODE':
			return {
				...state,
				mode: action.payload,
				strictness: defaultStrictness(action.payload)
			};
		case 'SET_COUNTRY_CODE':
			return { ...state, countryCode: action.payload };
		case 'SET_CATEGORY':
			return { ...state, category: action.payload };
		case 'SET_STRICTNESS':
			return { ...state, strictness: action.payload };
		case 'SET_PLACE_SOURCE':
			return { ...state, placeSource: action.payload };
		case 'SET_CURRENT_MARKER':
			return { ...state, currentMarker: action.payload };
		case 'SET_STATUS':
			return { ...state, status: action.payload };
		case 'START_GAME':
			return {
				...state,
				status: 'running',
				score: { total: 0, current: 0 },
				streak: 0,
				bestStreak: 0,
				toMarkPlaces: shufflePlaces(action.payload),
				currentMarker: 'none'
			};
		case 'SUBMIT_MARKER': {
			const newStreak = action.payload.isCorrect ? state.streak + 1 : 0;
			const newBestStreak = Math.max(state.bestStreak, newStreak);
			return {
				...state,
				status: 'paused',
				currentMarker: 'submitted',
				streak: newStreak,
				bestStreak: newBestStreak,
				score: {
					total: state.score.total + 1,
					current: action.payload.isCorrect
						? state.score.current + 1
						: state.score.current
				}
			};
		}
		case 'MARK_PLACE_COMPLETE':
			return {
				...state,
				toMarkPlaces: state.toMarkPlaces.map((p) =>
					p.name === action.payload.name &&
					p.latitude === action.payload.latitude &&
					p.longitude === action.payload.longitude
						? { ...p, isMarked: true }
						: p
				)
			};
		case 'NEXT_PLACE':
			return { ...state, status: 'running', currentMarker: 'none' };
		case 'RESET':
			return {
				...initialState,
				mode: state.mode,
				countryCode: state.countryCode,
				category: state.category,
				strictness: state.strictness,
				placeSource: state.placeSource
			};
		default:
			return state;
	}
};

export const useGame = (): GameState => {
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const timerValue = useRef<number>(0);

	const toMark = useMemo<MarkedPlace | null>(
		() => state.toMarkPlaces.find((p) => !p.isMarked) ?? null,
		[state.toMarkPlaces]
	);

	const availablePlaces = useMemo(
		() =>
			getPlace(
				state.category,
				state.placeSource.length > 0 ? state.placeSource : undefined
			),
		[state.category, state.placeSource]
	);

	const startTimer = useCallback(() => {
		if (timerRef.current) return;
		timerRef.current = setInterval(() => {
			timerValue.current += 1;
		}, 1000);
	}, []);

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const resetTimer = useCallback(() => {
		stopTimer();
		timerValue.current = 0;
	}, [stopTimer]);

	const start = useCallback(() => {
		resetTimer();
		dispatch({ type: 'START_GAME', payload: availablePlaces });
		startTimer();
	}, [availablePlaces, resetTimer, startTimer]);

	const pause = useCallback(() => {
		dispatch({ type: 'SET_STATUS', payload: 'paused' });
		stopTimer();
	}, [stopTimer]);

	const resume = useCallback(() => {
		dispatch({ type: 'SET_STATUS', payload: 'running' });
		startTimer();
	}, [startTimer]);

	const reset = useCallback(() => {
		dispatch({ type: 'RESET' });
		resetTimer();
	}, [resetTimer]);

	const resetAndStart = useCallback(() => {
		reset();
		setTimeout(start, 0);
	}, [reset, start]);

	const setMode = useCallback((mode: GameMode) => {
		dispatch({ type: 'SET_MODE', payload: mode });
	}, []);

	const setCountryCode = useCallback((code: string) => {
		dispatch({ type: 'SET_COUNTRY_CODE', payload: code });
	}, []);

	const setCategory = useCallback((category: 'all' | string[]) => {
		dispatch({ type: 'SET_CATEGORY', payload: category });
	}, []);

	const setStrictness = useCallback((strictness: number) => {
		dispatch({ type: 'SET_STRICTNESS', payload: strictness });
	}, []);

	const setPlaceSource = useCallback((source: PlaceItems[]) => {
		dispatch({ type: 'SET_PLACE_SOURCE', payload: source });
	}, []);

	const setCurrentMarker = useCallback(
		(marker: PlaceWithoutName | 'submitted' | 'none') => {
			dispatch({ type: 'SET_CURRENT_MARKER', payload: marker });
		},
		[]
	);

	const submitMarker = useCallback((): SubmitInfo => {
		if (
			state.currentMarker === 'none' ||
			state.currentMarker === 'submitted' ||
			!toMark
		) {
			return null;
		}

		const dist = haversineDistance(
			state.currentMarker as PlaceWithoutName,
			toMark
		);
		const guess = state.currentMarker as PlaceWithoutName;
		const expectedSelectionKey =
			state.mode === 'world'
				? (resolveWorldPlaceSelection(toMark)?.selectionKey ?? null)
				: state.mode === 'country'
					? (resolveCountryPlaceSelection(state.countryCode, toMark)
							?.selectionKey ?? null)
					: null;
		const hasCategoricalSelection =
			typeof guess.selectionKey === 'string' &&
			guess.selectionKey.length > 0 &&
			typeof expectedSelectionKey === 'string' &&
			expectedSelectionKey.length > 0;
		const isCorrect = hasCategoricalSelection
			? guess.selectionKey === expectedSelectionKey
			: dist <= state.strictness;

		dispatch({ type: 'SUBMIT_MARKER', payload: { isCorrect } });
		stopTimer();

		const markedPlace = { ...toMark };
		const distText = formatDistance(dist);

		if (!isCorrect) {
			addToast({
				color: 'danger',
				title: `Incorrect — ${distText} away`,
				description: `Correct location: ${toMark.name}`
			});
		} else {
			addToast({
				color: 'success',
				title: `Correct! 🎯`,
				description: `Only ${distText} off`
			});
		}

		return {
			toMark: markedPlace,
			guess,
			distance: dist,
			isCorrect,
			updateGame: () => {
				dispatch({ type: 'MARK_PLACE_COMPLETE', payload: markedPlace });
			}
		};
	}, [
		state.countryCode,
		state.currentMarker,
		state.mode,
		state.strictness,
		toMark,
		stopTimer
	]);

	useEffect(() => {
		return () => stopTimer();
	}, [stopTimer]);

	const next = useCallback(
		(info: SubmitInfo) => {
			if (!info) return;
			info.updateGame();
			dispatch({ type: 'NEXT_PLACE' });
			startTimer();
		},
		[startTimer]
	);

	return {
		status: state.status,
		mode: state.mode,
		countryCode: state.countryCode,
		timer: timerValue,
		score: state.score,
		streak: state.streak,
		bestStreak: state.bestStreak,
		category: state.category,
		strictness: state.strictness,
		currentMarker: state.currentMarker,
		toMark,
		setMode,
		setCountryCode,
		setCategory,
		setStrictness,
		setCurrentMarker,
		setPlaceSource,
		submitMarker,
		resetAndStart,
		next,
		start,
		pause,
		resume,
		reset
	};
};

export const getHeatLevel = (streak: number): 'cool' | 'warm' | 'heated' | 'overdrive' => {
	if (streak >= 7) return 'overdrive';
	if (streak >= 4) return 'heated';
	if (streak >= 2) return 'warm';
	return 'cool';
};
