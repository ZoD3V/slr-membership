import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminPrizeContent } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import type { PrizeContent } from '@/types/member';

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
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        // The endpoint is live, so reaching here means a real failure (network,
        // or a 5xx). Render against the seed so the editor stays usable rather
        // than blanking; saving still fails loudly via the action's toast.
        content = PRIZE_CONTENT_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <div className='mx-auto w-full max-w-4xl'>
                <Heading
                    title='Prizes'
                    description='Edit the prize pool CMS document. Not yet shown on any member-facing page — /prizes and /member/prizes are not wired to this content yet.'
                />

                {isPlaceholder ? (
                    <p className='text-muted-foreground mt-2 text-sm'>
                        Couldn&apos;t load the current prize content — showing defaults. Saving may fail.
                    </p>
                ) : null}
            </div>

            <PrizesClient content={content} />
        </DashboardPageShell>
    );
}
