import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getEbooks } from '@/lib/api/resources/ebooks';
import { getAccessToken } from '@/lib/api/server';
import { type EbookContentMode, resolveEbookMode } from '@/lib/ebook-mode';

import { type EbookRow, EbooksClient } from './ebooks-client';
import { Plus } from 'lucide-react';

const CONTENT_TYPE_LABEL: Record<EbookContentMode, string> = {
    chapters: 'Chapters',
    pdf: 'PDF',
    external: 'Web'
};

export default async function EbooksPage() {
    const token = await getAccessToken();

    let rows: EbookRow[] = [];
    let listError: ListError | null = null;

    try {
        const ebooks = token ? await getEbooks(token) : [];
        rows = ebooks.map((e) => ({
            id: e.ebook_id,
            title: e.title || '-',
            subtitle: e.subtitle ?? '',
            description: e.description ?? '',
            coverUrl: e.cover_url ?? '',
            category: e.category || '-',
            type: CONTENT_TYPE_LABEL[resolveEbookMode(e.pdf_url)],
            footnote: e.footnote ?? '',
            reading: e.reading_time_minutes ?? 0,
            chapters: e.chapter_count ?? 0,
            locked: e.is_locked ? 'Yes' : 'No'
        }));
    } catch (error) {
        handleApiAuthError(error);
        listError = toListError(error);
    }

    return (
        <DashboardPageShell>
            <div className='flex items-center justify-between'>
                <Heading title='Ebooks' description='Create, edit and remove ebooks' />
                <Button asChild>
                    <Link href='/dashboard/ebooks/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Ebook
                    </Link>
                </Button>
            </div>

            <EbooksClient initialRows={rows} listError={listError} />
        </DashboardPageShell>
    );
}
