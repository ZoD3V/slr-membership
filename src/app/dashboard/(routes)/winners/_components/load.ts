import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminGiveaways } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { formatShortDate } from '@/lib/member';

import type { GiveawayOption } from './winner-form';

/** Server-enforced ceiling: per_page above this returns 400 VALIDATION_ERROR. */
const MAX_PER_PAGE = 100;

/** Giveaway options for the winner form's picker. Degrades to an empty list. */
export async function loadGiveawayOptions(): Promise<GiveawayOption[]> {
    const token = await getAccessToken();
    if (!token) return [];

    try {
        // High per_page: the picker needs every giveaway, not just page one.
        const res = await getAdminGiveaways(token, { page: 1, perPage: MAX_PER_PAGE });

        return res.map((g) => ({
            id: g.giveaway_id,
            label: g.name || '-',
            tier: g.tier,
            opens: formatShortDate(g.opens_at),
            closes: formatShortDate(g.closes_at),
            draws: formatShortDate(g.draws_at)
        }));
    } catch (error) {
        handleApiAuthError(error);

        return [];
    }
}
