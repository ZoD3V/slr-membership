import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { handleApiAuthError } from '@/lib/api/guard';
import { type EntryCycle, type EntryHistoryResponse, getEntryHistory } from '@/lib/api/resources/entries';
import { getAccessToken } from '@/lib/api/server';

import { EntryHistoryTable } from './_components/entry-history-table';
import { CircleAlert, History } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Entry History · SLR Member'
};

export default async function EntryHistoryPage() {
    const token = await getAccessToken();
    if (!token) return null;

    let data: EntryHistoryResponse | null = null;
    let failed = false;

    try {
        data = await getEntryHistory(token);
    } catch (error) {
        handleApiAuthError(error);
        failed = true;
    }

    const entries: EntryCycle[] = [];
    if (data?.current_cycle && (data.current_cycle.tier || '').toLowerCase() !== 'beny') {
        entries.push(data.current_cycle);
    }
    if (data?.history?.length) {
        const filteredHistory = data.history.filter((e) => (e.tier || '').toLowerCase() !== 'beny');
        entries.push(...filteredHistory);
    }

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Entry History</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    Your entry status and tokens grouped by billing cycle. Tokens are allocated to all eligible draws
                    within that cycle.
                </p>
            </header>

            {failed ? (
                <EmptyState
                    icon={CircleAlert}
                    title='History Unavailable'
                    description='We couldn’t load your entry history right now. Please try again shortly.'
                />
            ) : !entries.length ? (
                <EmptyState
                    icon={History}
                    title='No Entry History'
                    description='You do not have any entry cycles yet. Your entries will appear here once your cycle starts.'
                />
            ) : (
                <EntryHistoryTable entries={entries} />
            )}
        </div>
    );
}
