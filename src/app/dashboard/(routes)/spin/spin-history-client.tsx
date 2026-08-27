'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUB_TIERS } from '@/constant/tiers';
import type { SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId, SubTierCode } from '@/types/member';

import { spinHistoryColumns } from './_components/columns';
import { History, TriangleAlert } from 'lucide-react';

const ALL_TIER_IDS: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];

const TIER_OPTIONS: { value: SpinTierId; label: string }[] = ALL_TIER_IDS.map((id) => {
    const meta = SUB_TIERS[id.toUpperCase() as SubTierCode];

    return { value: id, label: meta ? `${meta.label} · ${meta.marketingName}` : id };
});

const MOMENT_OPTIONS: { value: SpinMoment; label: string }[] = [
    { value: 'registration', label: 'Registration' },
    { value: 'pre_renewal', label: 'Pre-renewal' }
];

export function SpinHistoryClient({
    rows,
    meta,
    tier,
    moment,
    historyFailed
}: {
    rows: SpinHistoryRow[];
    meta: SpinHistoryMeta;
    tier: string;
    moment: string;
    historyFailed: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const pushParams = (next: { tier?: string; moment?: string; page?: number }) => {
        const nextTier = next.tier ?? tier;
        const nextMoment = next.moment ?? moment;
        const nextPage = next.page ?? 1;

        const params = new URLSearchParams();
        if (nextTier !== 'all') params.set('tier', nextTier);
        if (nextMoment !== 'all') params.set('moment', nextMoment);
        if (nextPage > 1) params.set('page', String(nextPage));

        const query = params.toString();

        startTransition(() => {
            router.push(`/dashboard/spin${query ? `?${query}` : ''}`);
        });
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                <Select value={tier} onValueChange={(value) => pushParams({ tier: value })}>
                    <SelectTrigger className='w-44'>
                        <SelectValue placeholder='Tier' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All tiers</SelectItem>
                        {TIER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={moment} onValueChange={(value) => pushParams({ moment: value })}>
                    <SelectTrigger className='w-56'>
                        <SelectValue placeholder='Moment' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>Registration + pre-renewal</SelectItem>
                        {MOMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='user_name'
                isSearch={false}
                columns={spinHistoryColumns}
                data={rows}
                isLoading={isPending}
                serverSide
                alwaysShowPagination
                currentPage={meta.page}
                totalItems={meta.total}
                itemsPerPage={10}
                onPageChange={(page) => pushParams({ page })}
                emptyMessage={
                    historyFailed ? (
                        <span className='flex flex-col items-center gap-1'>
                            <TriangleAlert className='mb-1 size-8 text-amber-400/70' />
                            <span className='text-foreground text-sm font-semibold'>
                                Couldn&apos;t load spin history
                            </span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                The history request failed — this is not a claim that no member has spun. Try reloading
                                the page.
                            </span>
                        </span>
                    ) : (
                        <span className='flex flex-col items-center gap-1'>
                            <History className='mb-1 size-8 opacity-40' />
                            <span className='text-foreground text-sm font-semibold'>No spins yet</span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                Spin history will appear here once members start spinning at registration or renewal.
                            </span>
                        </span>
                    )
                }
            />
        </div>
    );
}
