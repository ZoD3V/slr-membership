'use client';

import { useEffect } from 'react';

export function DashboardThemeClass() {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('dashboard-theme', 'dark');

        return () => root.classList.remove('dashboard-theme', 'dark');
    }, []);

    return null;
}
