'use client';

import Link from 'next/link';

import type { Column } from '@/components/data-table';
import { CONSENT_LABELS, isKnownConsent } from '@/lib/api/resources/consents';
import { formatDateTime } from '@/lib/member';
import { cn } from '@/lib/utils';

const pill = 'inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold uppercase';

const AGREED_STYLE = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
const DECLINED_STYLE = 'border-slate-500/40 bg-slate-500/10 text-slate-300';

export const consentColumns: Column[] = [
    {
        key: 'member',
        label: 'Member',
        render: (row) => (
            <Link href={`/dashboard/members/${row.user_id}`} className='flex flex-col hover:underline'>
                <span className='font-medium text-white'>{row.full_name || '-'}</span>
                <span className='text-slr-muted text-xs'>{row.email || row.user_id}</span>
            </Link>
        )
    },
    {
        key: 'consent_type',
        label: 'Type',
        render: (row) =>
            isKnownConsent(row.consent_type) ? (
                <span className='whitespace-nowrap text-white'>{CONSENT_LABELS[row.consent_type]}</span>
            ) : (
                // Unknown types are stored verbatim by the API — show the raw value rather than hide it.
                <span className='text-slr-dim font-mono text-xs'>{row.consent_type}</span>
            )
    },
    {
        key: 'agreed',
        label: 'Status',
        render: (row) => (
            <span className={cn(pill, row.agreed ? AGREED_STYLE : DECLINED_STYLE)}>
                {row.agreed ? 'Agreed' : 'Declined'}
            </span>
        )
    },
    {
        key: 'version',
        label: 'Version',
        render: (row) => <span className='text-slr-dim tabular-nums'>{row.version || '-'}</span>
    },
    {
        key: 'updated_at',
        label: 'Updated',
        render: (row) => (
            <span className='text-slr-muted whitespace-nowrap tabular-nums'>{formatDateTime(row.updated_at)}</span>
        )
    },
    {
        key: 'ip_address',
        label: 'IP',
        render: (row) => <span className='text-slr-dim font-mono text-xs tabular-nums'>{row.ip_address || '-'}</span>
    }
];
