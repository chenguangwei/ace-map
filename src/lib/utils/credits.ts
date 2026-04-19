const STORAGE_KEY = 'ace-map-credits';
const DAILY_FREE_CREDITS = 5;
const INITIAL_CREDITS = 10;
const MAX_CREDITS = 30;
const CREDIT_EVENT = 'ace-map-credits-changed';

interface CreditState {
	balance: number;
	lastRefillAt: string;
}

const getTodayKey = (): string => {
	const date = new Date(Date.now() + 8 * 60 * 60 * 1000);
	return date.toISOString().slice(0, 10);
};

const getDefaultState = (): CreditState => ({
	balance: INITIAL_CREDITS,
	lastRefillAt: getTodayKey()
});

const emitBalance = (balance: number): void => {
	if (typeof window === 'undefined') return;

	window.dispatchEvent(
		new CustomEvent<number>(CREDIT_EVENT, {
			detail: balance
		})
	);
};

const loadRawState = (): CreditState => {
	if (typeof window === 'undefined') return getDefaultState();

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return getDefaultState();

		const parsed = JSON.parse(raw) as Partial<CreditState>;
		if (
			typeof parsed.balance !== 'number' ||
			typeof parsed.lastRefillAt !== 'string'
		) {
			return getDefaultState();
		}

		return {
			balance: parsed.balance,
			lastRefillAt: parsed.lastRefillAt
		};
	} catch {
		return getDefaultState();
	}
};

const writeState = (state: CreditState): void => {
	if (typeof window === 'undefined') return;

	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const ensureCurrentState = (): CreditState => {
	const state = loadRawState();
	const today = getTodayKey();

	if (state.lastRefillAt === today) {
		return state;
	}

	const nextState: CreditState = {
		balance: Math.min(state.balance + DAILY_FREE_CREDITS, MAX_CREDITS),
		lastRefillAt: today
	};
	writeState(nextState);
	return nextState;
};

export const maybeRefill = (): number => {
	const raw = loadRawState();
	const state = ensureCurrentState();
	if (state.balance !== raw.balance) emitBalance(state.balance);
	return state.balance;
};

export const getBalance = (): number => ensureCurrentState().balance;

export const deductCredit = (): boolean => {
	const state = ensureCurrentState();

	if (state.balance <= 0) return false;

	const nextState: CreditState = {
		...state,
		balance: state.balance - 1
	};
	writeState(nextState);
	emitBalance(nextState.balance);
	return true;
};

export const subscribeToCredits = (
	listener: (balance: number) => void
): (() => void) => {
	if (typeof window === 'undefined') return () => {};

	const handler = (event: Event) => {
		listener((event as CustomEvent<number>).detail);
	};

	window.addEventListener(CREDIT_EVENT, handler);
	return () => window.removeEventListener(CREDIT_EVENT, handler);
};
