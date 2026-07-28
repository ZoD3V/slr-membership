import { SUB_TIERS } from '@/constant/tiers';
import type { ScheduledTierChange } from '@/lib/api/resources/memberships';
import { formatAud, formatTierName } from '@/lib/member';
import type { SubTierCode } from '@/types/member';

import { ManageMembershipActions } from './manage-membership-actions';
import { UpgradePlanPicker } from './upgrade-plan-picker';

interface ManageTierProps {
    isVisitor: boolean;
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
    scheduledChange: ScheduledTierChange | null;
    billingStatus: string | null;
}

// Visitor → Stripe checkout (new subscription). Paid → schedule a tier change or
// cancel, via ManageMembershipActions (POST/DELETE /memberships/upgrade +
// POST /subscriptions/me/cancel).
export function ManageTier({ isVisitor, currentSubTier, nextRenewalIso, scheduledChange, billingStatus }: ManageTierProps) {
    const meta = SUB_TIERS[currentSubTier];

    return (
        <section className='bg-slr-navy-card border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                Manage Membership
            </h2>

            {isVisitor ? (
                <UpgradePlanPicker />
            ) : (
                <>
                    <p className='text-slr-muted mt-2 text-sm'>
                        Current plan: <span className='text-white/90'>{formatTierName(currentSubTier)}</span> —{' '}
                        {formatAud(meta.price_cents)} / 28 days
                    </p>
                    <ManageMembershipActions
                        currentSubTier={currentSubTier}
                        nextRenewalIso={nextRenewalIso}
                        scheduledChange={scheduledChange}
                        billingStatus={billingStatus}
                    />
                </>
            )}
        </section>
    );
}
