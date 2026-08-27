import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import type { BillingStatus, SubTierCode, TierGroup } from '@/types/member';

import { addDays } from 'date-fns';

export function subTierCodeOf(subTierId: string | undefined): SubTierCode {
    const code = subTierId?.toUpperCase();

    return code && code in SUB_TIERS ? (code as SubTierCode) : 'VISITOR';
}

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

export function cycleEndFrom(activatedAtIso: string): string {
    return addDays(new Date(activatedAtIso), 28).toISOString();
}

export function getSubTierMeta(code: SubTierCode) {
    return SUB_TIERS[code];
}

export function tierGroupOf(code: SubTierCode): TierGroup {
    return SUB_TIERS[code].group;
}

const TIER_RANK: Record<TierGroup, number> = { visitor: 0, red: 1, blue: 2 };

export function tierRank(group: TierGroup): number {
    return TIER_RANK[group];
}

export function visibleGiveawayTabs(memberGroup: TierGroup): TierGroup[] {
    return memberGroup === 'visitor' ? [] : ['red', 'blue'];
}

export function isGiveawayLocked(giveawayTier: TierGroup, memberGroup: TierGroup): boolean {
    return tierRank(giveawayTier) > tierRank(memberGroup);
}

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

export function formatAud(cents: number): string {
    return audFormatter.format(cents / 100);
}

export function formatDrawPool(group: TierGroup, state: string): string {
    return `SLR ${TIER_VISUALS[group].poolLabel} · ${state}`;
}

export function subTierFromGroupAndName(
    group: TierGroup,
    marketingName: string | null | undefined
): SubTierCode | null {
    if (group === 'visitor') return 'VISITOR';
    if (!marketingName) return null;
    const wanted = marketingName.trim().toLowerCase();

    const match = Object.values(SUB_TIERS).find((m) => m.group === group && m.marketingName.toLowerCase() === wanted);

    return match?.code ?? null;
}

export function formatAdminTierName(code: SubTierCode): string {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';

    return `${TIER_VISUALS[meta.group].poolLabel} ${meta.marketingName} (${meta.label})`;
}

export function formatTierName(code: SubTierCode): string {
    const meta = SUB_TIERS[code];
    if (meta.group === 'visitor') return 'Visitor';

    return `SLR ${TIER_VISUALS[meta.group].poolLabel} · ${meta.marketingName}`;
}

const AEST_TIME_ZONE = 'Australia/Sydney';

function toDate(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const d = new Date(iso);

    return Number.isNaN(d.getTime()) ? null : d;
}

function aestParts(date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
    const parts = new Intl.DateTimeFormat('en-US', { ...options, timeZone: AEST_TIME_ZONE }).formatToParts(date);

    return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

export function formatShortDate(iso: string | null | undefined): string {
    const d = toDate(iso);
    if (!d) return '-';
    const p = aestParts(d, { day: 'numeric', month: 'short', year: 'numeric' });

    return `${p.day} ${p.month} ${p.year}`;
}

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
