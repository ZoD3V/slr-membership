import type { ScheduledTierChange } from '@/lib/api/resources/memberships';
import type { TierPricing } from '@/lib/tier-pricing';
import type { SubTierCode } from '@/types/member';

import { ManageMembershipActions } from './manage-membership-actions';

interface ManageTierProps {
    pricing: TierPricing;
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
    scheduledChange: ScheduledTierChange | null;
    billingStatus: string | null;
    cancelAtPeriodEnd: boolean;
}

export function ManageTier({
    pricing,
    currentSubTier,
    nextRenewalIso,
    scheduledChange,
    billingStatus,
    cancelAtPeriodEnd
}: ManageTierProps) {
    return (
        <ManageMembershipActions
            currentSubTier={currentSubTier}
            pricing={pricing}
            nextRenewalIso={nextRenewalIso}
            scheduledChange={scheduledChange}
            billingStatus={billingStatus}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
        />
    );
}
