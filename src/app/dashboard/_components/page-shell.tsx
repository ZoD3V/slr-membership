import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Single source of truth for the admin list-page wrapper. List pages run full
// width (no max-w cap) — the sidebar already constrains them, and admins work on
// wide screens. Form pages keep their own max-w-4xl for line-length readability.
// No overflow-x-auto here: ui/table already wraps the table in its own scroll
// container, and a scroller on this flex-col parent clips instead of scrolling.
export function DashboardPageShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex h-full w-full flex-1 flex-col gap-4 px-4 py-6 md:px-6', className)}>{children}</div>
    );
}
