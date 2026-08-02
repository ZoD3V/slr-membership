import { Column } from '@/components/data-table';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    suspended: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    deactivated: 'border-slate-500/40 bg-slate-500/10 text-slate-300'
};

const pill = 'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase';

export const membersColumns: Column[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'tier', label: 'Tier' },
    { key: 'state', label: 'State' },
    { 
        key: 'status', 
        label: 'Status',
        render: (row) => (
            <span className={cn(pill, STATUS_STYLE[row.status] ?? 'border-slr-navy-border bg-slr-navy-card text-slr-dim')}>
                {row.status}
            </span>
        )
    },
    { key: 'registered_at', label: 'Registered' },
    { key: 'action', label: 'Action' }
];
