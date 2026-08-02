import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminGiveaways } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';

import type { GiveawayOption } from './winner-form';

/** Giveaway options for the winner form's picker. Degrades to an empty list. */
export async function loadGiveawayOptions(): Promise<GiveawayOption[]> {
    const token = await getAccessToken();
    if (!token) return [];

    try {
        // High per_page: the picker needs every giveaway, not just page one.
        const res = await getAdminGiveaways(token, { page: 1, perPage: 100 });

        return res.items.map((g) => ({ id: g.giveaway_id, label: `${g.name} (${g.tier})` }));
    } catch (error) {
        handleApiAuthError(error);

        return [];
    }
}
