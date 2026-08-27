'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminMemberStatusValue } from '@/lib/api/resources/admin';
import type { MemberSubTierId } from '@/lib/api/resources/memberships';
import { formatAdminTierName, subTierCodeOf } from '@/lib/member';

import { changeMemberTierAction, updateMemberStatusAction } from '../../actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: AdminMemberStatusValue; label: string }[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'DEACTIVATED', label: 'Deactivated' }
];

const SUB_TIER_IDS: MemberSubTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];

const SUB_TIER_OPTIONS: { value: MemberSubTierId; label: string }[] = SUB_TIER_IDS.map((value) => ({
    value,
    label: formatAdminTierName(subTierCodeOf(value))
}));

const toStatusValue = (status: string): AdminMemberStatusValue => {
    const upper = status.toUpperCase();

    return STATUS_OPTIONS.some((o) => o.value === upper) ? (upper as AdminMemberStatusValue) : 'ACTIVE';
};

export function MemberAdminActions({
    userId,
    currentStatus,
    currentTierCode
}: {
    userId: string;
    currentStatus: string;
    currentTierCode: string;
}) {
    const router = useRouter();
    const [status, setStatus] = useState<AdminMemberStatusValue>(toStatusValue(currentStatus));

    const [subTier, setSubTier] = useState<MemberSubTierId | ''>('');
    const [statusPending, startStatus] = useTransition();
    const [tierPending, startTier] = useTransition();

    const savedStatus = toStatusValue(currentStatus);
    const baseTierLabel = currentTierCode ? currentTierCode.toUpperCase() : '—';

    const saveStatus = () => {
        startStatus(async () => {
            const res = await updateMemberStatusAction(userId, status);
            if (res.ok) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    const saveTier = () => {
        if (!subTier) return;
        startTier(async () => {
            const res = await changeMemberTierAction(userId, subTier);
            if (res.ok) {
                toast.success(res.message);
                setSubTier('');
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Admin actions</CardTitle>
                <CardDescription>
                    Update the member&apos;s account status or tier / sub-tier. Each control saves independently.
                </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 sm:grid-cols-2'>
                <div className='grid gap-2'>
                    <Label htmlFor='member-status'>Account status</Label>
                    <div className='flex gap-2'>
                        <Select value={status} onValueChange={(v) => setStatus(v as AdminMemberStatusValue)}>
                            <SelectTrigger id='member-status' className='flex-1'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={saveStatus} disabled={statusPending || status === savedStatus}>
                            {statusPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : 'Update'}
                        </Button>
                    </div>
                </div>

                <div className='grid gap-2'>
                    <Label htmlFor='member-tier'>Tier / sub-tier</Label>
                    <div className='flex gap-2'>
                        <Select value={subTier} onValueChange={(v) => setSubTier(v as MemberSubTierId)}>
                            <SelectTrigger id='member-tier' className='flex-1'>
                                <SelectValue placeholder={`Current base: ${baseTierLabel} — select new tier`} />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                {SUB_TIER_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={saveTier} disabled={tierPending || !subTier}>
                            {tierPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : 'Update'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
