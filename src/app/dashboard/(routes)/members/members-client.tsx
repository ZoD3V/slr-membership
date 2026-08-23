'use client';

import { useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { StatusFilter, type StatusFilterValue } from '@/app/dashboard/_components/status-filter';
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
    phone: string;
    dob: string;
    tier: string;
    /** Parent tier group; null when the API sent a tier string we can't parse. */
    tierGroup: TierGroup | null;
    state: string;
    status: string;
    billing_status: string;
    registered_at: string;
};

export function MembersClient({ data }: { data: MemberRow[] }) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [tier, setTier] = useState<TierFilterValue>('all');
    const [status, setStatus] = useState<StatusFilterValue>('all');

    // Statuses the API actually sent, canonical order first. Case-insensitive
    // because the DTO warns the backend is inconsistent about status casing.
    const statuses = useMemo(() => {
        const seen = new Set(data.map((r) => r.status?.toLowerCase()).filter(Boolean));
        const canonical = ['active', 'pending_payment', 'suspended', 'deactivated'];

        return [...canonical.filter((s) => seen.has(s)), ...[...seen].filter((s) => !canonical.includes(s)).sort()];
    }, [data]);

    const filtered = useMemo(
        () =>
            data.filter(
                (r) =>
                    (tier === 'all' || r.tierGroup === tier) && (status === 'all' || r.status?.toLowerCase() === status)
            ),
        [data, tier, status]
    );

    const filtering = tier !== 'all' || status !== 'all';

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
            <div className='flex flex-wrap items-center gap-3'>
                <TierFilter value={tier} onChange={setTier} />
                <StatusFilter value={status} onChange={setStatus} statuses={statuses} />
                {filtering ? (
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
