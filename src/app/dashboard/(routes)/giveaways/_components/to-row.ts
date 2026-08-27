import type { AdminGiveaway } from '@/lib/api/resources/giveaways';
import { formatDateTime } from '@/lib/member';

import type { GiveawayRow } from '../giveaways-client';

export function toGiveawayRow(g: AdminGiveaway): GiveawayRow {
    return {
        id: g.giveaway_id,
        name: g.name || '-',
        tier: g.tier || '-',
        type: g.type || '-',

        status: g.status || '-',
        prize: g.prize || '-',
        entries: g.entry_count ?? 0,
        winners: g.winner_count ?? 0,
        opens: formatDateTime(g.opens_at),
        closes: formatDateTime(g.closes_at),
        draws: formatDateTime(g.draws_at)
    };
}
