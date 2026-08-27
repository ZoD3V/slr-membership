import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { handleApiAuthError } from '@/lib/api/guard';
import { type EbookListItem, getEbooks } from '@/lib/api/resources/ebooks';
import { getAccessToken } from '@/lib/api/server';

import { EbookCard } from './_components/ebook-card';
import { BookOpen, CircleAlert } from 'lucide-react';

export const metadata: Metadata = {
    title: 'E-Books · SLR Member'
};

export default async function EbooksPage() {
    const token = await getAccessToken();

    let ebooks: EbookListItem[] = [];
    let failed = false;

    if (token) {
        try {
            ebooks = await getEbooks(token);
        } catch (error) {
            handleApiAuthError(error);
            failed = true;
        }
    }

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>E-Books</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    Guides and blueprints for smarter living — full content unlocked for RED and BLUE members.
                </p>
            </header>

            {failed ? (
                <EmptyState
                    icon={CircleAlert}
                    title='E-Books Unavailable'
                    description='We couldn’t load the library right now. Please try again shortly.'
                />
            ) : ebooks.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title='No E-Books Yet'
                    description='New guides are on the way — check back soon.'
                />
            ) : (
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                    {ebooks.map((ebook) => (
                        <EbookCard key={ebook.ebook_id} ebook={ebook} />
                    ))}
                </div>
            )}
        </div>
    );
}
