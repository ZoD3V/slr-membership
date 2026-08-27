import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function DashboardPageShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex h-full w-full flex-1 flex-col gap-4 px-4 py-6 md:px-6', className)}>{children}</div>
    );
}
