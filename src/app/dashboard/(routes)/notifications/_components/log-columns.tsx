'use client';

import type { Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { NotificationLogRow } from '@/types/member';

import { Send } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    sent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    failed: 'border-red-500/40 bg-red-500/10 text-red-400',
    pending: 'border-amber-500/40 bg-amber-500/10 text-amber-400'
};

function formatSentAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || '—';

    // Pinned locale and time zone: without them the server renders in UTC and
    // the browser re-renders in the viewer's zone, which hydrates mismatched.
    // AEST is the platform's operating zone.
    return date.toLocaleString('en-AU', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Australia/Sydney'
    });
}

export function buildLogColumns(onResend: (row: NotificationLogRow) => void): Column[] {
    return [
        {
            key: 'email',
            label: 'Recipient',
            render: (row) => (
                <div className='flex flex-col'>
                    <span className='font-medium text-white'>{row.email || '—'}</span>
                    <span className='text-muted-foreground font-mono text-[11px]'>
                        {row.user_id ? `${row.user_id.slice(0, 8)}…` : '—'}
                    </span>
                </div>
            )
        },
        { key: 'type', label: 'Type' },
        { key: 'channel', label: 'Channel' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const badge = (
                    <span
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                            STATUS_STYLE[row.status] ?? 'border-slr-navy-border bg-slr-navy-card text-slr-dim'
                        )}>
                        {row.status || '—'}
                    </span>
                );

                // `error` is only ever populated on a failure. Production has
                // never produced a failed row, so this path is built from the
                // contract and is unverified against live data.
                if (!row.error) return badge;

                return (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>{badge}</span>
                        </TooltipTrigger>
                        <TooltipContent className='max-w-sm'>{row.error}</TooltipContent>
                    </Tooltip>
                );
            }
        },
        { key: 'provider', label: 'Provider' },
        { key: 'sent_at', label: 'Sent at', render: (row) => formatSentAt(row.sent_at) },
        {
            key: 'resend',
            label: '',
            render: (row) => (
                <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => onResend(row as NotificationLogRow)}
                    title={
                        row.template_id
                            ? 'Open the Send tab with this recipient and template filled in.'
                            : 'Open the Send tab with this recipient filled in — this row has no template recorded, so pick one.'
                    }>
                    <Send className='size-3.5' />
                    Resend
                </Button>
            )
        }
    ];
}
