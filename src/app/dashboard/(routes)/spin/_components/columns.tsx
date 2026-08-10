import type { Column } from '@/components/data-table';
import { cn } from '@/lib/utils';

const RESULT_STYLE: Record<'win' | 'lose', string> = {
    win: 'border-emerald-500/40 text-emerald-400',
    lose: 'border-white/10 text-slr-dim'
};

const MOMENT_LABEL: Record<string, string> = {
    registration: 'Registration',
    pre_renewal: 'Pre-renewal'
};

export const spinHistoryColumns: Column[] = [
    {
        key: 'user_name',
        label: 'Member',
        render: (row) => (
            <span className='flex flex-col'>
                <span className='font-medium text-white'>{row.user_name}</span>
                <span className='text-slr-dim text-xs'>{row.user_email}</span>
            </span>
        )
    },
    {
        key: 'tier',
        // Already a display string from the API (e.g. 'Red Plus') — no code
        // lookup needed, unlike the old guessed shape.
        label: 'Tier',
        render: (row) => <span className='text-sm'>{row.tier}</span>
    },
    {
        key: 'moment',
        label: 'Moment',
        render: (row) => <span className='text-sm'>{MOMENT_LABEL[row.moment] ?? row.moment}</span>
    },
    {
        key: 'result',
        label: 'Result',
        render: (row) => (
            <span
                className={cn(
                    'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                    RESULT_STYLE[row.result as 'win' | 'lose']
                )}>
                {row.result}
            </span>
        )
    },
    {
        key: 'discount_cents',
        label: 'Discount',
        render: (row) => (
            <span className='tabular-nums'>
                {row.result === 'win' ? `$${(row.discount_cents / 100).toFixed(2)}` : '—'}
            </span>
        )
    },
    {
        key: 'applied',
        label: 'Applied',
        render: (row) =>
            row.result === 'win' ? (
                <span
                    className={cn(
                        'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                        row.applied ? 'border-emerald-500/40 text-emerald-400' : 'text-slr-dim border-white/10'
                    )}>
                    {row.applied ? 'Yes' : 'No'}
                </span>
            ) : (
                <span className='text-slr-dim text-xs'>—</span>
            )
    },
    {
        key: 'expires_at',
        label: 'Expires',
        render: (row) => (
            <span className='text-slr-dim text-xs'>
                {row.expires_at ? new Date(row.expires_at).toLocaleDateString('en-AU') : '—'}
            </span>
        )
    },
    {
        key: 'created_at',
        label: 'Date',
        render: (row) => (
            <span className='text-slr-dim text-xs'>{new Date(row.created_at).toLocaleString('en-AU')}</span>
        )
    }
];
