'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import { DataTable } from '@/components/data-table';

import { announcementsColumns } from './_components/columns';
import { deleteAnnouncementAction } from './actions';
import { toast } from 'sonner';

export type AnnouncementRow = {
    id: string;
    type: string;
    title: string;
    content: string;
    active: string;
    order: number;
};

export function AnnouncementsClient({
    initialRows,
    listError
}: {
    initialRows: AnnouncementRow[];
    listError: ListError | null;
}) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleEdit = (row: AnnouncementRow) => {
        router.push(`/dashboard/announcements/${row.id}`);
    };

    const handleDelete = (row: AnnouncementRow) => {
        startTransition(async () => {
            const res = await deleteAnnouncementAction(row.id);
            if (res.ok) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <div className='flex flex-col gap-4'>
            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Announcements could not be loaded'
                    description='The list below may be incomplete. Share this reference with the backend team.'
                />
            ) : null}

            <DataTable
                searchKey='content'
                columns={announcementsColumns}
                data={initialRows}
                onEdit={(row) => handleEdit(row as AnnouncementRow)}
                onDelete={(row) => handleDelete(row as AnnouncementRow)}
            />
        </div>
    );
}
