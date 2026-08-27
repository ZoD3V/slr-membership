import type { SubTierCode, TierGroup } from '@/types/member';

export interface SubTierMeta {
    code: SubTierCode;
    group: TierGroup;
    label: string;
    marketingName: string;
    tokens: number;
    price_cents: number;
    badgeIcon: string | null;
}

export const SUB_TIERS: Record<SubTierCode, SubTierMeta> = {
    VISITOR: {
        code: 'VISITOR',
        group: 'visitor',
        label: 'Visitor',
        marketingName: 'Visitor',
        tokens: 1,
        price_cents: 0,
        badgeIcon: null
    },
    R1: {
        code: 'R1',
        group: 'red',
        label: 'R1',
        marketingName: 'Standard',
        tokens: 1,
        price_cents: 1000,
        badgeIcon: '/icons/ic-list-slr-red-reward-1.webp'
    },
    R4: {
        code: 'R4',
        group: 'red',
        label: 'R4',
        marketingName: 'Plus',
        tokens: 4,
        price_cents: 2000,
        badgeIcon: '/icons/ic-list-slr-red-reward-2.webp'
    },
    R7: {
        code: 'R7',
        group: 'red',
        label: 'R7',
        marketingName: 'Premium',
        tokens: 7,
        price_cents: 3000,
        badgeIcon: '/icons/ic-list-slr-red-reward-3.webp'
    },
    B1: {
        code: 'B1',
        group: 'blue',
        label: 'B1',
        marketingName: 'Standard',
        tokens: 1,
        price_cents: 2600,
        badgeIcon: '/icons/ic-list-slr-blue-reward-1.webp'
    },
    B4: {
        code: 'B4',
        group: 'blue',
        label: 'B4',
        marketingName: 'Plus',
        tokens: 4,
        price_cents: 3900,
        badgeIcon: '/icons/ic-list-slr-blue-reward-2.webp'
    },
    B7: {
        code: 'B7',
        group: 'blue',
        label: 'B7',
        marketingName: 'Premium',
        tokens: 7,
        price_cents: 5200,
        badgeIcon: '/icons/ic-list-slr-blue-reward-3.webp'
    },
    B10: {
        code: 'B10',
        group: 'blue',
        label: 'B10',
        marketingName: 'Elite',
        tokens: 10,
        price_cents: 6500,
        badgeIcon: '/icons/ic-list-slr-blue-reward-4.webp'
    }
};

export const SPIN_ELIGIBLE_SUB_TIERS: ReadonlySet<SubTierCode> = new Set(['R4', 'R7', 'B4', 'B7', 'B10']);

export interface TierVisual {
    label: string;
    poolLabel: string;
    textClass: string;
    badgeBg: string;
    badgeBorder: string;
    cardArt: string | null;
}

export const TIER_VISUALS: Record<TierGroup, TierVisual> = {
    visitor: {
        label: 'Visitor',
        poolLabel: 'Visitor',
        textClass: 'text-slr-dim',
        badgeBg: 'linear-gradient(154.36deg, #141820 0.82%, #1E2530 49.73%, #141820 98.65%)',
        badgeBorder: '#A0B4D259',
        cardArt: null
    },
    red: {
        label: 'RED',
        poolLabel: 'Red',
        textClass: 'text-[#E88888]',
        badgeBg: 'linear-gradient(154.36deg, #1C0308 0.82%, #2A0810 49.73%, #1A0306 98.65%)',
        badgeBorder: '#C8152E66',
        cardArt: '/icons/ic-slr-red-reward.webp'
    },
    blue: {
        label: 'BLUE',
        poolLabel: 'Blue',
        textClass: 'text-[#7FB0F5]',
        badgeBg: 'linear-gradient(154.36deg, #0E1828 0.82%, #142034 49.73%, #0E1828 98.65%)',
        badgeBorder: '#2878E84D',
        cardArt: '/icons/ic-slr-blue-reward.webp'
    }
};
