import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminMemberListItem, getAdminMembersByTier } from '@/lib/api/resources/admin';
import { type SubTierCount, getMembershipStats } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { formatAdminTierName, subTierFromGroupAndName } from '@/lib/member';
import type { TierGroup } from '@/types/member';

import { SubTierStats } from './_components/sub-tier-stats';
import { type MemberRow, MembersClient } from './members-client';
import { CircleAlert } from 'lucide-react';

const TIER_GROUPS: TierGroup[] = ['visitor', 'red', 'blue'];

// The list row carries only a marketing name ('Plus') with no group, so one
// query per group is what tells us which group each row belongs to — far
// cheaper than a detail fetch per member, and it also lifts the old 20-row
// default page that hid most of the members.

export default async function MembersPage() {
    const token = await getAccessToken();

    // Independent fetches — parallel, and settle independently so a broken
    // members list cannot blank the stats card.
    const [statsResult, ...groupResults] = await Promise.allSettled([
        token ? getMembershipStats(token) : Promise.resolve<SubTierCount[]>([]),
        ...TIER_GROUPS.map((tier) =>
            token ? getAdminMembersByTier(token, tier) : Promise.resolve<AdminMemberListItem[]>([])
        )
    ]);

    if (statsResult.status === 'rejected') handleApiAuthError(statsResult.reason);
    for (const r of groupResults) {
        if (r.status === 'rejected') handleApiAuthError(r.reason);
    }

    const statsOk = statsResult.status === 'fulfilled';
    const listOk = groupResults.some((r) => r.status === 'fulfilled');

    const counts: SubTierCount[] = statsOk ? statsResult.value : [];
    const total = counts.reduce((sum, c) => sum + c.count, 0);

    const rows: MemberRow[] = groupResults.flatMap((result, i) => {
        if (result.status !== 'fulfilled') return [];
        const group = TIER_GROUPS[i];

        return result.value.map((m) => {
            // Group is known from WHICH request returned this row; the marketing
            // name then pins the exact sub-tier ('red' + 'Plus' → R4).
            const code = subTierFromGroupAndName(group, m.tier);

            return {
                id: m.user_id,
                name: m.full_name || '-',
                email: m.email || '-',
                phone: m.phone || '-',
                dob: m.dob ? m.dob.slice(0, 10) : '-',
                tier: code ? formatAdminTierName(code) : m.tier || '-',
                // Not a column — drives the parent-tier filter in the client.
                tierGroup: group,
                state: m.state || '-',
                status: m.status || '-',
                billing_status: m.billing_status || '-',
                draw_pass: m.draw_pass ?? '-',
                registered_at: m.created_at ? m.created_at.slice(0, 10) : '-'
            };
        });
    });

    rows.sort((a, b) => b.registered_at.localeCompare(a.registered_at));

    if (!statsOk && !listOk) {
        return (
            <DashboardPageShell>
                <Heading title='Members' description='Registered members' />
                <DashboardEmptyState
                    icon={CircleAlert}
                    title='Could not load members'
                    description='The members area is unavailable right now. Please try again shortly.'
                />
            </DashboardPageShell>
        );
    }

    return (
        <DashboardPageShell>
            <Heading title='Members' description='Registered members' />

            {statsOk ? <SubTierStats counts={counts} total={total} /> : null}

            {listOk ? (
                <MembersClient data={rows} />
            ) : (
                <DashboardEmptyState
                    icon={CircleAlert}
                    title='Member list unavailable'
                    description='Sub-tier totals are shown above. The full member list is temporarily unavailable.'
                />
            )}
        </DashboardPageShell>
    );
}
