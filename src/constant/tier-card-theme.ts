export type TierCardTheme = {
    name: string;
    accent: string;
    accentGlow: string;
    borderGradient: string;
    surface: string;
    pillBorder: string;
    prizeBox: string;
    footerBar: string;
    /** Red reuses the blue money artwork, rotated. */
    moneyFilter?: string;
};

export const MONEY_ARTWORK = '/images/clean_money_blue.jpg';

export const RED_TIER_CARD: TierCardTheme = {
    name: 'SLR Red',
    accent: '#F24040',
    accentGlow: '#F2404080',
    borderGradient: 'linear-gradient(180deg, #FF6B7A 10%, #C8152E 25%, #8B0010 75.24%, #C8152E 87.62%, #FF6B7A 100%)',
    surface: 'linear-gradient(180deg, #3D050C 0%, #000000 25%, #000000 70%, #4A0813 100%)',
    pillBorder: 'rgba(242,64,64,0.5)',
    prizeBox: 'rgba(240, 33, 33, 0.08)',
    footerBar: 'linear-gradient(180deg, #FF4D5B 0%, #B31222 100%)',
    moneyFilter: 'hue-rotate(145deg)'
};

export const BLUE_TIER_CARD: TierCardTheme = {
    name: 'SLR Blue',
    accent: '#6699FF',
    accentGlow: '#6699FF80',
    borderGradient: 'linear-gradient(180deg, #6AACFF 0%, #1A62C0 25%, #0A2E80 50%, #1A62C0 75%, #6AACFF 100%)',
    surface: 'linear-gradient(180deg, #091C4A 0%, #000000 25%, #000000 70%, #0F2C73 100%)',
    pillBorder: 'rgba(102,153,255,0.5)',
    prizeBox: 'rgba(102, 153, 255, 0.08)',
    footerBar: 'linear-gradient(180deg, #5C93FF 0%, #1A53D9 100%)'
};
