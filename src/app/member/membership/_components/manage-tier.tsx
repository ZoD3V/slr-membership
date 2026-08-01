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
}

// Visitor → Stripe checkout (new subscription). Paid → schedule a tier change or
// cancel, via ManageMembershipActions (POST/DELETE /memberships/upgrade +
// POST /subscriptions/me/cancel). Rendered as the TierCard footer — no card of its own.
export function ManageTier({
    isVisitor,
    currentSubTier,
    nextRenewalIso,
    scheduledChange,
    billingStatus
}: ManageTierProps) {
    return isVisitor ? (
        <UpgradePlanPicker />
    ) : (
        <ManageMembershipActions
            currentSubTier={currentSubTier}
            nextRenewalIso={nextRenewalIso}
            scheduledChange={scheduledChange}
            billingStatus={billingStatus}
        />
    );
}
