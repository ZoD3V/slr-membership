'use client';

import { useMemo, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NotificationLogMeta, NotificationLogRow } from '@/types/member';
import { KNOWN_NOTIFICATION_TYPES } from '@/types/member';

import { buildLogColumns } from './_components/log-columns';
import { Inbox, TriangleAlert } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' }
];

export function LogsClient({
    rows,
    meta,
    type,
    status,
    logsFailed
}: {
    rows: NotificationLogRow[];
    meta: NotificationLogMeta;
    type: string;
    status: string;
    logsFailed: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const pushParams = (next: { type?: string; status?: string; page?: number }) => {
        const nextType = next.type ?? type;
        const nextStatus = next.status ?? status;
        const nextPage = next.page ?? 1;

        const params = new URLSearchParams({ tab: 'logs' });
        if (nextType !== 'all') params.set('type', nextType);
        if (nextStatus !== 'all') params.set('status', nextStatus);
        if (nextPage > 1) params.set('page', String(nextPage));

        startTransition(() => {
            router.push(`/dashboard/notifications?${params.toString()}`);
        });
    };

    const columns = useMemo(
        () =>
            buildLogColumns((row) => {
                const params = new URLSearchParams({ tab: 'send', user_id: row.user_id });

                if (row.email) params.set('email', row.email);
                if (row.template_id) params.set('template_id', row.template_id);

                startTransition(() => {
                    router.push(`/dashboard/notifications?${params.toString()}`);
                });
            }),
        [router]
    );

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                <Select value={type} onValueChange={(value) => pushParams({ type: value })}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All types</SelectItem>
                        {KNOWN_NOTIFICATION_TYPES.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={(value) => pushParams({ status: value })}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All statuses</SelectItem>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='email'
                isSearch={false}
                columns={columns}
                data={rows}
                isLoading={isPending}
                serverSide
                alwaysShowPagination={!logsFailed}
                nowrap
                currentPage={meta.page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={(page) => pushParams({ page })}
                emptyMessage={
                    logsFailed ? (
                        <span className='flex flex-col items-center gap-1'>
                            <TriangleAlert className='mb-1 size-8 text-amber-400/70' />
                            <span className='text-foreground text-sm font-semibold'>
                                Couldn&apos;t load delivery logs
                            </span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                The request failed — this is not a claim that nothing has been sent. Try reloading the
                                page.
                            </span>
                        </span>
                    ) : (
                        <span className='flex flex-col items-center gap-1'>
                            <Inbox className='mb-1 size-8 opacity-40' />
                            <span className='text-foreground text-sm font-semibold'>No notifications sent</span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                Delivery history will appear here as the platform sends emails and SMS.
                            </span>
                        </span>
                    )
                }
            />
        </div>
    );
}
