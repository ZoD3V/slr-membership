import { BLUE_TIER_CARD, RED_TIER_CARD } from '@/constant/tier-card-theme';
import { getMembershipTiers } from '@/lib/api/resources/memberships';
import { getPublicPrizeContent } from '@/lib/api/resources/prizes';
import {
    GRAND_BONUS,
    membersCapLabel,
    membersCount,
    minPriceCents,
    parseAmount,
    splitLines,
    toStat,
    weeklyPriceLabel
} from '@/lib/prize-content';
import type { PrizeContent } from '@/types/member';

import { CurrentPrizesContent, type PrizeTierCard } from './current-prizes-content';

// Shown when the prizes CMS or the tier pricing endpoint is unreachable, so the marketing
// page still renders something truthful instead of an error state.
const FALLBACK = {
    pool: '$7,380',
    stats: [
        { value: '100 Members', label: 'Competing Capped' },
        { value: 'Up To 34 Prizes', label: 'Every Month' },
        { value: '9 In 10 Winning', label: 'Chance Per Year' }
    ],
    membersCap: '100 Members Capped',
    membersCount: '100',
    red: {
        price: '$1.50/week',
        weekly: ['$200 Cash', '$150 Cash', '$100 Cash', '$50 Cash', '$25 Cash'],
        monthly: '$500 Cash/Month'
    },
    blue: {
        price: '$3/week',
        weekly: ['$400 Cash', '$300 Cash', '$150 Cash', '$70 Cash', '$25 Cash'],
        monthly: '$1,000 Cash/Month'
    }
};

const unlockNote = (members: string) => `Unlocked at ${members} Members`;

const perWeekAmount = (price: string) => price.replace('/week', '');

const CurrentPrizesSection = async () => {
    const [content, tiers] = await Promise.all([
        getPublicPrizeContent().catch(() => null as PrizeContent | null),
        getMembershipTiers().catch(() => null)
    ]);

    const poolHeadline = content?.prize_pool_headline?.trim() || FALLBACK.pool;
    const poolAmount = parseAmount(poolHeadline);

    const membersCap = membersCapLabel(content?.stage_label) ?? FALLBACK.membersCap;
    const monthlyNote = unlockNote(membersCount(content?.stage_label) ?? FALLBACK.membersCount);
    const bonusNote = unlockNote(GRAND_BONUS.membersCount);

    const redMin = tiers ? minPriceCents(tiers.red) : null;
    const blueMin = tiers ? minPriceCents(tiers.blue) : null;
    const redPrice = redMin === null ? FALLBACK.red.price : weeklyPriceLabel(redMin);
    const bluePrice = blueMin === null ? FALLBACK.blue.price : weeklyPriceLabel(blueMin);

    const redWeekly = splitLines(content?.red_weekly);
    const blueWeekly = splitLines(content?.blue_weekly);

    const cards: PrizeTierCard[] = [
        {
            ...RED_TIER_CARD,
            price: redPrice,
            membersCap,
            weekly: redWeekly.length > 0 ? redWeekly : FALLBACK.red.weekly,
            monthly: content?.red_monthly?.trim() || FALLBACK.red.monthly,
            monthlyNote,
            bonus: { amount: GRAND_BONUS.red, note: bonusNote },
            footer: `Great prizes for only ${perWeekAmount(redPrice)} a week`
        },
        {
            ...BLUE_TIER_CARD,
            price: bluePrice,
            membersCap,
            weekly: blueWeekly.length > 0 ? blueWeekly : FALLBACK.blue.weekly,
            monthly: content?.blue_monthly?.trim() || FALLBACK.blue.monthly,
            monthlyNote,
            bonus: { amount: GRAND_BONUS.blue, note: bonusNote },
            footer: 'Double prizes, double rewards'
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
