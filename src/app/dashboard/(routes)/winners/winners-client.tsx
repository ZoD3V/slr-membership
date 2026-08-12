'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';

import { deleteWinnerAction } from '../giveaways/actions';
import { winnersColumns } from './_components/columns';
import { toast } from 'sonner';

export type WinnerRow = {
    id: string;
    prize: string;
    giveaway: string;
    tier: string;
    winner: string;
    state: string;
    opens: string;
    closes: string;
    draws: string;
    recorded_at: string;
};

export function WinnersClient({ rows, listError }: { rows: WinnerRow[]; listError: ListError | null }) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleEdit = (row: WinnerRow) => router.push(`/dashboard/winners/${row.id}`);

    // DataTable's action column shows its own confirm dialog before calling this.
    const handleDelete = (row: WinnerRow) => {
        startTransition(async () => {
            const res = await deleteWinnerAction(row.id);
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
            <DataTable
                // The endpoint ignores ?search=, so the page loads every row and
                // DataTable searches/paginates client-side (same as ebooks).
                searchKey='winner'
                columns={winnersColumns}
                data={rows}
                nowrap
                alwaysShowPagination
                onEdit={(row) => handleEdit(row as WinnerRow)}
                onDelete={(row) => handleDelete(row as WinnerRow)}
            />
        </>
    );
}
