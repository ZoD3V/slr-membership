import { notFound } from 'next/navigation';

import { type EbookChapter, getEbook, getEbooks } from '@/lib/api/resources/ebooks';
import { getAccessToken } from '@/lib/api/server';

import { EbookForm } from '../_components/ebook-form';

interface EditEbookPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEbookPage({ params }: EditEbookPageProps) {
    const { id } = await params;
    const token = await getAccessToken();

    if (!token) notFound();

    const ebooks = await getEbooks(token);
    const ebookListItem = ebooks.find((e) => e.ebook_id === id);

    if (!ebookListItem) notFound();

    let chapters: EbookChapter[] = [];
    try {
        const fullEbook = await getEbook(id, token);
        chapters = fullEbook.chapters || [];
    } catch (e) {
        console.error('Failed to fetch ebook chapters:', e);
    }

    const initialData = {
        id: ebookListItem.ebook_id,
        title: ebookListItem.title || '',
        subtitle: ebookListItem.subtitle || '',
        description: ebookListItem.description || '',
        coverUrl: ebookListItem.cover_url || '',
        pdfUrl: ebookListItem.pdf_url || '',
        category: ebookListItem.category || '',
        footnote: ebookListItem.footnote || '',
        tierAccess: 'RED' as const,
        readingTimeMinutes: ebookListItem.reading_time_minutes || 0,
        chapters
    };

    return <EbookForm initialData={initialData} />;
}
