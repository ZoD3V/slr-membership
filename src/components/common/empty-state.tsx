import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;

    action?: ReactNode;
    className?: string;
};

const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => (
    <div
        className={cn(
            'border-slr-navy-border bg-card-dark-navy mx-auto flex max-w-md flex-col items-center rounded-2xl border px-6 py-12 text-center',
            className
        )}>
        {Icon && (
            <div className='bg-gold-tint mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                <Icon className='text-slr-gold-label size-7' />
            </div>
        )}
        <h3 className='font-bebas-neue text-2xl tracking-wider text-white uppercase'>{title}</h3>
        {description && <p className='text-slr-muted mt-2 text-sm leading-relaxed'>{description}</p>}
        {action && <div className='mt-5'>{action}</div>}
    </div>
);

export default EmptyState;
