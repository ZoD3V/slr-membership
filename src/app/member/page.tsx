import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { SPIN_ELIGIBLE_SUB_TIERS, SUB_TIERS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { type Discount, getPublicDiscounts } from '@/lib/api/resources/discounts';
import { getEntryHistory, isCycleExpired } from '@/lib/api/resources/entries';
import { type ApiGiveaway, getGiveaways, tierGroupFromApi, toGiveaway } from '@/lib/api/resources/giveaways';
import { getMyMembership } from '@/lib/api/resources/memberships';
import { getSpinStatus } from '@/lib/api/resources/spin';
import { getAccessToken } from '@/lib/api/server';
import {
    cycleEndFrom,
    formatDrawDateTime,
    formatDrawPool,
    isGiveawayEnterable,
    mapBillingStatus,
    subTierCodeOf,
    tierGroupOf
} from '@/lib/member';
import type { DrawStatus, MembershipSummary, UpcomingGiveaway } from '@/types/member';

import { CancelledMembershipBanner } from './_components/dashboard/cancelled-membership-banner';
import { DrawStatusCard } from './_components/dashboard/draw-status-card';
import { EmailVerificationBanner } from './_components/dashboard/email-verification-banner';
import { FeaturedDiscounts } from './_components/dashboard/featured-discounts';
import { Greeting } from './_components/dashboard/greeting';
import { MembershipSummaryCard } from './_components/dashboard/membership-summary-card';
import { QuickActions } from './_components/dashboard/quick-actions';
import { RenewalSpinCard } from './_components/dashboard/renewal-spin-card';
import { UpcomingGiveaways } from './_components/dashboard/upcoming-giveaways';
import { VisitorUpgradeBanner } from './_components/dashboard/visitor-upgrade-banner';
import { CircleAlert, Gift } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Dashboard · SLR Member'
};

export default async function MemberDashboardPage() {
    const member = await getCurrentMember();
    const token = await getAccessToken();

    const spinEligible = SPIN_ELIGIBLE_SUB_TIERS.has(member.sub_tier);

    const [membershipR, entriesR, giveawaysR, spinR, billingR] = token
        ? await Promise.allSettled([
              getMyMembership(token),
              getEntryHistory(token),
              getGiveaways(token),
              spinEligible ? getSpinStatus(token) : Promise.resolve(null),
              (async () => {
                  const { getBillingStatus } = await import('@/lib/api/resources/billing');

                  return getBillingStatus(token);
              })()
          ])
        : [];

    for (const result of [membershipR, entriesR, giveawaysR, spinR, billingR]) {
        if (result?.status === 'rejected') handleApiAuthError(result.reason);
    }

    const publicDiscounts =
        tierGroupOf(member.sub_tier) === 'visitor' ? [] : await getPublicDiscounts().catch(() => [] as Discount[]);

    const membership = membershipR?.status === 'fulfilled' ? membershipR.value : null;
    const rawCycle = entriesR?.status === 'fulfilled' ? entriesR.value.current_cycle : null;

    const cycle =
        rawCycle && (rawCycle.tier || '').toLowerCase() !== 'beny' && !isCycleExpired(rawCycle) ? rawCycle : null;
    const giveaways = giveawaysR?.status === 'fulfilled' ? giveawaysR.value : [];

    const giveawaysFailed = giveawaysR?.status === 'rejected';
    const drawDataFailed = giveawaysFailed || entriesR?.status === 'rejected';
    const billing = billingR?.status === 'fulfilled' ? billingR.value : null;

    const spin = spinR?.status === 'fulfilled' ? spinR.value : null;
    const renewalSpin = spin?.available && (spin.moment === 'renewal' || spin.moment === 'pre_renewal') ? spin : null;

    const subTier = membership ? subTierCodeOf(membership.subTierId) : member.sub_tier;
    const memberGroup = tierGroupOf(subTier);

    const isVisitor = memberGroup === 'visitor';
    const memberTokens = cycle?.total_token ?? 0;

    // Stripe period end is the billing source of truth; cycle end_at can drift from it
    const nextPayment =
        billing?.next_renewal_at ??
        cycle?.end_at ??
        (membership?.activatedAt ? cycleEndFrom(membership.activatedAt) : '');
    const summary: MembershipSummary = {
        sub_tier: subTier,
        state: member.state,
        billing_status: membership ? mapBillingStatus(membership.billingStatus) : null,
        price_cents: membership?.subTier.priceCents ?? SUB_TIERS[subTier].price_cents,
        next_payment_date: nextPayment,
        beny_addon: null,
        cancel_at_period_end: billing?.cancel_at_period_end ?? false
    };

    const cycleDraw: DrawStatus | null = cycle
        ? {
              giveaway_id: cycle.cycle_id,
              title: 'Your Entries This Cycle',
              draw_pool: formatDrawPool(memberGroup, member.state),
              prize_label: '-',
              entry_status: cycle.entry_status,
              total_entries: cycle.total_token,
              draws_at: cycle.end_at ?? ''
          }
        : null;

    const nowMs = Date.now();
    let activeGiveaway: ApiGiveaway | undefined;
    let activeDrawsAt = Infinity;
    for (const g of giveaways) {
        const drawsAt = Date.parse(g.draws_at ?? '');
        if (drawsAt > nowMs && drawsAt < activeDrawsAt && tierGroupFromApi(g.tier) === memberGroup) {
            activeGiveaway = g;
            activeDrawsAt = drawsAt;
        }
    }

    const activeMapped = activeGiveaway && toGiveaway(activeGiveaway, memberGroup, member.state, memberTokens);

    const giveawayDraw: DrawStatus | null = activeMapped
        ? {
              giveaway_id: activeMapped.id,
              title: activeMapped.title,
              draw_pool: activeMapped.draw_pool,
              prize_label: activeMapped.prize_label,
              entry_status: activeMapped.entry_status,
              total_entries: activeMapped.total_entries,
              draws_at: activeMapped.draws_at
          }
        : null;

    const draw = giveawayDraw ?? cycleDraw;
    const isCancelled = summary.billing_status === 'canceled';

    const drawEyebrow = giveawayDraw ? 'Current Draw' : 'Current Cycle';
    const drawDateWord = isVisitor || isCancelled ? 'Ends' : giveawayDraw ? 'Draws' : 'Renews';

    const featuredDiscounts: Discount[] = publicDiscounts
        .filter((d) => d.is_featured && (d.title?.trim() || d.partner_name?.trim()))
        .slice(0, 6);

    const drawTimeMs = (g: ApiGiveaway) => {
        const t = Date.parse(g.draws_at ?? '');

        return Number.isNaN(t) ? Infinity : t;
    };
    const upcomingGiveaways: UpcomingGiveaway[] = giveaways
        .filter((g) => drawTimeMs(g) > nowMs && tierGroupFromApi(g.tier) === memberGroup)
        .sort((a, b) => drawTimeMs(a) - drawTimeMs(b))
        .slice(0, 6)
        .map((g) => {
            const mapped = toGiveaway(g, memberGroup, member.state);

            return {
                id: mapped.id,
                title: mapped.title,
                tier_group: mapped.tier_group,
                draw_type: mapped.draw_type,
                prize_label: mapped.prize_label,
                draws_at: mapped.draws_at,
                locked: mapped.locked
            };
        });

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-6 md:space-y-12 md:px-6 md:py-8'>
            <Greeting member={member} />

            {isVisitor ? <VisitorUpgradeBanner /> : null}

            {!isVisitor && !member.email_verified_at ? <EmailVerificationBanner /> : null}

            {!isVisitor && billing?.cancel_at_period_end && cycle?.end_at ? (
                <CancelledMembershipBanner accessEndsAt={cycle.end_at} />
            ) : null}

            {renewalSpin ? (
                <RenewalSpinCard discount={renewalSpin.discount_cents / 100} expiresAt={renewalSpin.expires_at} />
            ) : null}

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {membership || cycle ? (
                    <MembershipSummaryCard summary={summary} isVisitor={isVisitor} className='lg:col-span-1' />
                ) : (
                    <EmptyState
                        icon={CircleAlert}
                        title='Membership Unavailable'
                        description='We couldn’t load your membership right now. Please try again shortly.'
                        className='h-full w-full max-w-none justify-center lg:col-span-1'
                    />
                )}
                {draw ? (
                    <DrawStatusCard
                        draw={draw}
                        drawsAtLabel={formatDrawDateTime(draw.draws_at)}
                        eyebrow={drawEyebrow}
                        dateWord={drawDateWord}
                        className='lg:col-span-2'
                    />
                ) : drawDataFailed ? (
                    <EmptyState
                        icon={CircleAlert}
                        title='Draw Status Unavailable'
                        description='We couldn’t load your entries and draws right now. Your entries are unaffected — please try again shortly.'
                        className='h-full w-full max-w-none justify-center lg:col-span-2'
                    />
                ) : (
                    <EmptyState
                        icon={Gift}
                        title='No Active Draw'
                        description='Your draw will appear here once your membership is active.'
                        className='h-full w-full max-w-none justify-center lg:col-span-2'
                    />
                )}
            </div>

            <QuickActions isVisitor={isVisitor} />

            {!isVisitor && featuredDiscounts.length > 0 && <FeaturedDiscounts discounts={featuredDiscounts} />}

            {upcomingGiveaways.length > 0 ? (
                <UpcomingGiveaways giveaways={upcomingGiveaways} />
            ) : giveawaysFailed ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Prize Draws Unavailable'
                    description='We couldn’t load the active draws right now. Please try again shortly.'
                />
            ) : isVisitor ? null : (
                <EmptyState
                    icon={Gift}
                    title='No Active Prize Draws'
                    description='Active draws for your tier will show here soon.'
                />
            )}
        </div>
    );
}
