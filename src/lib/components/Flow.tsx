import { type ReactNode, useMemo } from 'react';

interface ShowProps {
    children: ReactNode;
    condition?: boolean;
}

/**
 * Show component conditionally renders children based on the condition prop.
 */
export const Show = (props: ShowProps) => {
    const contents = useMemo(() => {
        if (props.condition) {
            return props.children;
        }
        return null;
    }, [props.condition, props.children]);

    return contents;
};
