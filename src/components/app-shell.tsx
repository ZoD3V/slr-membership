'use client';

import * as React from 'react';

import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';

    sidebarDefaultOpen?: boolean;
}

export function AppShell({ children, variant = 'header', sidebarDefaultOpen = true }: AppShellProps) {
    if (variant === 'header') {
        return <div className='flex min-h-screen w-full flex-col'>{children}</div>;
    }

    return <SidebarProvider defaultOpen={sidebarDefaultOpen}>{children}</SidebarProvider>;
}
