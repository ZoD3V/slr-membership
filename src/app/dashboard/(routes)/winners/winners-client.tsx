'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
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
    recorded_at: string;
};

export function WinnersClient({
    rows,
    listError,
    page,
    total,
    perPage,
    giveawayFilter
}: {
    rows: WinnerRow[];
    listError: ListError | null;
    page: number;
    total: number;
    perPage: number;
    giveawayFilter?: string;
}) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const hrefFor = (next: number) => {
        const params = new URLSearchParams({ page: String(next) });
        if (giveawayFilter) params.set('giveaway', giveawayFilter);

        return `/dashboard/winners?${params}`;
    };

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
            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Winners list unavailable — report this to the backend'
                    description='GET /api/v1/admin/winners failed, so recorded winners cannot be shown.'
                />
            ) : null}

            <DataTable
                // Server-paginated; the endpoint has no ?search= param.
                isSearch={false}
                searchKey='winner'
                columns={winnersColumns}
                data={rows}
                serverSide
                currentPage={page}
                totalItems={total}
                itemsPerPage={perPage}
                onPageChange={(next) => router.push(hrefFor(next))}
                alwaysShowPagination
                onEdit={(row) => handleEdit(row as WinnerRow)}
                onDelete={(row) => handleDelete(row as WinnerRow)}
            />
        </>
    );
}
