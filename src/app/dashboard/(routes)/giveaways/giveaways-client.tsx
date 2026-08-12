'use client';

import { useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { giveawaysColumns } from './_components/columns';
import { deleteGiveawayAction } from './actions';
import { toast } from 'sonner';

export type GiveawayRow = {
    id: string;
    name: string;
    tier: string;
    type: string;
    status: string;
    prize: string;
    entries: number;
    winners: number;
    opens: string;
    closes: string;
    draws: string;
};

type StatusFilter = 'all' | 'OPEN' | 'CLOSED' | 'COMPLETED';

export function GiveawaysClient({ rows, listError }: { rows: GiveawayRow[]; listError: ListError | null }) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const filteredRows = useMemo(() => {
        if (statusFilter === 'all') return rows;

        return rows.filter((row) => row.status === statusFilter);
    }, [rows, statusFilter]);

    const handleEdit = (row: GiveawayRow) => router.push(`/dashboard/giveaways/${row.id}`);

    // DataTable's action column shows its own confirm dialog before calling this.
    const handleDelete = (row: GiveawayRow) => {
        startTransition(async () => {
            const res = await deleteGiveawayAction(row.id);
            if (res.ok) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <>
            <div className='mb-4 flex items-center gap-3'>
                <label className='text-sm font-medium text-slate-400'>Status:</label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All</SelectItem>
                        <SelectItem value='OPEN'>Open</SelectItem>
                        <SelectItem value='CLOSED'>Closed</SelectItem>
                        <SelectItem value='COMPLETED'>Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='name'
                columns={giveawaysColumns}
                data={filteredRows}
                nowrap
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </>
    );
}
