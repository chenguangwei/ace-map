import { addToast } from '@heroui/toast';
import {
	type RefObject,
	useCallback,
	useMemo,
	useReducer,
	useRef
} from 'react';
import {
	getPlace,
	isNearlyCorrect,
	type Place,
	type PlaceWithoutName,
	Strictness
} from './places';

type GameStatus = 'idle' | 'running' | 'paused';

export type Marker = Omit<Place, 'name'>;
export type SubmitInfo = {
	toMark: Place & {
		isMarked?: boolean;
	};
	updateGame: () => void;
} | null;

export interface GameState {
	status: GameStatus;
	timer: RefObject<number>;
	score: {
		total: number;
		current: number;
	};
	category: 'all' | string[];
	strictness: Strictness;
	currentMarker: PlaceWithoutName | 'submitted' | 'none';
	toMark: Place | null;
	setCategory: (category: 'all' | string[]) => void;
	setStrictness: (strictness: Strictness) => void;
	setCurrentMarker: (marker: PlaceWithoutName | 'submitted' | 'none') => void;
	submitMarker: () => SubmitInfo;
	resetAndStart: () => void;
	next: (info: SubmitInfo) => void;
	start: () => void;
	pause: () => void;
	resume: () => void;
	reset: () => void;
}

interface Result {
	score: number;
	total: number;
	time: number;
	category: 'all' | string[];
	strictness: number;
}

export const encodeResult = (state: GameState) => {
	const data = {
		score: state.score.current,
		total: state.score.total,
		time: state.timer.current ?? 0,
		category: state.category,
		strictness: state.strictness
	};

	return encodeURIComponent(btoa(JSON.stringify(data)));
};

export const decodeResult = (data: string): Result =>
	JSON.parse(atob(decodeURIComponent(data))) as Result;

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
	score: {
		total: number;
		current: number;
	};
	category: 'all' | string[];
	strictness: Strictness;
	currentMarker: PlaceWithoutName | 'submitted' | 'none';
	toMarkPlaces: MarkedPlace[];
}

type Action =
	| { type: 'SET_CATEGORY'; payload: 'all' | string[] }
	| { type: 'SET_STRICTNESS'; payload: Strictness }
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

const initialState: State = {
	status: 'idle',
	score: { total: 0, current: 0 },
	category: 'all',
	strictness: Strictness.Medium,
	currentMarker: 'none',
	toMarkPlaces: []
};

const gameReducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'SET_CATEGORY':
			return { ...state, category: action.payload };
		case 'SET_STRICTNESS':
			return { ...state, strictness: action.payload };
		case 'SET_CURRENT_MARKER':
			return { ...state, currentMarker: action.payload };
		case 'SET_STATUS':
			return { ...state, status: action.payload };
		case 'START_GAME':
			return {
				...state,
				status: 'running',
				score: { total: 0, current: 0 },
				toMarkPlaces: shufflePlaces(action.payload),
				currentMarker: 'none'
			};
		case 'SUBMIT_MARKER':
			return {
				...state,
				status: 'paused',
				currentMarker: 'submitted',
				score: {
					total: state.score.total + 1,
					current: action.payload.isCorrect
						? state.score.current + 1
						: state.score.current
				}
			};
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
			return {
				...state,
				status: 'running',
				currentMarker: 'none'
			};
		case 'RESET':
			return {
				...initialState,
				category: state.category,
				strictness: state.strictness
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
		() => getPlace(state.category),
		[state.category]
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

	const setCategory = useCallback((category: 'all' | string[]) => {
		dispatch({ type: 'SET_CATEGORY', payload: category });
	}, []);

	const setStrictness = useCallback((strictness: Strictness) => {
		dispatch({ type: 'SET_STRICTNESS', payload: strictness });
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

		const isCorrect = isNearlyCorrect(
			state.currentMarker,
			toMark,
			state.strictness
		);

		if (!isCorrect) {
			addToast({
				color: 'danger',
				title: 'Incorrect!',
				description: `The correct location was ${toMark.name}.`
			});
		}

		dispatch({ type: 'SUBMIT_MARKER', payload: { isCorrect } });
		stopTimer();

		const markedPlace = { ...toMark };

		return {
			toMark: markedPlace,
			updateGame: () => {
				dispatch({ type: 'MARK_PLACE_COMPLETE', payload: markedPlace });
			}
		};
	}, [state.currentMarker, state.strictness, toMark, stopTimer]);

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
		timer: timerValue,
		score: state.score,
		category: state.category,
		strictness: state.strictness,
		currentMarker: state.currentMarker,
		toMark,
		setCategory,
		setStrictness,
		setCurrentMarker,
		submitMarker,
		resetAndStart,
		next,
		start,
		pause,
		resume,
		reset
	};
};
