'use client';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/lib/hooks/useTheme';

const Providers = (props: PropsWithChildren) => {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <ToastProvider />
                {props.children}
            </HeroUIProvider>
        </ThemeProvider>
    );
};

export default Providers;
