import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

type DashboardEmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

const DashboardEmptyState: FC<DashboardEmptyStateProps> = ({ icon: Icon, title, description, action, className }) => (
    <div
        className={cn(
            'border-border bg-card/40 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center',
            className
        )}>
        {Icon ? (
            <div className='bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full'>
                <Icon className='size-6' />
            </div>
        ) : null}
        <h3 className='text-foreground text-base font-semibold'>{title}</h3>
        {description ? (
            <p className='text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed'>{description}</p>
        ) : null}
        {action ? <div className='mt-5'>{action}</div> : null}
    </div>
);

export default DashboardEmptyState;
