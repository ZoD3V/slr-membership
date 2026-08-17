import { cache } from 'react';

import { subTierCodeOf } from '@/lib/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTOs (mirror the OpenAPI schemas) ──────────────────────────────────────

export interface TierOption {
    sub_tier: string;
    marketing_name: string;
    price_cents: number;
    token: number;
    /** INTERNAL-ONLY per PRD — never render this in the UI. */
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

// Sub-tier identifiers accepted by POST /memberships/change-tier (`subTierId`).
export type MemberSubTierId = 'visitor' | 'r1' | 'r4' | 'r7' | 'b1' | 'b4' | 'b7' | 'b10';

// Nested sub-tier config on the change-tier response.
export interface MembershipSubTier {
    id: string;
    tier: string; // 'VISITOR' | 'RED' | 'BLUE'
    marketingName: string;
    priceCents: number;
    token: number;
    /** INTERNAL-ONLY per PRD — never render this in the UI. */
    drawPassDefault: number;
    hasSpin: boolean;
    spinDiscountCents: number;
    stripePriceId: string | null;
    createdAt: string;
    updatedAt: string;
}

// Mirrors the live POST /memberships/change-tier response `data`.
export interface MembershipRecord {
    id: string;
    userId: string;
    subTierId: string;
    billingStatus: string;
    activatedAt: string;
    pendingBonusNextCycle: number;
    /** Scheduled paid tier change applied at next renewal, or null. Live since 2026-07-26. */
    pending_upgrade: ScheduledTierChange | null;
    createdAt: string;
    updatedAt: string;
    subTier: MembershipSubTier;
}
/** Display-ready tier fields derived from the live API (never exposes draw_pass). */
export interface TierDisplay {
    price: string;
    tokens: string;
    name: string;
    spin: string | null;
}

// ─── Resource functions ──────────────────────────────────────────────────────

/**
 * Public — active membership tiers. Wrapped in React.cache for per-request
 * dedup; revalidated hourly (pricing changes rarely).
 */
export const getMembershipTiers = cache(() => apiFetch<MembershipTiers>(API.memberships.tiers, { revalidate: 3600 }));

/**
 * My membership. Live GET /memberships/me returns the same shape as the
 * change-tier response (`MembershipRecord`): subTierId, billingStatus (UPPERCASE),
 * activatedAt (cycle anchor), and the nested subTier config. It carries NO
 * `state` (that comes from the session) and NO next-payment/BENY fields.
 */
export const getMyMembership = cache((token: string) =>
    apiFetch<MembershipRecord>(API.memberships.me, { token, cache: 'no-store' })
);

/**
 * Admin: change a member's tier/sub-tier (callable on behalf of any member
 * with an admin token). Body `{ userId, subTierId }`. This sets tier + sub-tier
 * granularity; it does NOT change the member's state.
 */
export const changeMemberTier = (userId: string, subTierId: MemberSubTierId, token: string) => {
    return apiFetch<MembershipRecord>(API.memberships.changeTier, {
        method: 'POST',
        body: { userId, subTierId },
        token
    });
};

// ─── Upgrade / downgrade scheduling (Paid → Paid, applied at next renewal) ────

// Live POST /memberships/upgrade response `data`. Handles BOTH directions —
// direction is inferred from the target sub-tier (there is no separate
// /downgrade endpoint). See docs/BACKEND-ISSUES.md D1 for contract drift.
export interface ScheduledTierChange {
    target_sub_tier: string;
    effective_at: string;
}

/** Schedule a paid tier change for the member's next renewal (no proration). */
export const scheduleMembershipChange = (targetSubTierId: MemberSubTierId, token: string) =>
    apiFetch<ScheduledTierChange>(API.memberships.upgrade, { method: 'POST', body: { targetSubTierId }, token });

/** Cancel a scheduled (pending) tier change before it applies. */
export const cancelScheduledChange = (token: string) =>
    apiFetch<null>(API.memberships.upgrade, { method: 'DELETE', token });

// ─── Membership stats (admin-viewable sub-tier distribution) ─────────────────

// Row as returned by GET /memberships/stats. The API used to send a
// Prisma-raw shape ({ _count: { _all }, subTierId }, plus a "beny" add-on
// row mixed in) — as of 2026-08-16 it sends this flat, snake_case shape
// with the "beny" row already excluded server-side.
interface RawSubTierStat {
    sub_tier_id: string;
    count: number;
}

// Normalized, display-ready count per sub-tier.
export interface SubTierCount {
    subTierId: string;
    count: number;
}

// Canonical display order; unknown ids sort last.
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

/**
 * Admin: member counts grouped by sub-tier. The API returns a sparse, Prisma-raw
 * array ({ _count: { _all }, subTierId }) — this normalizes to { subTierId, count }
 * sorted in canonical tier order. Live counts → no-store.
 */
export const getMembershipStats = cache(async (token: string): Promise<SubTierCount[]> => {
    const raw = await apiFetch<RawSubTierStat[]>(API.memberships.stats, { token, cache: 'no-store' });

    // Defensive: the API previously mixed a "beny" add-on row into this list
    // (a member with BENY is already counted once under their real tier) and
    // has since fixed it server-side — still filtered here in case that
    // regresses, and merged by resolved code in case an unrecognized id ever
    // collides with a real one (subTierCodeOf falls back to VISITOR).
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
