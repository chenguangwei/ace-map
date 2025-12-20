import { createContext, type ReactNode, useCallback, useContext } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { startViewTransition } from '@/lib/utils/dom';

type Theme = 'light' | 'dark';
interface ThemeCtx {
    theme: Theme;
    setTheme: (value: Theme) => void;
}

export const themeContext = createContext<ThemeCtx | null>(null);

export const ThemeProvider = (props: { children: ReactNode }) => {
    const [theme, _setTheme] = useLocalStorage<Theme>('theme', 'dark');

    const setTheme = useCallback(
        (value: Theme) => {
            _setTheme(value);

            startViewTransition(() => {
                if (value === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.setProperty('color-scheme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.setProperty('color-scheme', 'light');
                }
            });
        },
        [_setTheme]
    );

    return (
        <themeContext.Provider value={{ theme, setTheme }}>{props.children}</themeContext.Provider>
    );
};
/**
 * Custom hook to get and set the theme
 */
export const useTheme = () => {
    const ctx = useContext(themeContext);

    if (ctx === null) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return ctx;
};
