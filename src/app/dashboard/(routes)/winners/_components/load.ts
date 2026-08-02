import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminGiveaways } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { formatDateTime, formatShortDate } from '@/lib/member';

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

        return res.items.map((g) => ({
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

/** Pre-formatted schedule for one giveaway (AEST), ready to drop into a table cell. */
export interface GiveawaySchedule {
    opens: string;
    closes: string;
    draws: string;
}

/**
 * `giveaway_id` → its schedule.
 *
 * `GET /admin/winners` embeds only a giveaway STUB (id/name/tier/type/prize —
 * verified against the live OpenAPI 2026-08-03), so the Opens/End/Draws columns
 * have no source on the winners payload itself. Joining by `giveaway_id` against
 * the giveaways list is what fills them; one giveaway has one winner, so the
 * lookup is 1:1.
 *
 * Never throws — a failed lookup leaves the map empty and the columns fall back
 * to '-' rather than blanking the whole winners table.
 */
export async function loadGiveawaySchedules(): Promise<Map<string, GiveawaySchedule>> {
    const schedules = new Map<string, GiveawaySchedule>();
    const token = await getAccessToken();
    if (!token) return schedules;

    try {
        // Follows pagination: a winner recorded against an older giveaway would
        // otherwise miss its dates once the list grows past one page.
        for (let page = 1; ; page++) {
            const res = await getAdminGiveaways(token, { page, perPage: MAX_PER_PAGE });

            for (const g of res.items) {
                schedules.set(g.giveaway_id, {
                    opens: formatDateTime(g.opens_at),
                    closes: formatDateTime(g.closes_at),
                    draws: formatDateTime(g.draws_at)
                });
            }

            if (res.items.length < MAX_PER_PAGE) break;
        }
    } catch (error) {
        handleApiAuthError(error);
    }

    return schedules;
}
