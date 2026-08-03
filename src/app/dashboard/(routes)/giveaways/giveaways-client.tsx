'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';

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

export function GiveawaysClient({ rows, listError }: { rows: GiveawayRow[]; listError: ListError | null }) {
    const router = useRouter();
    const [, startTransition] = useTransition();

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
            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Giveaways list unavailable — report this to the backend'
                    description='GET /api/v1/admin/giveaways failed, so existing giveaways cannot be shown.'
                />
            ) : null}

            <DataTable
                // The endpoint ignores ?search=, so the page loads every row and
                // DataTable searches/paginates client-side (same as ebooks).
                searchKey='name'
                columns={giveawaysColumns}
                data={rows}
                nowrap
                alwaysShowPagination
                onEdit={(row) => handleEdit(row as GiveawayRow)}
                onDelete={(row) => handleDelete(row as GiveawayRow)}
            />
        </>
    );
}
