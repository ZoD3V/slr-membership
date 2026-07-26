import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { SUB_TIERS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { type Discount, getPublicDiscounts } from '@/lib/api/resources/discounts';
import { getEntryHistory } from '@/lib/api/resources/entries';
import { type ApiGiveaway, getGiveaways, tierGroupFromApi, toGiveaway } from '@/lib/api/resources/giveaways';
import { getMyMembership } from '@/lib/api/resources/memberships';
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

import { DrawStatusCard } from './_components/dashboard/draw-status-card';
import { FeaturedDiscounts } from './_components/dashboard/featured-discounts';
import { Greeting } from './_components/dashboard/greeting';
import { MembershipSummaryCard } from './_components/dashboard/membership-summary-card';
import { QuickActions } from './_components/dashboard/quick-actions';
import { UpcomingGiveaways } from './_components/dashboard/upcoming-giveaways';
import { VisitorUpgradeBanner } from './_components/dashboard/visitor-upgrade-banner';
import { CircleAlert, Gift } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Dashboard · SLR Member'
};

export default async function MemberDashboardPage() {
    const member = await getCurrentMember();
    const token = await getAccessToken();

    // Independent authed reads — allSettled so the giveaways 500 can't blank the
    // membership/cycle cards (per API-INTEGRATION.md degradation rules).
    const [membershipR, entriesR, giveawaysR] = token
        ? await Promise.allSettled([getMyMembership(token), getEntryHistory(token), getGiveaways(token)])
        : [];

    // Any expired-session failure → force logout (never returns).
    for (const result of [membershipR, entriesR, giveawaysR]) {
        if (result?.status === 'rejected') handleApiAuthError(result.reason);
    }

    // Featured offers use the PUBLIC discounts endpoint (no tier gate) so they show
    // for every member, Visitor included. Failure is non-fatal → empty list.
    const publicDiscounts = await getPublicDiscounts().catch(() => [] as Discount[]);

    const membership = membershipR?.status === 'fulfilled' ? membershipR.value : null;
    const cycle = entriesR?.status === 'fulfilled' ? entriesR.value.current_cycle : null;
    const giveaways = giveawaysR?.status === 'fulfilled' ? giveawaysR.value : [];

    const subTier = membership ? subTierCodeOf(membership.subTierId) : member.sub_tier;
    const memberGroup = tierGroupOf(subTier);
    // Visitor is free with no billing/renewal and only the Visitor weekly draw (PRD §2.1).
    const isVisitor = memberGroup === 'visitor';
    const memberTokens = cycle?.total_token ?? 0;

    // Summary (memberships/me + session state + cycle end for next-payment).
    const nextPayment = cycle?.end_at ?? (membership?.activatedAt ? cycleEndFrom(membership.activatedAt) : '');
    const summary: MembershipSummary = {
        sub_tier: subTier,
        state: member.state,
        billing_status: mapBillingStatus(membership?.billingStatus),
        price_cents: membership?.subTier.priceCents ?? SUB_TIERS[subTier].price_cents,
        next_payment_date: nextPayment,
        beny_addon: null // hidden until the BENY endpoint lands (SP4)
    };

    // Live draw-cycle surface (entries/ current_cycle) — real entry_status + tokens + renewal.
    const cycleDraw: DrawStatus | null = cycle
        ? {
              giveaway_id: cycle.cycle_id,
              title: 'Your Entries This Cycle',
              draw_pool: formatDrawPool(memberGroup, member.state),
              prize_label: '-',
              entry_status: cycle.entry_status,
              total_entries: cycle.total_token,
              draws_at: cycle.end_at
          }
        : null;

    // PRD §2.3 "Kartu status undian" — every tier sees their current active
    // giveaway: one they're actually entered into (§4.3 — BLUE covers RED + BLUE)
    // and not yet drawn, soonest first. Single pass: filter + earliest, no sort.
    const nowMs = Date.now();
    let activeGiveaway: ApiGiveaway | undefined;
    let activeDrawsAt = Infinity;
    for (const g of giveaways) {
        const drawsAt = Date.parse(g.draws_at ?? '');
        if (drawsAt > nowMs && drawsAt < activeDrawsAt && isGiveawayEnterable(tierGroupFromApi(g.tier), memberGroup)) {
            activeGiveaway = g;
            activeDrawsAt = drawsAt;
        }
    }

    const activeMapped = activeGiveaway && toGiveaway(activeGiveaway, memberGroup, member.state, memberTokens);
    // Nothing live (between giveaways, or all already drawn) → cycle framing.
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
    const drawEyebrow = giveawayDraw ? 'Current Draw' : 'Current Cycle';
    const drawDateWord = giveawayDraw ? 'Draws' : 'Renews';

    // Featured partner offers — ONLY discounts flagged is_featured, capped. Empty → hidden.
    const featuredDiscounts: Discount[] = publicDiscounts
        .filter((d) => d.is_featured && (d.title?.trim() || d.partner_name?.trim()))
        .slice(0, 6);

    // Upcoming giveaways — exclude the one already shown as the Current Draw.
    const upcomingGiveaways: UpcomingGiveaway[] = giveaways
        .filter((g) => g.giveaway_id !== activeGiveaway?.giveaway_id)
        .slice(0, 6)
        .map((g) => {
            const mapped = toGiveaway(g, memberGroup, member.state);

            return {
                id: mapped.id,
                title: mapped.title,
                tier_group: mapped.tier_group,
                prize_label: mapped.prize_label,
                draws_at: mapped.draws_at,
                locked: mapped.locked
            };
        });

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <Greeting member={member} />

            {isVisitor ? <VisitorUpgradeBanner /> : null}

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
                ) : (
                    <EmptyState
                        icon={Gift}
                        title='No Active Draw'
                        description='Your draw will appear here once your membership is active.'
                        className='h-full w-full max-w-none justify-center lg:col-span-2'
                    />
                )}
            </div>

            <QuickActions />

            {featuredDiscounts.length > 0 && <FeaturedDiscounts discounts={featuredDiscounts} />}

            {upcomingGiveaways.length > 0 ? (
                <UpcomingGiveaways giveaways={upcomingGiveaways} />
            ) : isVisitor ? null : (
                <EmptyState
                    icon={Gift}
                    title='No Upcoming Giveaways'
                    description='Active draws for your tier will show here soon.'
                />
            )}
        </div>
    );
}
