import type { AdminGiveaway } from '@/lib/api/resources/giveaways';
import { formatShortDate } from '@/lib/member';

import type { GiveawayRow } from '../giveaways-client';

export function toGiveawayRow(g: AdminGiveaway): GiveawayRow {
    return {
        id: g.giveaway_id,
        name: g.name || '-',
        tier: g.tier || '-',
        type: g.type || '-',
        // Server-derived; don't recompute from the dates.
        status: g.status || '-',
        prize: g.prize || '-',
        entries: g.entry_count ?? 0,
        winners: g.winner_count ?? 0,
        closes: formatShortDate(g.closes_at),
        draws: formatShortDate(g.draws_at)
    };
}
