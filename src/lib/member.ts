import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import type { BillingStatus, SubTierCode, TierGroup } from '@/types/member';

import { addDays } from 'date-fns';

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

/**
 * Resolve the exact sub-tier from a group plus the marketing name the admin list
 * returns. The admin member list sends only `tier: 'Plus'` with no group, but
 * marketing names are unique WITHIN a group, so ('red', 'Plus') → R4 exactly.
 */
export function subTierFromGroupAndName(
    group: TierGroup,
    marketingName: string | null | undefined
): SubTierCode | null {
    // Visitor has exactly one sub-tier — no marketing-name disambiguation needed,
    // and some accounts' `tier` field comes back as a BENY add-on product name
    // instead of the real membership name, which would otherwise fail to match.
    if (group === 'visitor') return 'VISITOR';
    if (!marketingName) return null;
    const wanted = marketingName.trim().toLowerCase();

    const match = Object.values(SUB_TIERS).find((m) => m.group === group && m.marketingName.toLowerCase() === wanted);

    return match?.code ?? null;
}

/** Admin-facing, unambiguous tier name — "Red Plus (R4)", "Blue Premium (B7)", "Visitor". */
export function formatAdminTierName(code: SubTierCode): string {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';

    return `${TIER_VISUALS[meta.group].poolLabel} ${meta.marketingName} (${meta.label})`;
}

/** Customer-facing tier name — "SLR Red · Plus", "SLR Blue · Elite", "Visitor". Never shows the code. */
export function formatTierName(code: SubTierCode): string {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';

    return `SLR ${TIER_VISUALS[meta.group].poolLabel} · ${meta.marketingName}`;
}

/**
 * Every timestamp here is an Australian business event — 28-day billing cycles,
 * draw times, renewals — so dates render in Australian Eastern Time no matter
 * where the viewer sits. The IANA zone (not a fixed +10:00) is what makes the
 * AEST/AEDT switch automatic. Formatting server-side and client-side against the
 * same explicit zone also keeps SSR and hydration in agreement.
 */
const AEST_TIME_ZONE = 'Australia/Sydney';

/** Parsed date, or `null` for missing/invalid input — the shared guard for the formatters below. */
function toDate(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const d = new Date(iso);

    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Date pieces for `date` rendered in AEST, keyed by part type.
 * Locale is pinned to en-US only to keep the part VALUES stable ('Aug', 'PM');
 * callers assemble the order themselves, so the locale never reaches the output.
 */
function aestParts(date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
    const parts = new Intl.DateTimeFormat('en-US', { ...options, timeZone: AEST_TIME_ZONE }).formatToParts(date);

    return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

/** Short date in AEST, e.g. "28 Jul 2026". Returns '-' for missing/invalid input (never throws). */
export function formatShortDate(iso: string | null | undefined): string {
    const d = toDate(iso);
    if (!d) return '-';
    const p = aestParts(d, { day: 'numeric', month: 'short', year: 'numeric' });

    return `${p.day} ${p.month} ${p.year}`;
}

/** Full date + time in AEST, e.g. "7 Aug 2026 08:00 PM". Returns '-' for missing/invalid input. */
export function formatDateTime(iso: string | null | undefined): string {
    const d = toDate(iso);
    if (!d) return '-';
    const p = aestParts(d, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return `${p.day} ${p.month} ${p.year} ${p.hour}:${p.minute} ${p.dayPeriod}`;
}

/** Draw date + time in AEST, e.g. "Fri, 3 Jul · 8:00 PM". Returns '-' for missing/invalid input. */
export function formatDrawDateTime(iso: string | null | undefined): string {
    const d = toDate(iso);
    if (!d) return '-';
    const p = aestParts(d, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${p.weekday}, ${p.day} ${p.month} · ${p.hour}:${p.minute} ${p.dayPeriod}`;
}
