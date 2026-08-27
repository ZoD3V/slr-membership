'use client';

import { useMemo, useState } from 'react';

import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { TierFilter, type TierFilterValue } from '@/app/dashboard/_components/tier-filter';
import { DataTable } from '@/components/data-table';
import type { DrawCsvHistoryItem } from '@/lib/api/resources/admin';
import { formatDateTime as formatDate } from '@/lib/member';

import { drawExportsColumns } from './_components/columns';
import { FileSpreadsheet } from 'lucide-react';

interface DrawExportsClientProps {
    initialHistory: DrawCsvHistoryItem[];
    failed: boolean;
}

export function DrawExportsClient({ initialHistory, failed }: DrawExportsClientProps) {
    const [tier, setTier] = useState<TierFilterValue>('all');

    const rows = useMemo(
        () =>
            initialHistory.map((h) => ({
                id: h.id,
                tier: h.tier,
                filename: h.filename || '-',
                rows: h.row_count ?? 0,
                generated: formatDate(h.generated_at),
                downloadUrl: h.download_url
            })),
        [initialHistory]
    );

    const filtered = useMemo(() => (tier === 'all' ? rows : rows.filter((r) => r.tier === tier)), [rows, tier]);

    if (failed) {
        return (
            <DashboardEmptyState
                icon={FileSpreadsheet}
                title='Export History Unavailable'
                description='We couldn’t load the CSV generation history right now. Please try again.'
            />
        );
    }

    if (rows.length === 0) {
        return (
            <DashboardEmptyState
                icon={FileSpreadsheet}
                title='No exports yet'
                description='Generate the entry CSVs to start a draw. Each run produces one file per tier, containing only members with entries in the current cycle.'
            />
        );
    }

    return (
        <>
            <p className='text-slr-dim text-xs'>
                Download links stay valid for about an hour — reload this page if one expires. Upload these to
                randomdraws.com/au to run the draw, then record the winners.
            </p>

            <div className='flex items-center gap-3'>
                <TierFilter value={tier} onChange={setTier} />
                {tier !== 'all' ? (
                    <span className='text-muted-foreground text-xs'>
                        {filtered.length} of {rows.length} exports
                    </span>
                ) : null}
            </div>

            <DataTable isSearch={false} searchKey='filename' columns={drawExportsColumns} data={filtered} />
        </>
    );
}
