import type { ScheduledTierChange } from '@/lib/api/resources/memberships';
import type { SubTierCode } from '@/types/member';

import { ManageMembershipActions } from './manage-membership-actions';
import { UpgradePlanPicker } from './upgrade-plan-picker';

interface ManageTierProps {
    isVisitor: boolean;
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
    scheduledChange: ScheduledTierChange | null;
    billingStatus: string | null;
    cancelAtPeriodEnd: boolean;
}

export function ManageTier({
    isVisitor,
    currentSubTier,
    nextRenewalIso,
    scheduledChange,
    billingStatus,
    cancelAtPeriodEnd
}: ManageTierProps) {
    return isVisitor ? (
        <UpgradePlanPicker />
    ) : (
        <ManageMembershipActions
            currentSubTier={currentSubTier}
            nextRenewalIso={nextRenewalIso}
            scheduledChange={scheduledChange}
            billingStatus={billingStatus}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
        />
    );
}
