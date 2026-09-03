import { cache } from 'react';

import { SUB_TIERS } from '@/constant/tiers';
import { type MembershipTiers, getMembershipTiers } from '@/lib/api/resources/memberships';
import { subTierCodeOf } from '@/lib/member';
import type { SubTierCode } from '@/types/member';

export interface SubTierPricing {
    priceCents: number;
    tokens: number;
    spinDiscountCents: number;
}

export type TierPricing = Record<SubTierCode, SubTierPricing>;

/** Used only when /memberships/tiers is unreachable. Mirrors the live values. */
export const FALLBACK_TIER_PRICING: TierPricing = Object.fromEntries(
    Object.values(SUB_TIERS).map((meta) => [
        meta.code,
        { priceCents: meta.price_cents, tokens: meta.tokens, spinDiscountCents: meta.spin_discount_cents }
    ])
) as TierPricing;

export function tierPricingFrom(tiers: MembershipTiers | null | undefined): TierPricing {
    if (!tiers) return FALLBACK_TIER_PRICING;

    const merged: TierPricing = { ...FALLBACK_TIER_PRICING };
    for (const option of [...tiers.red, ...tiers.blue]) {
        const code = subTierCodeOf(option.sub_tier);
        if (code === 'VISITOR') continue;
        merged[code] = {
            priceCents: option.price_cents,
            tokens: option.token,
            spinDiscountCents: option.spin_discount_cents
        };
    }

    return merged;
}

/** Server-side entry point: live pricing, silently falling back when the API is down. */
export const getTierPricing = cache(
    async (): Promise<TierPricing> => tierPricingFrom(await getMembershipTiers().catch(() => null))
);

export const priceOf = (pricing: TierPricing, code: SubTierCode): number => pricing[code].priceCents;

export const dollarsOf = (pricing: TierPricing, code: SubTierCode): number => pricing[code].priceCents / 100;

export const spinDiscountOf = (pricing: TierPricing, code: SubTierCode): number =>
    pricing[code].spinDiscountCents / 100;

export const isSpinEligible = (pricing: TierPricing, code: SubTierCode | null): boolean =>
    code !== null && pricing[code].spinDiscountCents > 0;

export const codesForGroup = (pricing: TierPricing, group: 'red' | 'blue'): SubTierCode[] =>
    Object.values(SUB_TIERS)
        .filter((meta) => meta.group === group)
        .map((meta) => meta.code)
        .sort((a, b) => pricing[a].priceCents - pricing[b].priceCents);

export const minPriceOf = (pricing: TierPricing, group: 'red' | 'blue'): number =>
    Math.min(...codesForGroup(pricing, group).map((code) => pricing[code].priceCents));
