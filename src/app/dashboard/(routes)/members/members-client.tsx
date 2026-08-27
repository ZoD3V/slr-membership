'use client';

import { useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { StatusFilter, type StatusFilterValue } from '@/app/dashboard/_components/status-filter';
import { TierFilter, type TierFilterValue } from '@/app/dashboard/_components/tier-filter';
import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    tierGroup: TierGroup | null;
    state: string;
    status: string;
    billing_status: string;
    draw_pass: number | string;
    registered_at: string;
};

export type TpalFilterValue = 'all' | 'eligible' | 'excluded';
export type BillingFilterValue = 'all' | 'active' | 'inactive';

export function MembersClient({ data }: { data: MemberRow[] }) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [tier, setTier] = useState<TierFilterValue>('all');
    const [status, setStatus] = useState<StatusFilterValue>('all');
    const [billing, setBilling] = useState<BillingFilterValue>('all');
    const [tpal, setTpal] = useState<TpalFilterValue>('all');

    const statuses = useMemo(() => {
        const seen = new Set(data.map((r) => r.status?.toLowerCase()).filter(Boolean));
        const canonical = ['active', 'pending_payment', 'suspended', 'deactivated'];

        return [...canonical.filter((s) => seen.has(s)), ...[...seen].filter((s) => !canonical.includes(s)).sort()];
    }, [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            if (tier !== 'all' && r.tierGroup !== tier) return false;
            if (status !== 'all' && r.status?.toLowerCase() !== status) return false;
            if (billing !== 'all') {
                const b = r.billing_status?.toLowerCase();
                if (billing === 'active' && b !== 'active') return false;
                if (billing === 'inactive' && b === 'active') return false;
            }
            if (tpal !== 'all') {
                const dp = typeof r.draw_pass === 'number' ? r.draw_pass : Number(r.draw_pass);
                const isEligible = dp > 0 || dp === -1;
                if (tpal === 'eligible' && !isEligible) return false;
                if (tpal === 'excluded' && isEligible) return false;
            }

            return true;
        });
    }, [data, tier, status, billing, tpal]);

    const filtering = tier !== 'all' || status !== 'all' || billing !== 'all' || tpal !== 'all';

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

                <Select value={billing} onValueChange={(v) => setBilling(v as BillingFilterValue)}>
                    <SelectTrigger className='w-40' aria-label='Filter by billing'>
                        <SelectValue placeholder='All billing' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All billing</SelectItem>
                        <SelectItem value='active'>Billing: Active</SelectItem>
                        <SelectItem value='inactive'>Billing: Inactive</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={tpal} onValueChange={(v) => setTpal(v as TpalFilterValue)}>
                    <SelectTrigger className='w-40' aria-label='Filter by TPAL entry'>
                        <SelectValue placeholder='All TPAL' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All TPAL entries</SelectItem>
                        <SelectItem value='eligible'>TPAL: Eligible</SelectItem>
                        <SelectItem value='excluded'>TPAL: Excluded</SelectItem>
                    </SelectContent>
                </Select>

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
                nowrap={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </>
    );
}
