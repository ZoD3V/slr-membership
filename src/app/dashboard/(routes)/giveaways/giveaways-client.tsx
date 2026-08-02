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

export function GiveawaysClient({
    rows,
    listError,
    page,
    total,
    perPage
}: {
    rows: GiveawayRow[];
    listError: ListError | null;
    page: number;
    total: number;
    perPage: number;
}) {
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
                // Server-paginated: search would only filter the current page, and
                // the endpoint has no ?search= param.
                isSearch={false}
                searchKey='name'
                columns={giveawaysColumns}
                data={rows}
                nowrap
                serverSide
                currentPage={page}
                totalItems={total}
                itemsPerPage={perPage}
                onPageChange={(next) => router.push(`/dashboard/giveaways?page=${next}`)}
                alwaysShowPagination
                onEdit={(row) => handleEdit(row as GiveawayRow)}
                onDelete={(row) => handleDelete(row as GiveawayRow)}
            />
        </>
    );
}
