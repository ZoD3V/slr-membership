'use client';

import { useEffect, useState } from 'react';

export interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    done: boolean;
    mounted: boolean;
}

function diff(target: number): Omit<Countdown, 'mounted'> {
    const total = Math.max(0, target - Date.now());

    return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60),
        total,
        done: total <= 0
    };
}

export function useCountdown(targetIso: string): Countdown {
    const target = new Date(targetIso).getTime();
    const [state, setState] = useState<Omit<Countdown, 'mounted'>>(() => diff(target));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setState(diff(target));
        const timer = setInterval(() => setState(diff(target)), 1000);

        return () => clearInterval(timer);
    }, [target]);

    return { ...state, mounted };
}
