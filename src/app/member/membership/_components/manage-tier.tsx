import type { ScheduledTierChange } from '@/lib/api/resources/memberships';
import type { TierPricing } from '@/lib/tier-pricing';
import type { SubTierCode } from '@/types/member';

import { ManageMembershipActions } from './manage-membership-actions';
import { UpgradePlanPicker } from './upgrade-plan-picker';

interface ManageTierProps {
    isVisitor: boolean;
    pricing: TierPricing;
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
    scheduledChange: ScheduledTierChange | null;
    billingStatus: string | null;
    cancelAtPeriodEnd: boolean;
}

export function ManageTier({
    isVisitor,
    pricing,
    currentSubTier,
    nextRenewalIso,
    scheduledChange,
    billingStatus,
    cancelAtPeriodEnd
}: ManageTierProps) {
    return isVisitor ? (
        <UpgradePlanPicker pricing={pricing} />
    ) : (
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
