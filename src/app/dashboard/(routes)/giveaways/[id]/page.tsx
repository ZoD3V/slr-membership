import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminGiveaway, getAdminGiveaway } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';

import { GiveawayForm } from '../_components/giveaway-form';
import { Trophy } from 'lucide-react';

export default async function EditGiveawayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAccessToken();
    if (!token) notFound();

    let giveaway: AdminGiveaway;
    try {
        giveaway = await getAdminGiveaway(id, token);
    } catch (error) {
        handleApiAuthError(error);
        notFound();
    }

    return (
        <>
            <GiveawayForm
                initialData={{
                    id: giveaway.giveaway_id,
                    name: giveaway.name ?? '',
                    tier: giveaway.tier,
                    type: giveaway.type,
                    prize: giveaway.prize ?? '',
                    opensAt: giveaway.opens_at ?? '',
                    closesAt: giveaway.closes_at ?? '',
                    drawsAt: giveaway.draws_at ?? ''
                }}
            />

            {/* Winners are edited in one place — /dashboard/winners. */}
            <div className='mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 pb-6'>
                <span className='flex items-center gap-2 text-sm'>
                    <Trophy className='size-4' />
                    <span className='font-semibold'>{giveaway.winner_count ?? 0}</span> winners recorded ·{' '}
                    <span className='font-semibold'>{giveaway.entry_count ?? 0}</span> entries
                </span>
                <Button variant='outline' size='sm' asChild>
                    <Link href={`/dashboard/winners?giveaway=${giveaway.giveaway_id}`}>Manage winners</Link>
                </Button>
            </div>
        </>
    );
}
