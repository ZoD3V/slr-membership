'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SPIN_ELIGIBLE_SUB_TIERS, SUB_TIERS } from '@/constant/tiers';
import type { SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { spinHistoryColumns } from './_components/columns';
import { History } from 'lucide-react';

// Derived from the authoritative constant (also read by the member-side spin
// flow) so admin and member eligibility can't silently drift apart.
const TIER_OPTIONS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SpinEligibleSubTier[];
const MOMENT_OPTIONS = ['registration', 'renewal'] as const;

export function SpinHistoryClient({ rows, tier, moment }: { rows: SpinHistoryRow[]; tier: string; moment: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Both filters live in the URL so the filtered view is shareable/reloadable,
    // matching how (routes)/winners/page.tsx keeps its ?giveaway= filter in the
    // URL rather than component state.
    const setFilter = (key: 'tier' | 'moment', value: string) => {
        const params = new URLSearchParams();
        if (key === 'tier' ? value !== 'all' : tier !== 'all') params.set('tier', key === 'tier' ? value : tier);
        if (key === 'moment' ? value !== 'all' : moment !== 'all')
            params.set('moment', key === 'moment' ? value : moment);

        const query = params.toString();

        startTransition(() => {
            router.push(`/dashboard/spin${query ? `?${query}` : ''}`);
        });
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                <Select value={tier} onValueChange={(value) => setFilter('tier', value)}>
                    <SelectTrigger className='w-40'>
                        <SelectValue placeholder='Tier' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All tiers</SelectItem>
                        {TIER_OPTIONS.map((code) => (
                            <SelectItem key={code} value={code}>
                                {SUB_TIERS[code].label} · {SUB_TIERS[code].marketingName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={moment} onValueChange={(value) => setFilter('moment', value)}>
                    <SelectTrigger className='w-44'>
                        <SelectValue placeholder='Moment' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>Registration + renewal</SelectItem>
                        {MOMENT_OPTIONS.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value === 'registration' ? 'Registration' : 'Renewal'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='member_name'
                columns={spinHistoryColumns}
                data={rows}
                isLoading={isPending}
                alwaysShowPagination
                emptyMessage={
                    <span className='flex flex-col items-center gap-1'>
                        <History className='mb-1 size-8 opacity-40' />
                        <span className='text-foreground text-sm font-semibold'>No spins yet</span>
                        <span className='max-w-sm text-xs leading-relaxed'>
                            Spin history will appear here once members start spinning at registration or renewal.
                        </span>
                    </span>
                }
            />
        </div>
    );
}
