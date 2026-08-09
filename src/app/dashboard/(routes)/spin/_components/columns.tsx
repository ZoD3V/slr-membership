import type { Column } from '@/components/data-table';
import { SUB_TIERS } from '@/constant/tiers';
import { cn } from '@/lib/utils';
import type { SubTierCode } from '@/types/member';

const RESULT_STYLE: Record<'win' | 'lose', string> = {
    win: 'border-emerald-500/40 text-emerald-400',
    lose: 'border-white/10 text-slr-dim'
};

export const spinHistoryColumns: Column[] = [
    {
        key: 'member_name',
        label: 'Member',
        render: (row) => <span className='font-medium text-white'>{row.member_name}</span>
    },
    {
        key: 'tier',
        label: 'Tier',
        render: (row) => {
            const meta = SUB_TIERS[row.tier as SubTierCode];

            return <span className='text-sm'>{meta ? `${meta.label} · ${meta.marketingName}` : row.tier}</span>;
        }
    },
    {
        key: 'moment',
        label: 'Moment',
        render: (row) => <span className='text-sm capitalize'>{row.moment}</span>
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
        key: 'spun_at',
        label: 'Date',
        render: (row) => <span className='text-slr-dim text-xs'>{new Date(row.spun_at).toLocaleString('en-AU')}</span>
    }
];
