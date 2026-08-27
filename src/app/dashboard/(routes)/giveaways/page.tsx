import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getAllAdminGiveaways } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';

import { toGiveawayRow } from './_components/to-row';
import { type GiveawayRow, GiveawaysClient } from './giveaways-client';
import { Plus } from 'lucide-react';

export default async function GiveawaysPage() {
    const token = await getAccessToken();

    let rows: GiveawayRow[] = [];
    let listError: ListError | null = null;

    try {
        if (token) {
            rows = (await getAllAdminGiveaways(token)).map(toGiveawayRow);
        }
    } catch (error) {
        handleApiAuthError(error);
        listError = toListError(error);
    }

    return (
        <DashboardPageShell>
            <div className='flex items-center justify-between'>
                <Heading title='Giveaways' description='Create, schedule and remove tier draws' />
                <Button asChild>
                    <Link href='/dashboard/giveaways/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Giveaway
                    </Link>
                </Button>
            </div>

            <GiveawaysClient rows={rows} listError={listError} />
        </DashboardPageShell>
    );
}
