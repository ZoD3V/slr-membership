'use client';

import { useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { TierFilter, type TierFilterValue } from '@/app/dashboard/_components/tier-filter';
import { DataTable } from '@/components/data-table';
import type { TierGroup } from '@/types/member';

import { membersColumns } from './_components/columns';
import { deleteMemberAction } from './actions';
import { toast } from 'sonner';

export type MemberRow = {
    id: string;
    name: string;
    email: string;
    tier: string;
    /** Parent tier group; null when the API sent a tier string we can't parse. */
    tierGroup: TierGroup | null;
    state: string;
    status: string;
    registered_at: string;
};

export function MembersClient({ data }: { data: MemberRow[] }) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [tier, setTier] = useState<TierFilterValue>('all');

    const filtered = useMemo(() => (tier === 'all' ? data : data.filter((r) => r.tierGroup === tier)), [data, tier]);

    const handleEdit = (row: MemberRow) => {
        router.push(`/dashboard/members/${row.id}`);
    };

    const handleDelete = (row: MemberRow) => {
        startTransition(async () => {
            try {
                await deleteMemberAction(row.id);
                toast.success('Member deleted.');
                router.refresh();
            } catch {
                toast.error('Could not delete member.');
            }
        });
    };

    return (
        <>
            <div className='flex items-center gap-3'>
                <TierFilter value={tier} onChange={setTier} />
                {tier !== 'all' ? (
                    <span className='text-muted-foreground text-xs'>
                        {filtered.length} of {data.length} members
                    </span>
                ) : null}
            </div>

            <DataTable
                searchKey='name'
                columns={membersColumns}
                data={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </>
    );
}
