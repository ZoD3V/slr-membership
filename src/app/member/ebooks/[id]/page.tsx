import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EbookReader, type ReaderChapter } from '@/components/common/ebook-reader';
import { PdfEbookViewer } from '@/components/common/pdf-ebook-viewer';
import { handleApiAuthError } from '@/lib/api/guard';
import { type EbookChapter, type EbookDetail, getEbook, getEbooks } from '@/lib/api/resources/ebooks';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import { formatShortDate } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';

import { ArrowLeft, ArrowRight, BookOpen, Clock, Layers, Lock } from 'lucide-react';

/** API chapters → the shared reader shape. `body` splits on blank lines into paragraphs. */
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

// getEbook is React.cache'd on (id, token) → one network call across metadata + page.
async function loadEbookSafe(id: string): Promise<EbookDetail | null> {
    const token = await getAccessToken();

    if (!token) return null;

    try {
        return await getEbook(id, token);
    } catch {
        return null; // metadata only — locked/missing both fall back to a generic title
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const ebook = await loadEbookSafe((await params).id);

    return { title: ebook ? `${ebook.title} · SLR E-Books` : 'E-Book · SLR' };
}

function UpgradeGate() {
    return (
        <div className='mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:px-6 md:py-10'>
            <Link
                href='/member/ebooks'
                className='text-slr-muted hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'>
                <ArrowLeft className='size-4' /> E-Books
            </Link>

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

    let ebook: EbookDetail;
    try {
        ebook = await getEbook(id, token);
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout
        if (error instanceof ApiError && error.status === 403) return <UpgradeGate />;
        notFound(); // 404 / 500 / other
    }

    const isPdf = Boolean(ebook.pdf_url);
    const chapters = isPdf ? [] : toReaderChapters(ebook.chapters);

    // "Next Ebook" walks the same catalog order shown on /member/ebooks — the
    // last item falls back to the listing rather than wrapping around.
    const list = await getEbooks(token);
    const currentIndex = list.findIndex((item) => item.ebook_id === id);
    const nextEbook = currentIndex >= 0 ? (list[currentIndex + 1] ?? null) : null;

    return (
        <div className='flex-1'>
            {/* Hero */}
            <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10'>
                <Link
                    href='/member/ebooks'
                    className='text-slr-muted hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'>
                    <ArrowLeft className='size-4' /> E-Books
                </Link>

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
                        nextHref={nextEbook ? `/member/ebooks/${nextEbook.ebook_id}` : '/member/ebooks'}
                        nextLabel={nextEbook ? `Next: ${nextEbook.title}` : 'More E-Books'}
                    />
                </section>
            )}
        </div>
    );
}
