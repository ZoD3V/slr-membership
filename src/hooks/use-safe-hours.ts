'use client';

import { useEffect, useState } from 'react';

import { isSafeHoursLocked } from '@/lib/safe-hours';

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
