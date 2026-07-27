'use client';

import { useEffect, useState } from 'react';

import { isSafeHoursLocked } from '@/lib/safe-hours';

/**
 * Whether the Friday draw lockout is currently open.
 *
 * Starts `false` so the server and the first client render agree, then corrects
 * on mount and re-checks every minute — a member sitting on the page when 16:00
 * arrives sees the button disable itself. Purely advisory: the request is still
 * refused server-side with `403 SAFE_HOURS_LOCKED`.
 */
export function useSafeHours(): boolean {
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const check = () => setLocked(isSafeHoursLocked());
        check();
        const id = setInterval(check, 60_000);

        return () => clearInterval(id);
    }, []);

    return locked;
}
