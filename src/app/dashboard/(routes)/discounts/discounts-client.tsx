'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';

import { discountsColumns } from './_components/columns';
import { deleteDiscountAction } from './actions';
import { toast } from 'sonner';

export type DiscountRow = {
    id: string;
    title: string;
    partner: string;
    category: string;
    featured: string;
};

export function DiscountsClient({
    initialRows,
    listError
}: {
    initialRows: DiscountRow[];
    listError: ListError | null;
}) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleEdit = (row: DiscountRow) => {
        router.push(`/dashboard/discounts/${row.id}`);
    };

    // DataTable's action column shows its own confirm dialog before calling this.
    const handleDelete = (row: DiscountRow) => {
        startTransition(async () => {
            const res = await deleteDiscountAction(row.id);
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
                searchKey='title'
                columns={discountsColumns}
                data={initialRows}
                onEdit={(row) => handleEdit(row as DiscountRow)}
                onDelete={(row) => handleDelete(row as DiscountRow)}
            />
        </>
    );
}
