'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

const CURRENT = process.env.NEXT_PUBLIC_BUILD_ID;
const POLL_MS = 60_000;

export function VersionWatcher() {
    const stale = useRef(false);
    const pathname = usePathname();

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;

            return;
        }
        if (stale.current) window.location.reload();
    }, [pathname]);

    useEffect(() => {
        if (!CURRENT) return;

        const check = async () => {
            try {
                const res = await fetch('/api/version', { cache: 'no-store' });
                if (!res.ok) return;

                const { id } = (await res.json()) as { id?: string };
                if (!id || id === CURRENT) return;

                stale.current = true;

                if (document.visibilityState === 'hidden') window.location.reload();
            } catch {
                void 0;
            }
        };

        const onVisible = () => {
            if (document.visibilityState === 'visible') check();
        };

        const timer = setInterval(check, POLL_MS);
        document.addEventListener('visibilitychange', onVisible);
        check();

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    return null;
}
