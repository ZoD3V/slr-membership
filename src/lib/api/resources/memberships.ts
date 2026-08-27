import { cache } from 'react';

import { subTierCodeOf } from '@/lib/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface TierOption {
    sub_tier: string;
    marketing_name: string;
    price_cents: number;
    token: number;

    draw_pass: number;
    spin: boolean;
    spin_discount_cents: number;
}

export interface VisitorTier {
    price_cents: number;
    token: number;
    draw_pass: string;
}

export interface MembershipTiers {
    red: TierOption[];
    blue: TierOption[];
    visitor: VisitorTier;
}

export type MemberSubTierId = 'visitor' | 'r1' | 'r4' | 'r7' | 'b1' | 'b4' | 'b7' | 'b10';

export interface MembershipSubTier {
    id: string;
    tier: string;
    marketingName: string;
    priceCents: number;
    token: number;

    drawPassDefault: number;
    hasSpin: boolean;
    spinDiscountCents: number;
    stripePriceId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface MembershipRecord {
    id: string;
    userId: string;
    subTierId: string;
    billingStatus: string;
    activatedAt: string;
    pendingBonusNextCycle: number;

    pending_upgrade: ScheduledTierChange | null;
    createdAt: string;
    updatedAt: string;
    subTier: MembershipSubTier;
}

export interface TierDisplay {
    price: string;
    tokens: string;
    name: string;
    spin: string | null;
}

export const getMembershipTiers = cache(() => apiFetch<MembershipTiers>(API.memberships.tiers, { revalidate: 3600 }));

export const getMyMembership = cache((token: string) =>
    apiFetch<MembershipRecord>(API.memberships.me, { token, cache: 'no-store' })
);

export const changeMemberTier = (userId: string, subTierId: MemberSubTierId, token: string) => {
    return apiFetch<MembershipRecord>(API.memberships.changeTier, {
        method: 'POST',
        body: { userId, subTierId },
        token
    });
};

export interface ScheduledTierChange {
    target_sub_tier: string;
    effective_at: string;
}

export const scheduleMembershipChange = (targetSubTierId: MemberSubTierId, token: string) =>
    apiFetch<ScheduledTierChange>(API.memberships.upgrade, { method: 'POST', body: { targetSubTierId }, token });

export const cancelScheduledChange = (token: string) =>
    apiFetch<null>(API.memberships.upgrade, { method: 'DELETE', token });

interface RawSubTierStat {
    sub_tier_id: string;
    count: number;
}

export interface SubTierCount {
    subTierId: string;
    count: number;
}

const SUB_TIER_ORDER: Record<string, number> = {
    visitor: 0,
    r1: 1,
    r4: 2,
    r7: 3,
    b1: 4,
    b4: 5,
    b7: 6,
    b10: 7
};

export const getMembershipStats = cache(async (token: string): Promise<SubTierCount[]> => {
    const raw = await apiFetch<RawSubTierStat[]>(API.memberships.stats, { token, cache: 'no-store' });

    const merged = new Map<string, { subTierId: string; count: number }>();
    for (const r of raw) {
        if ((r.sub_tier_id || '').toLowerCase() === 'beny') continue;

        const code = subTierCodeOf(r.sub_tier_id).toLowerCase();
        const existing = merged.get(code);
        if (existing) existing.count += r.count;
        else merged.set(code, { subTierId: code, count: r.count });
    }

    return Array.from(merged.values()).sort(
        (a, b) => (SUB_TIER_ORDER[a.subTierId] ?? 99) - (SUB_TIER_ORDER[b.subTierId] ?? 99)
    );
});
