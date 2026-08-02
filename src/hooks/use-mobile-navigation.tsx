import { useCallback } from 'react';

/**
 * Returns a callback that clears any leftover `pointer-events` lock on <body>,
 * so scrolling is restored after a mobile menu overlay is dismissed.
 */
export function useMobileNavigation() {
    return useCallback(() => {
        document.body.style.removeProperty('pointer-events');
    }, []);
}
