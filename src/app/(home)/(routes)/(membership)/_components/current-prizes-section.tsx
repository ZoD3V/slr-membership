import { getMembershipTiers } from '@/lib/api/resources/memberships';
import { getPublicPrizeContent } from '@/lib/api/resources/prizes';
import { membersCapLabel, minPriceCents, parseAmount, splitLines, toStat, weeklyPriceLabel } from '@/lib/prize-content';
import type { PrizeContent } from '@/types/member';

import { CurrentPrizesContent, type PrizeTierCard } from './current-prizes-content';

// Shown when the prizes CMS or the tier pricing endpoint is unreachable, so the marketing
// page still renders something truthful instead of an error state.
const FALLBACK = {
    pool: '$1900.00',
    stats: [
        { value: '100 Members', label: 'Competing Capped' },
        { value: 'Up To 34 Prizes', label: 'Every Month' },
        { value: '9 In 10 Winning', label: 'Chance Per Year' }
    ],
    membersCap: '100 Members Capped',
    red: {
        price: '$1.50/week',
        weekly: ['$100 Cash', '$75 Cash', '$50 Cash', '$25 Cash', '$10 Cash'],
        monthly: '$5000 Bonus'
    },
    blue: {
        price: '$3/week',
        weekly: ['$500 Cash', '$250 Cash', '$150 Cash', '$100 Cash', '$50 Cash'],
        monthly: '$10000 Bonus'
    }
};

const MONTHLY_NOTE = 'For 1000 New Members';

const RED_THEME = {
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

const BLUE_THEME = {
    name: 'SLR Blue',
    accent: '#6699FF',
    accentGlow: '#6699FF80',
    borderGradient: 'linear-gradient(180deg, #6AACFF 0%, #1A62C0 25%, #0A2E80 50%, #1A62C0 75%, #6AACFF 100%)',
    surface: 'linear-gradient(180deg, #091C4A 0%, #000000 25%, #000000 70%, #0F2C73 100%)',
    pillBorder: 'rgba(102,153,255,0.5)',
    prizeBox: 'rgba(102, 153, 255, 0.08)',
    footerBar: 'linear-gradient(180deg, #5C93FF 0%, #1A53D9 100%)'
};

const perWeekAmount = (price: string) => price.replace('/week', '');

const CurrentPrizesSection = async () => {
    const [content, tiers] = await Promise.all([
        getPublicPrizeContent().catch(() => null as PrizeContent | null),
        getMembershipTiers().catch(() => null)
    ]);

    const poolHeadline = content?.prize_pool_headline?.trim() || FALLBACK.pool;
    const poolAmount = parseAmount(poolHeadline);

    const membersCap = membersCapLabel(content?.stage_label) ?? FALLBACK.membersCap;

    const redMin = tiers ? minPriceCents(tiers.red) : null;
    const blueMin = tiers ? minPriceCents(tiers.blue) : null;
    const redPrice = redMin === null ? FALLBACK.red.price : weeklyPriceLabel(redMin);
    const bluePrice = blueMin === null ? FALLBACK.blue.price : weeklyPriceLabel(blueMin);

    const redWeekly = splitLines(content?.red_weekly);
    const blueWeekly = splitLines(content?.blue_weekly);

    const cards: PrizeTierCard[] = [
        {
            ...RED_THEME,
            price: redPrice,
            membersCap,
            weekly: redWeekly.length > 0 ? redWeekly : FALLBACK.red.weekly,
            monthly: content?.red_monthly?.trim() || FALLBACK.red.monthly,
            monthlyNote: MONTHLY_NOTE,
            footer: `Great prizes for only ${perWeekAmount(redPrice)} a week`
        },
        {
            ...BLUE_THEME,
            price: bluePrice,
            membersCap,
            weekly: blueWeekly.length > 0 ? blueWeekly : FALLBACK.blue.weekly,
            monthly: content?.blue_monthly?.trim() || FALLBACK.blue.monthly,
            monthlyNote: MONTHLY_NOTE,
            footer: '2x the prizes, 2x the rewards'
        }
    ];

    return (
        <CurrentPrizesContent
            poolAmount={poolAmount}
            poolText={poolHeadline}
            stats={[
                toStat(content?.stage_label, FALLBACK.stats[0]),
                toStat(content?.prize_count, FALLBACK.stats[1]),
                toStat(content?.odds, FALLBACK.stats[2])
            ]}
            tiers={cards}
        />
    );
};

export default CurrentPrizesSection;
