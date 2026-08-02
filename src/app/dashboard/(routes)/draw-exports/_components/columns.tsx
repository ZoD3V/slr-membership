import type { Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import type { DrawCsvTier } from '@/lib/api/resources/admin';
import { cn } from '@/lib/utils';

import { Download } from 'lucide-react';

const TIER_STYLE: Record<DrawCsvTier, string> = {
    visitor: 'border-[#A0B4D259] text-slr-dim',
    red: 'border-[#C8152E66] text-[#E88888]',
    blue: 'border-[#2878E84D] text-[#2878E8]'
};

export const drawExportsColumns: Column[] = [
    {
        key: 'tier',
        label: 'Tier',
        render: (row) => (
            <span
                className={cn(
                    'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                    TIER_STYLE[row.tier as DrawCsvTier]
                )}>
                {row.tier || '-'}
            </span>
        )
    },
    {
        key: 'filename',
        label: 'Filename',
        render: (row) => <span className='font-medium text-white'>{row.filename || '-'}</span>
    },
    { key: 'rows', label: 'Rows', render: (row) => <span className='tabular-nums'>{row.rows ?? 0}</span> },
    { key: 'generated', label: 'Generated' },
    {
        key: 'download',
        label: 'Download',
        render: (row) =>
            row.downloadUrl ? (
                <Button variant='ghost' size='sm' className='h-8' asChild>
                    <a href={row.downloadUrl} download>
                        <Download className='mr-1.5 size-3.5' />
                        CSV
                    </a>
                </Button>
            ) : (
                <span className='text-slr-dim'>-</span>
            )
    }
];
