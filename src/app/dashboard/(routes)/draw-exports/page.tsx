import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { type DrawCsvHistoryItem, getDrawCsvHistory } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';

import { GenerateCsvButton } from './_components/generate-csv-button';
import { DrawExportsClient } from './draw-exports-client';

export default async function DrawExportsPage() {
    const token = await getAccessToken();

    let history: DrawCsvHistoryItem[] = [];
    let failed = false;

    try {
        history = token ? await getDrawCsvHistory(token) : [];
    } catch (error) {
        handleApiAuthError(error); // 401 only → force logout; others fall through
        failed = true;
    }

    return (
        <DashboardPageShell>
            <div className='flex flex-wrap items-start justify-between gap-4'>
                <Heading
                    title='Draw Exports'
                    description='Generate the 3 TPAL entry CSVs (Visitor, Red, Blue), then upload them to randomdraws.com/au to run the draw.'
                />
                <GenerateCsvButton />
            </div>

            <DrawExportsClient initialHistory={history} failed={failed} />
        </DashboardPageShell>
    );
}
