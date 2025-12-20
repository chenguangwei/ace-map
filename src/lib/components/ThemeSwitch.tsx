'use client';
import { Switch } from '@heroui/switch';
import { motion } from 'framer-motion';
import { Moon as _Moon, SunMedium as _Sun } from 'lucide-react';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import { useTheme } from '@/lib/hooks/useTheme';

const ThemeSwitch = () => {
    const isMounted = useIsMounted();
    const { theme, setTheme } = useTheme();

    if (!isMounted) return null;

    const Moon = motion.create(_Moon);
    const Sun = motion.create(_Sun);

    return (
        <Switch
            aria-label="Toggle theme"
            defaultSelected={theme === 'dark'}
            color="secondary"
            startContent={
                <Sun
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                    fill="currentColor"
                />
            }
            endContent={
                <Moon
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                    fill="currentColor"
                />
            }
            size="lg"
            onValueChange={(v) => {
                setTheme(v ? 'dark' : 'light');
            }}
        />
    );
};

export default ThemeSwitch;
