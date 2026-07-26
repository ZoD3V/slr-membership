'use client';

import { useMemo, useState, useTransition } from 'react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SUB_TIERS } from '@/constant/tiers';
import { type MemberSubTierId, type ScheduledTierChange } from '@/lib/api/resources/memberships';
import { formatAud, formatShortDate, formatTierName } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';
import type { SubTierCode } from '@/types/member';

import { cancelMembershipAction, cancelScheduledTierChangeAction, scheduleTierChangeAction } from '../actions';
import { toast } from 'sonner';

interface ManageMembershipActionsProps {
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
    // Persisted scheduled change from memberships/me.pending_upgrade (A2, live 2026-07-26).
    scheduledChange: ScheduledTierChange | null;
}

interface ChangeOption {
    id: MemberSubTierId;
    label: string;
    priceLabel: string;
    tokens: number;
}

// Paid sub-tiers a member may switch to. Visitor is intentionally excluded —
// stopping payment is "Cancel membership", not a plan change.
const PAID_CODES: SubTierCode[] = ['R1', 'R4', 'R7', 'B1', 'B4', 'B7', 'B10'];

export function ManageMembershipActions({
    currentSubTier,
    nextRenewalIso,
    scheduledChange
}: ManageMembershipActionsProps) {
    const [planOpen, setPlanOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [selected, setSelected] = useState<MemberSubTierId | null>(null);
    const [scheduled, setScheduled] = useState<ScheduledTierChange | null>(scheduledChange);
    const [pending, startTransition] = useTransition();

    const options = useMemo<ChangeOption[]>(
        () =>
            PAID_CODES.filter((code) => code !== currentSubTier).map((code) => {
                const meta = SUB_TIERS[code];

                return {
                    id: code.toLowerCase() as MemberSubTierId,
                    label: formatTierName(code),
                    priceLabel: `${formatAud(meta.price_cents)} / 28 days`,
                    tokens: meta.tokens
                };
            }),
        [currentSubTier]
    );

    const renewalLabel = nextRenewalIso ? formatShortDate(nextRenewalIso) : 'your next renewal';
    const scheduledLabel = scheduled ? formatTierName(scheduled.target_sub_tier.toUpperCase() as SubTierCode) : '';

    const confirmChange = () => {
        if (!selected) return;
        startTransition(async () => {
            const res = await scheduleTierChangeAction(selected);
            if (res.ok) {
                setScheduled(res.change);
                setPlanOpen(false);
                setSelected(null);
                toast.success('Plan change scheduled for your next renewal.');
            } else {
                toast.error(res.message);
            }
        });
    };

    const cancelScheduled = () => {
        startTransition(async () => {
            const res = await cancelScheduledTierChangeAction();
            if (res.ok) {
                setScheduled(null);
                toast.success('Scheduled plan change cancelled.');
            } else {
                toast.error(res.message);
            }
        });
    };

    const confirmCancelMembership = () => {
        startTransition(async () => {
            const res = await cancelMembershipAction();
            if (res.ok) {
                setCancelOpen(false);
                toast.success('Membership cancellation scheduled.');
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className='mt-4 space-y-3'>
            {/* Scheduled banner — hydrated from memberships/me.pending_upgrade (A2), updated optimistically on action. */}
            {scheduled ? (
                <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2B42B4D] bg-[#E2B42B14] p-4'>
                    <span className='text-sm text-white/90'>
                        Scheduled → {scheduledLabel} on {formatShortDate(scheduled.effective_at)}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={pending}
                        onClick={cancelScheduled}
                        className='border-white/15 bg-white/5 text-xs text-white/90 hover:bg-white/10'>
                        Cancel scheduled change
                    </Button>
                </div>
            ) : null}

            <div className='flex flex-wrap gap-3'>
                <Button
                    className='h-11 rounded-xl font-bold uppercase'
                    style={goldButtonStyle}
                    disabled={pending}
                    onClick={() => setPlanOpen(true)}>
                    Change plan
                </Button>
                <Button
                    variant='outline'
                    className='h-11 rounded-xl border-white/15 bg-white/5 text-white/90 uppercase hover:bg-white/10'
                    disabled={pending}
                    onClick={() => setCancelOpen(true)}>
                    Cancel membership
                </Button>
            </div>

            {/* Change plan */}
            <ConfirmDialog
                open={planOpen}
                onOpenChange={setPlanOpen}
                title='Change plan'
                confirmText={pending ? 'Scheduling…' : 'Confirm change'}
                cancelBtnText='Back'
                isLoading={pending}
                disabled={!selected}
                handleConfirm={confirmChange}
                desc={`Applies at ${renewalLabel} · no proration · cancelable anytime before then.`}>
                <RadioGroup
                    value={selected ?? undefined}
                    onValueChange={(v) => setSelected(v as MemberSubTierId)}
                    className='my-2 gap-2'>
                    {options.map((opt) => (
                        <label
                            key={opt.id}
                            htmlFor={opt.id}
                            className='flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 p-3 hover:bg-white/5'>
                            <span className='flex items-center gap-3'>
                                <RadioGroupItem id={opt.id} value={opt.id} />
                                <span className='text-sm text-white/90'>{opt.label}</span>
                            </span>
                            <span className='text-slr-dim text-xs'>
                                {opt.priceLabel} · {opt.tokens} tokens
                            </span>
                        </label>
                    ))}
                </RadioGroup>
            </ConfirmDialog>

            {/* Cancel membership */}
            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title='Cancel membership?'
                destructive
                confirmText={pending ? 'Cancelling…' : 'Yes, cancel'}
                cancelBtnText='Keep membership'
                isLoading={pending}
                handleConfirm={confirmCancelMembership}
                desc={`Access continues until ${renewalLabel}. No further charges after that.`}
            />
        </div>
    );
}
