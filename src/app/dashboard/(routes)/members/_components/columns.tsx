import { Column } from '@/components/data-table';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    suspended: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    deactivated: 'border-slate-500/40 bg-slate-500/10 text-slate-300'
};

const pill = 'inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold uppercase';

export const membersColumns: Column[] = [
    { 
        key: 'name', 
        label: 'Name',
        render: (row) => <span className='font-medium text-white whitespace-nowrap'>{row.name || '-'}</span>
    },
    { 
        key: 'email', 
        label: 'Email',
        render: (row) => <span className='text-slr-muted whitespace-nowrap'>{row.email || '-'}</span>
    },
    { 
        key: 'phone', 
        label: 'Phone',
        render: (row) => <span className='text-slr-muted whitespace-nowrap tabular-nums'>{row.phone || '-'}</span>
    },
    { 
        key: 'dob', 
        label: 'DOB',
        render: (row) => <span className='text-slr-dim whitespace-nowrap tabular-nums'>{row.dob || '-'}</span>
    },
    { 
        key: 'tier', 
        label: 'Tier',
        render: (row) => <span className='font-semibold text-white whitespace-nowrap'>{row.tier || '-'}</span>
    },
    { 
        key: 'state', 
        label: 'State',
        render: (row) => <span className='text-slr-dim whitespace-nowrap'>{row.state || '-'}</span>
    },
    { 
        key: 'status', 
        label: 'Status',
        render: (row) => (
            <span className={cn(pill, STATUS_STYLE[row.status] ?? 'border-slr-navy-border bg-slr-navy-card text-slr-dim')}>
                {row.status}
            </span>
        )
    },
    {
        key: 'billing_status',
        label: 'Billing',
        render: (row) => (
            <span className={cn(pill, row.billing_status === 'active' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-slate-500/40 bg-slate-500/10 text-slate-400')}>
                {row.billing_status || '-'}
            </span>
        )
    },
    { 
        key: 'draw_pass', 
        label: 'TPAL Entry',
        render: (row) => {
            const dp = typeof row.draw_pass === 'number' ? row.draw_pass : Number(row.draw_pass);
            // Nilai > 0 atau -1 (Visitor infinite pass) = Eligible/Active ikut TPAL export
            // Nilai 0 atau <= 0 (selain -1) = Excluded/Inactive
            const isEligible = dp > 0 || dp === -1;
            
            if (isNaN(dp) || row.draw_pass === '-' || row.draw_pass === null) {
                return <span className='text-slr-dim whitespace-nowrap'>-</span>;
            }

            return isEligible ? (
                <span className={cn(pill, 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400')}>
                    Eligible
                </span>
            ) : (
                <span className={cn(pill, 'border-rose-500/40 bg-rose-500/10 text-rose-400')}>
                    Excluded
                </span>
            );
        }
    },
    { 
        key: 'registered_at', 
        label: 'Registered',
        render: (row) => <span className='text-slr-dim whitespace-nowrap tabular-nums'>{row.registered_at || '-'}</span>
    },
    { key: 'action', label: 'Action' }
];
