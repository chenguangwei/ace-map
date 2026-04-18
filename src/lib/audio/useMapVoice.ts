'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type VoicePriority = 'prompt' | 'feedback' | 'hype';

const PRIORITY_WEIGHT: Record<VoicePriority, number> = {
	prompt: 1,
	feedback: 2,
	hype: 3
};

type SpeakOptions = {
	priority?: VoicePriority;
	rate?: number;
	pitch?: number;
	lang?: string;
	interrupt?: boolean;
};

export const useMapVoice = () => {
	const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const activePriorityRef = useRef<VoicePriority>('prompt');
	const [isSupported, setIsSupported] = useState(false);

	useEffect(() => {
		setIsSupported(
			typeof window !== 'undefined' &&
				'speechSynthesis' in window &&
				typeof window.SpeechSynthesisUtterance !== 'undefined'
		);

		return () => {
			if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	const stop = useCallback(() => {
		if (!isSupported) return;
		window.speechSynthesis.cancel();
		activeUtteranceRef.current = null;
		activePriorityRef.current = 'prompt';
	}, [isSupported]);

	const speak = useCallback(
		(text: string, options: SpeakOptions = {}) => {
			if (!isSupported) return false;

			const nextText = text.trim();
			if (!nextText) return false;

			const priority = options.priority ?? 'prompt';
			const shouldInterrupt = options.interrupt ?? true;
			const currentWeight = PRIORITY_WEIGHT[activePriorityRef.current];
			const nextWeight = PRIORITY_WEIGHT[priority];

			if (
				activeUtteranceRef.current &&
				!shouldInterrupt &&
				nextWeight < currentWeight
			) {
				return false;
			}

			window.speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(nextText);
			utterance.lang = options.lang ?? 'en-US';
			utterance.rate = options.rate ?? 1;
			utterance.pitch = options.pitch ?? 1;

			utterance.onend = () => {
				if (activeUtteranceRef.current === utterance) {
					activeUtteranceRef.current = null;
					activePriorityRef.current = 'prompt';
				}
			};

			activeUtteranceRef.current = utterance;
			activePriorityRef.current = priority;
			window.speechSynthesis.speak(utterance);
			return true;
		},
		[isSupported]
	);

	return {
		isSupported,
		speak,
		stop
	};
};
