'use client';

import type { MouseEvent } from 'react';

import { usePathname } from 'next/navigation';

import { useLenis } from 'lenis/react';

/** Clears the fixed navbar so the target heading is not hidden under it. */
const HEADER_OFFSET = -80;

const EXTERNAL = /^(https?:|mailto:|tel:)/;

/**
 * Smooth-scrolls same-page "#section" links.
 *
 * The router treats a click on an already-active hash as a no-op, so a hash link only
 * ever works once — scroll away, click again, nothing happens. Handling the scroll here
 * makes every click behave the same. Lenis owns scrolling on the public pages, so defer
 * to it when it is mounted and fall back to the native API everywhere else.
 */
export function useAnchorScroll() {
    const pathname = usePathname();
    const lenis = useLenis();

    return (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (EXTERNAL.test(href)) return;

        const [path, hash] = href.split('#');
        if (!hash) return;

        const samePage = !path || path === pathname || (path === '/' && pathname === '/');
        if (!samePage) return;

        const target = document.getElementById(hash);
        if (!target) return;

        event.preventDefault();

        if (lenis) {
            lenis.scrollTo(target, { offset: HEADER_OFFSET, duration: 1.2 });
        } else {
            target.scrollIntoView({ behavior: 'smooth' });
        }

        // Keep the URL shareable without letting the router re-run its own scroll.
        window.history.replaceState(null, '', `#${hash}`);
    };
}
