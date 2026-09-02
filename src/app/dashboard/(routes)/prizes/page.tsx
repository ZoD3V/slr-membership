import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import {
    type AnnouncementItem,
    DRAW_RULES_TYPE,
    compareAnnouncements,
    getAdminAnnouncements
} from '@/lib/api/resources/announcements';
import { getAdminPrizeContent } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import type { PrizeContent } from '@/types/member';

import { DrawRulesCard } from './draw-rules-card';
import { PrizesClient } from './prizes-client';
import { PRIZE_CONTENT_SEED } from './seed';

export default async function PrizesPage() {
    const token = await getAccessToken();

    let content: PrizeContent;
    let isPlaceholder = false;

    try {
        content = token ? await getAdminPrizeContent(token) : PRIZE_CONTENT_SEED;
        if (!token) isPlaceholder = true;
    } catch (error) {
        handleApiAuthError(error);

        content = PRIZE_CONTENT_SEED;
        isPlaceholder = true;
    }

    let drawRules: AnnouncementItem | null = null;

    if (token) {
        try {
            const docs = await getAdminAnnouncements(token, { type: DRAW_RULES_TYPE, perPage: 100 });
            drawRules = [...docs].sort(compareAnnouncements)[0] ?? null;
        } catch (error) {
            handleApiAuthError(error);
        }
    }

    return (
        <DashboardPageShell>
            <div className='mx-auto w-full'>
                <Heading
                    title='Prizes'
                    description='Edit the prize pool CMS document. Live on /member/prizes. The public /prizes marketing page has its own bespoke layout and is not wired to this content.'
                />

                {isPlaceholder ? (
                    <p className='text-muted-foreground mt-2 text-sm'>
                        Couldn&apos;t load the current prize content — showing defaults. Saving may fail.
                    </p>
                ) : null}
            </div>

            <PrizesClient content={content} />

            <div className='mx-auto w-full pb-6'>
                <DrawRulesCard initialContent={drawRules?.content ?? ''} existingId={drawRules?.id ?? null} />
            </div>
        </DashboardPageShell>
    );
}
