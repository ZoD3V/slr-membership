import { cn } from '@/lib/utils';
import type { GiveawayDrawType } from '@/types/member';

import { CalendarDays } from 'lucide-react';

export function DrawTypeBadge({ type, className }: { type: GiveawayDrawType; className?: string }) {
    if (!type) return null;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white/70 uppercase',
                className
            )}>
            <CalendarDays className='size-3' />
            {type}
        </span>
    );
}
