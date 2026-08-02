import { notFound } from 'next/navigation';

import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminWinners } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';

import { loadGiveawayOptions } from '../_components/load';
import { WinnerForm } from '../_components/winner-form';

export default async function EditWinnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAccessToken();
    if (!token) notFound();

    // No per-winner GET exists, so find it in the list.
    let winner;
    try {
        const res = await getAdminWinners(token, { page: 1, perPage: 100 });
        winner = res.items.find((w) => w.winner_id === id);
    } catch (error) {
        handleApiAuthError(error);
        notFound();
    }

    if (!winner) notFound();

    const giveaways = await loadGiveawayOptions();

    return (
        <WinnerForm
            giveaways={giveaways}
            initialData={{
                winnerId: winner.winner_id,
                giveawayId: winner.giveaway_id ?? winner.giveaway?.giveaway_id ?? '',
                userId: winner.user_id ?? '',
                prize: winner.prize ?? '',
                memberName: winner.full_name ?? undefined,
                memberState: winner.state ?? undefined
            }}
        />
    );
}
