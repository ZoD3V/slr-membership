import { SAFE_HOURS_MESSAGE } from '@/lib/safe-hours';
import { cn } from '@/lib/utils';

import { Clock } from 'lucide-react';

/** Shown next to a Join / Upgrade / Downgrade control that the Friday draw window has disabled. */
export function SafeHoursNotice({ className }: { className?: string }) {
    return (
        <div
            role='status'
            className={cn(
                'flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3',
                className
            )}>
            <Clock className='mt-0.5 size-4 shrink-0 text-amber-300' />
            <div>
                <p className='text-sm font-semibold text-amber-200'>Paused until 7:00 pm</p>
                <p className='text-slr-muted mt-0.5 text-xs leading-relaxed'>{SAFE_HOURS_MESSAGE}</p>
            </div>
        </div>
    );
}
