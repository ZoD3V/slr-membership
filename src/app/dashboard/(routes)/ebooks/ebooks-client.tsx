'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';
import type { EbookTier } from '@/lib/api/resources/ebooks';

import { ebooksColumns } from './_components/columns';
import { deleteEbookAction } from './actions';
import { toast } from 'sonner';

export type EbookRow = {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    coverUrl: string;
    category: string;
    footnote: string;
    tier?: EbookTier;
    reading: number;
    chapters: number;
    locked: string;
};

export function EbooksClient({ initialRows, listError }: { initialRows: EbookRow[]; listError: ListError | null }) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleEdit = (row: EbookRow) => {
        router.push(`/dashboard/ebooks/${row.id}`);
    };

    // DataTable's action column shows its own confirm dialog before calling this.
    const handleDelete = (row: EbookRow) => {
        startTransition(async () => {
            const res = await deleteEbookAction(row.id);
            if (res.ok) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <>
            {listError ? (
                <ListErrorCard error={listError} title='Ebooks list failed — report this to the backend' />
            ) : null}

            <DataTable
                searchKey='title'
                columns={ebooksColumns}
                data={initialRows}
                onEdit={(row) => handleEdit(row as EbookRow)}
                onDelete={(row) => handleDelete(row as EbookRow)}
            />
        </>
    );
}
