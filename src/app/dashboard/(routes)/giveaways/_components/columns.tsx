import type { Column } from '@/components/data-table';
import type { AdminGiveawayTier } from '@/lib/api/resources/giveaways';
import { cn } from '@/lib/utils';

// Same tier accents as the TPAL export and winners tables. Keys are UPPERCASE
// here — the admin endpoints return 'RED', not 'red'.
const TIER_STYLE: Record<AdminGiveawayTier, string> = {
    VISITOR: 'border-[#A0B4D259] text-slr-dim',
    RED: 'border-[#C8152E66] text-[#E88888]',
    BLUE: 'border-[#2878E84D] text-[#2878E8]'
};

const STATUS_STYLE: Record<string, string> = {
    OPEN: 'border-emerald-500/40 text-emerald-400',
    CLOSED: 'border-amber-500/40 text-amber-400',
    DRAWN: 'border-slate-500/40 text-slate-300'
};

const pill = 'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase';

export const giveawaysColumns: Column[] = [
    { key: 'name', label: 'Name', render: (row) => <span className='font-medium text-white'>{row.name}</span> },
    {
        key: 'tier',
        label: 'Tier',
        render: (row) => (
            <span className={cn(pill, TIER_STYLE[row.tier as AdminGiveawayTier] ?? TIER_STYLE.VISITOR)}>
                {row.tier || '-'}
            </span>
        )
    },
    {
        key: 'type',
        label: 'Type',
        render: (row) => <span className='capitalize'>{String(row.type).toLowerCase()}</span>
    },
    {
        key: 'status',
        label: 'Status',
        render: (row) => (
            <span className={cn(pill, STATUS_STYLE[row.status] ?? 'border-slr-navy-border text-slr-dim')}>
                {row.status}
            </span>
        )
    },
    { key: 'prize', label: 'Prize' },
    { key: 'opens', label: 'Start', render: (row) => <span className='text-slr-dim text-xs'>{row.opens || '-'}</span> },
    { key: 'closes', label: 'End', render: (row) => <span className='text-slr-dim text-xs'>{row.closes || '-'}</span> },
    { key: 'draws', label: 'Draw', render: (row) => <span className='text-slr-dim text-xs'>{row.draws || '-'}</span> },
    { key: 'entries', label: 'Entries', render: (row) => <span className='tabular-nums'>{row.entries ?? 0}</span> },
    { key: 'winners', label: 'Winners', render: (row) => <span className='tabular-nums'>{row.winners ?? 0}</span> },
    { key: 'action', label: 'Action' }
];
