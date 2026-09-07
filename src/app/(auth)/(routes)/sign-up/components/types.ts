import { AuStateCode } from '@/constant/au-states';
import { BENY_MONTHLY_PRICE, SUB_TIERS } from '@/constant/tiers';
import { type TierPricing, codesForGroup } from '@/lib/tier-pricing';
import type { SubTierCode } from '@/types/member';

export type TierKey = 'red' | 'blue';

export type SignUpFormData = {
    name: string;
    email: string;
    password: string;
    state: AuStateCode | '';
    phone: string;
    dob: string;
    agreedToTerms: boolean;
    marketingOptIn: boolean;
    tier: TierKey | null;
    sub_tier: SubTierCode | null;
};

export type SpinPrize = {
    label: string;
    discountAmount: number;
};

export const TIER_LABEL: Record<TierKey, string> = {
    red: 'SLR Red',
    blue: 'SLR Blue'
};

export const BENY_PRICE = BENY_MONTHLY_PRICE;

export interface SubTierOption {
    code: SubTierCode;
    level: string;
}

export const subTiersForGroup = (pricing: TierPricing, group: TierKey): SubTierOption[] =>
    codesForGroup(pricing, group).map((code) => ({ code, level: SUB_TIERS[code].marketingName }));

export const subTierLabel = (code: SubTierCode): string => {
    const meta = SUB_TIERS[code];

    return `SLR ${meta.group === 'red' ? 'Red' : 'Blue'} · ${meta.marketingName}`;
};
