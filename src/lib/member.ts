import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import type { BillingStatus, SubTierCode, TierGroup } from '@/types/member';

import { addDays, format } from 'date-fns';

// ── API → UI mappers (memberships/me + entries) ──────────────────────────────

/** Live subTierId is lowercase (`r4`); the UI keys off the uppercase `SubTierCode`. */
export function subTierCodeOf(subTierId: string | undefined): SubTierCode {
    const code = subTierId?.toUpperCase();

    return code && code in SUB_TIERS ? (code as SubTierCode) : 'VISITOR';
}

/** Live billingStatus is UPPERCASE (`ACTIVE`); map to the UI `BillingStatus`, defaulting to active. */
export function mapBillingStatus(raw: string | undefined): BillingStatus {
    switch (raw?.toUpperCase()) {
        case 'PAST_DUE':
            return 'past_due';
        case 'CANCELED':
        case 'CANCELLED':
            return 'canceled';
        default:
            return 'active';
    }
}

/** Cycle is a flat 28 days from the payment anchor — used to derive the next renewal when the API omits it. */
export function cycleEndFrom(activatedAtIso: string): string {
    return addDays(new Date(activatedAtIso), 28).toISOString();
}

export function getSubTierMeta(code: SubTierCode) {
    return SUB_TIERS[code];
}

export function tierGroupOf(code: SubTierCode): TierGroup {
    return SUB_TIERS[code].group;
}

// ── Giveaway tier-access rules (PRD §4.3 role visibility) ─────────────────────

const TIER_RANK: Record<TierGroup, number> = { visitor: 0, red: 1, blue: 2 };

export function tierRank(group: TierGroup): number {
    return TIER_RANK[group];
}

/**
 * Tier tabs a member may see on the Giveaways page (PRD §4.3).
 * Visitor sees NO RED/BLUE segmented control — only the weekly Visitor draw.
 * RED and BLUE members both see the RED and BLUE tabs.
 */
export function visibleGiveawayTabs(memberGroup: TierGroup): TierGroup[] {
    return memberGroup === 'visitor' ? [] : ['red', 'blue'];
}

/**
 * A giveaway is locked (upsell) when its tier is above the member's tier.
 * Equal/below → the member is entered (BLUE has full access to RED + BLUE).
 */
export function isGiveawayLocked(giveawayTier: TierGroup, memberGroup: TierGroup): boolean {
    return tierRank(giveawayTier) > tierRank(memberGroup);
}

/**
 * Whether the member is actually entered into this giveaway's draw (PRD §4.3).
 * Visitor → the Visitor weekly draw only. Paid → their own tier plus any below it,
 * but never the Visitor draw (paid tabs are RED/BLUE only, §4.3). So BLUE enters
 * RED + BLUE, RED enters RED only.
 */
export function isGiveawayEnterable(giveawayTier: TierGroup, memberGroup: TierGroup): boolean {
    if (memberGroup === 'visitor') return giveawayTier === 'visitor';

    return giveawayTier !== 'visitor' && !isGiveawayLocked(giveawayTier, memberGroup);
}

const audFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

/** Format integer cents (AUD) as currency, e.g. 2000 -> "$20", 3950 -> "$39.50". */
export function formatAud(cents: number): string {
    return audFormatter.format(cents / 100);
}

/** Draw pool = state + tier, e.g. "SLR Red · NSW". */
export function formatDrawPool(group: TierGroup, state: string): string {
    return `SLR ${TIER_VISUALS[group].poolLabel} · ${state}`;
}

/** Customer-facing tier name — "SLR Red · Plus", "SLR Blue · Elite", "Visitor". Never shows the code. */
export function formatTierName(code: SubTierCode): string {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';

    return `SLR ${TIER_VISUALS[meta.group].poolLabel} · ${meta.marketingName}`;
}

/** Short date, e.g. "28 Jul 2026". Returns '-' for missing/invalid input (never throws). */
export function formatShortDate(iso: string | null | undefined): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';

    return format(d, 'd MMM yyyy');
}

/** Draw date + time, e.g. "Fri, 3 Jul · 8:00 PM". Returns '-' for missing/invalid input. */
export function formatDrawDateTime(iso: string | null | undefined): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';

    return format(d, 'EEE, d MMM · h:mm a');
}
