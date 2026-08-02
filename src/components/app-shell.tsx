'use client';

import * as React from 'react';

import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
    /** Initial open state for the sidebar variant. */
    sidebarDefaultOpen?: boolean;
}

export function AppShell({ children, variant = 'header', sidebarDefaultOpen = true }: AppShellProps) {
    if (variant === 'header') {
        return <div className='flex min-h-screen w-full flex-col'>{children}</div>;
    }

    // Sidebar variant: wrap children in the shadcn SidebarProvider.
    return <SidebarProvider defaultOpen={sidebarDefaultOpen}>{children}</SidebarProvider>;
}
