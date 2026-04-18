'use client';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import type { PropsWithChildren } from 'react';
import AnalyticsProvider from '@/lib/components/AnalyticsProvider';
import { ThemeProvider } from '@/lib/hooks/useTheme';

const Providers = (props: PropsWithChildren) => {
	return (
		<ThemeProvider>
			<AnalyticsProvider>
				<HeroUIProvider>
					<ToastProvider />
					{props.children}
				</HeroUIProvider>
			</AnalyticsProvider>
		</ThemeProvider>
	);
};

export default Providers;
