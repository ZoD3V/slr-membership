import type { Column } from '@/components/data-table';
import type { AdminGiveawayTier } from '@/lib/api/resources/giveaways';
import { cn } from '@/lib/utils';

const TIER_STYLE: Record<AdminGiveawayTier, string> = {
    VISITOR: 'border-[#A0B4D259] text-slr-dim',
    RED: 'border-[#C8152E66] text-[#E88888]',
    BLUE: 'border-[#2878E84D] text-[#2878E8]'
};

export const winnersColumns: Column[] = [
    { key: 'winner', label: 'Winner', render: (row) => <span className='font-medium text-white'>{row.winner}</span> },
    { key: 'state', label: 'State' },
    { key: 'prize', label: 'Prize' },
    { key: 'giveaway', label: 'Giveaway' },
    {
        key: 'tier',
        label: 'Tier',
        render: (row) => (
            <span
                className={cn(
                    'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                    TIER_STYLE[String(row.tier).toUpperCase() as AdminGiveawayTier] ?? TIER_STYLE.VISITOR
                )}>
                {row.tier || '-'}
            </span>
        )
    },
    {
        key: 'opens',
        label: 'Opens At',
        render: (row) => <span className='text-slr-dim text-xs'>{row.opens || '-'}</span>
    },
    {
        key: 'closes',
        label: 'End At',
        render: (row) => <span className='text-slr-dim text-xs'>{row.closes || '-'}</span>
    },
    {
        key: 'draws',
        label: 'Draws At',
        render: (row) => <span className='text-slr-dim text-xs'>{row.draws || '-'}</span>
    },
    { key: 'recorded_at', label: 'Recorded' },
    { key: 'action', label: 'Action' }
];
