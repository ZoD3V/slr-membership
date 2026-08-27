import { AuStateCode } from '@/constant/au-states';
import { SUB_TIERS } from '@/constant/tiers';
import type { SubTierCode } from '@/types/member';

export type TierKey = 'visitor' | 'red' | 'blue';

export type SignUpFormData = {
    name: string;
    email: string;
    password: string;
    state: AuStateCode | '';
    phone: string;
    dob: string;
    tier: TierKey | null;
    sub_tier: SubTierCode | null;
};

export type SpinPrize = {
    label: string;
    discountAmount: number;
};

export const TIER_PRICE: Record<TierKey, number> = {
    visitor: 0,
    red: 10,
    blue: 26
};

export const TIER_LABEL: Record<TierKey, string> = {
    visitor: 'Visitor',
    red: 'SLR Red',
    blue: 'SLR Blue'
};

export const BENY_PRICE = 4;

export interface SubTierOption {
    code: SubTierCode;
    level: string;
    spinDiscount: number;
}

export const RED_SUB_TIERS: SubTierOption[] = [
    { code: 'R1', level: 'Standard', spinDiscount: 0 },
    { code: 'R4', level: 'Plus', spinDiscount: 5 },
    { code: 'R7', level: 'Premium', spinDiscount: 10 }
];

export const BLUE_SUB_TIERS: SubTierOption[] = [
    { code: 'B1', level: 'Standard', spinDiscount: 0 },
    { code: 'B4', level: 'Plus', spinDiscount: 10 },
    { code: 'B7', level: 'Premium', spinDiscount: 15 },
    { code: 'B10', level: 'Elite', spinDiscount: 20 }
];

const ALL_SUB_TIERS = [...RED_SUB_TIERS, ...BLUE_SUB_TIERS];

export const subTiersForGroup = (group: TierKey): SubTierOption[] =>
    group === 'red' ? RED_SUB_TIERS : group === 'blue' ? BLUE_SUB_TIERS : [];

export const spinDiscountFor = (code: SubTierCode | null): number =>
    (code ? ALL_SUB_TIERS.find((s) => s.code === code)?.spinDiscount : 0) ?? 0;

export const isSpinEligible = (code: SubTierCode | null): boolean => spinDiscountFor(code) > 0;

export const subTierPrice = (code: SubTierCode): number => SUB_TIERS[code].price_cents / 100;
export const subTierTokens = (code: SubTierCode): number => SUB_TIERS[code].tokens;

export const subTierLabel = (code: SubTierCode): string => {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';
    const level = ALL_SUB_TIERS.find((s) => s.code === code)?.level ?? meta.label;

    return `SLR ${meta.group === 'red' ? 'Red' : 'Blue'} · ${level}`;
};
