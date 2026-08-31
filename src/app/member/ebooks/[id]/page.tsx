import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EbookReader, type ReaderChapter } from '@/components/common/ebook-reader';
import { PdfEbookViewer } from '@/components/common/pdf-ebook-viewer';
import { handleApiAuthError } from '@/lib/api/guard';
import {
    type EbookChapter,
    type EbookDetail,
    type EbookListItem,
    getEbook,
    getEbooks
} from '@/lib/api/resources/ebooks';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import { resolveEbookMode } from '@/lib/ebook-mode';
import { formatShortDate } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';

import { ExternalEbookLanding, NextEbookLink } from '../_components/external-ebook-landing';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Layers, Lock } from 'lucide-react';

function toReaderChapters(chapters: EbookChapter[]): ReaderChapter[] {
    return chapters.map((chapter) => {
        const bodyContent = chapter.body ?? '';
        const isHtml = /<[a-z][\s\S]*>/i.test(bodyContent);

        let paragraphs: string[];
        if (isHtml) {
            paragraphs = [bodyContent];
        } else {
            paragraphs = bodyContent
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean);
        }

        return {
            num: String(chapter.chapter_number).padStart(2, '0'),
            shortTitle: chapter.title?.trim() || `Chapter ${chapter.chapter_number}`,
            heading: chapter.title?.trim() || `Chapter ${chapter.chapter_number}`,
            image: chapter.image_url ?? undefined,
            body: paragraphs.length > 0 ? paragraphs : ['-'],
            quote: chapter.pull_quote ?? undefined
        };
    });
}

async function loadEbookSafe(id: string): Promise<EbookDetail | null> {
    const token = await getAccessToken();

    if (!token) return null;

    try {
        return await getEbook(id, token);
    } catch {
        return null;
    }
}

async function loadListItemSafe(id: string): Promise<EbookListItem | null> {
    const token = await getAccessToken();

    if (!token) return null;

    try {
        return (await getEbooks(token)).find((item) => item.ebook_id === id) ?? null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const ebook = await loadEbookSafe(id);
    // External-link e-books are readable by every tier, but `GET /ebooks/{id}` still
    // 403s on a locked tier — fall back to the list, which is never gated.
    const title = ebook?.title ?? (await loadListItemSafe(id))?.title;

    return { title: title ? `${title} · SLR E-Books` : 'E-Book · SLR' };
}

function BackToLibraryLink() {
    return (
        <Link
            href='/member/ebooks'
            className='text-slr-muted hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'>
            <ArrowLeft className='size-4' /> E-Books
        </Link>
    );
}

function UpgradeGate() {
    return (
        <div className='mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:px-6 md:py-10'>
            <BackToLibraryLink />

            <div className='mt-6 flex flex-col items-center px-6 py-14 text-center'>
                <span className='bg-gold-tint mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                    <Lock className='text-slr-gold-label size-7' />
                </span>
                <h1 className='font-bebas-neue text-2xl tracking-wide text-white uppercase md:text-3xl'>
                    This e-book is a member benefit
                </h1>
                <p className='text-slr-muted mt-2 max-w-md text-sm leading-relaxed'>
                    Full e-book content is unlocked for SLR RED and BLUE members. Upgrade your membership to read the
                    complete guide.
                </p>
                <Link
                    href='/member/membership'
                    className='mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase'
                    style={goldButtonStyle}>
                    Upgrade now <ArrowRight className='size-4' />
                </Link>
            </div>
        </div>
    );
}

export default async function EbookReaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAccessToken();

    if (!token) notFound();

    let list: EbookListItem[] = [];
    try {
        list = await getEbooks(token);
    } catch (error) {
        handleApiAuthError(error);
    }

    const currentIndex = list.findIndex((item) => item.ebook_id === id);
    const listItem = currentIndex >= 0 ? list[currentIndex] : null;
    const nextEbook = currentIndex >= 0 ? (list[currentIndex + 1] ?? null) : null;
    const nextHref = nextEbook ? `/member/ebooks/${nextEbook.ebook_id}` : '/member/ebooks';
    const nextLabel = nextEbook ? `Next: ${nextEbook.title}` : 'More E-Books';

    // The whole landing page is built from the list item: the detail endpoint has no
    // `description` and 403s on a locked tier, while this page stays open to every tier.
    if (listItem?.pdf_url && resolveEbookMode(listItem.pdf_url) === 'external') {
        return (
            <div className='flex-1'>
                <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10'>
                    <BackToLibraryLink />

                    <div className='mt-6'>
                        <ExternalEbookLanding ebook={listItem} readUrl={listItem.pdf_url} />
                        <NextEbookLink href={nextHref} label={nextLabel} />
                    </div>
                </div>
            </div>
        );
    }

    let ebook: EbookDetail;
    try {
        ebook = await getEbook(id, token);
    } catch (error) {
        handleApiAuthError(error);
        if (error instanceof ApiError && error.status === 403) return <UpgradeGate />;
        notFound();
    }

    const isPdf = resolveEbookMode(ebook.pdf_url) === 'pdf';
    const chapters = isPdf ? [] : toReaderChapters(ebook.chapters);

    return (
        <div className='flex-1'>
            <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10'>
                <BackToLibraryLink />

                <div className='mt-5 max-w-3xl'>
                    <h1 className='font-bebas-neue text-4xl tracking-wide text-white uppercase md:text-6xl'>
                        {ebook.title}
                    </h1>
                    {ebook.subtitle && <p className='text-slr-muted mt-2 text-base md:text-lg'>{ebook.subtitle}</p>}

                    <div className='text-slr-dim mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
                        <span className='inline-flex items-center gap-1.5'>
                            <Clock className='size-4' />
                            {ebook.reading_time_minutes} min read
                        </span>
                        {!isPdf && (
                            <span className='inline-flex items-center gap-1.5'>
                                <Layers className='size-4' />
                                {ebook.chapter_count} {ebook.chapter_count === 1 ? 'chapter' : 'chapters'}
                            </span>
                        )}
                        {ebook.published_at && (
                            <span className='inline-flex items-center gap-1.5'>
                                <BookOpen className='size-4' />
                                {formatShortDate(ebook.published_at)}
                            </span>
                        )}
                    </div>
                    {ebook.footnote && (
                        <p className='text-slr-dim mt-5 max-w-2xl border-l border-white/10 pl-3 text-xs leading-relaxed italic'>
                            * {ebook.footnote}
                        </p>
                    )}
                </div>
            </div>

            {isPdf ? (
                <section className='py-6 md:py-10'>
                    <PdfEbookViewer pdfUrl={ebook.pdf_url!} title={ebook.title} />
                </section>
            ) : (
                <section id='guide' className='scroll-mt-24 py-6 md:py-10'>
                    <EbookReader
                        chapters={chapters}
                        finishLabel={`You Finished ${ebook.title}`}
                        shareTitle={ebook.title}
                        shareText={`Read "${ebook.title}" on SLR Rewards.`}
                        nextHref={nextHref}
                        nextLabel={nextLabel}
                    />
                </section>
            )}
        </div>
    );
}
