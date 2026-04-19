'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { maybeRefill, subscribeToCredits } from '@/lib/utils/credits';

const CreditBadge = () => {
	const [balance, setBalance] = useState<number | null>(null);

	useEffect(() => {
		setBalance(maybeRefill());

		return subscribeToCredits((nextBalance) => {
			setBalance(nextBalance);
		});
	}, []);

	if (balance === null) return null;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={balance}
				initial={{ scale: 1.3, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.8, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
			>
				<span aria-hidden="true">🪙</span>
				<span>{balance}</span>
			</motion.div>
		</AnimatePresence>
	);
};

export default CreditBadge;
