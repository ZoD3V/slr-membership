'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { ArrowRight, ArrowUp, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ReaderChapter {
    num: string;

    shortTitle: string;

    heading: string;

    tag?: string;

    readMinutes?: number;

    image?: string;

    body: string[];

    quote?: string;
}

interface EbookReaderProps {
    chapters: ReaderChapter[];

    finishLabel?: string;

    shareTitle?: string;
    shareText?: string;

    nextHref?: string;
    nextLabel?: string;
}

const DiamondSeparator = ({ className }: { className?: string }) => (
    <div className={cn('flex justify-center', className)} aria-hidden='true'>
        <Image src='/images/diamond-line.png' alt='' width={2160} height={114} className='h-auto w-full opacity-70' />
    </div>
);

export function EbookReader({
    chapters,
    finishLabel = 'You Finished the Guide',
    shareTitle = 'SLR E-Book',
    shareText = 'Read this guide on SLR Rewards.',
    nextHref,
    nextLabel = 'Next Ebook'
}: EbookReaderProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const visibleRef = useRef<Set<number>>(new Set());
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sections = contentRef.current?.querySelectorAll<HTMLElement>('[data-chapter-index]');
        if (!sections?.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number((entry.target as HTMLElement).dataset.chapterIndex);
                    if (entry.isIntersecting) visibleRef.current.add(index);
                    else visibleRef.current.delete(index);
                });
                if (visibleRef.current.size > 0) setActiveIndex(Math.min(...visibleRef.current));
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: shareTitle, text: shareText, url });
            } catch {
                void 0;
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Could not copy link');
        }
    };

    return (
        <div className='mx-auto max-w-7xl px-4'>
            <div className='flex justify-center pb-10'>
                <div
                    className='h-0.75 w-27 max-w-full'
                    style={{
                        background:
                            'linear-gradient(89.12deg, #F5D68C 3.07%, #D4AD36 41.36%, #FFDE66 60.5%, #9E6E17 98.79%)'
                    }}
                    aria-hidden='true'
                />
            </div>

            <div className='grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)]'>
                <aside className='hidden xl:block xl:border-r xl:border-white/10 xl:pr-10'>
                    <div className='sticky top-30'>
                        <div className='flex items-center gap-2'>
                            <span className='bg-slr-gold-label h-1.5 w-1.5 animate-pulse rounded-full' />
                            <p className='text-slr-dim text-[10px] font-semibold tracking-[0.2em] uppercase'>
                                Sticky on scroll
                            </p>
                        </div>
                        <h2 className='font-bebas-neue mt-3 text-2xl tracking-wider text-white uppercase'>
                            In This Guide
                        </h2>

                        <div className='mt-4 h-px bg-white/10' />

                        <nav className='mt-4 space-y-1'>
                            {chapters.map((chapter, index) => {
                                const isActive = index === activeIndex;
                                const isRead = index < activeIndex;

                                return (
                                    <a
                                        key={chapter.num}
                                        href={`#chapter-${chapter.num}`}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                                            isActive
                                                ? 'border-slr-gold-label/40 bg-slr-gold-label/10'
                                                : 'border-transparent hover:bg-white/5'
                                        )}>
                                        {isRead ? (
                                            <span className='bg-gradient-gold flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#1a1408]'>
                                                <Check className='h-4 w-4' strokeWidth={3} />
                                            </span>
                                        ) : (
                                            <span
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                                                    isActive
                                                        ? 'border-slr-gold-label text-slr-gold-label'
                                                        : 'border-white/20 text-white/40'
                                                )}>
                                                {chapter.num}
                                            </span>
                                        )}
                                        <span className='min-w-0'>
                                            <span
                                                className={cn(
                                                    'block text-sm font-semibold',
                                                    isActive ? 'text-white' : isRead ? 'text-white/80' : 'text-white/50'
                                                )}>
                                                {chapter.shortTitle}
                                            </span>
                                            {chapter.readMinutes !== undefined && (
                                                <span className='text-slr-dim block text-[10px] tracking-widest uppercase'>
                                                    {chapter.readMinutes} Min
                                                </span>
                                            )}
                                        </span>
                                    </a>
                                );
                            })}
                        </nav>

                        <div className='mt-4 h-px bg-white/10' />

                        <button
                            type='button'
                            onClick={handleShare}
                            className='text-slr-muted mt-4 flex items-center gap-2 text-xs transition-colors hover:text-white'>
                            <Share2 className='h-4 w-4' />
                            Share this guide
                        </button>
                    </div>
                </aside>

                <div ref={contentRef} className='mx-auto max-w-2xl pb-16 md:pb-24'>
                    {chapters.map((chapter, index) => {
                        const isHtml = chapter.body.length === 1 && /<[a-z][\s\S]*>/i.test(chapter.body[0]);

                        return (
                            <Fragment key={chapter.num}>
                                {index > 0 && <DiamondSeparator className='py-12 md:py-16' />}

                                <article
                                    id={`chapter-${chapter.num}`}
                                    data-chapter-index={index}
                                    className='scroll-mt-24'>
                                    {isHtml && (
                                        <style
                                            dangerouslySetInnerHTML={{
                                                __html: `
                                                    .tiptap ul {
                                                        list-style-type: disc !important;
                                                        padding-left: 1.5rem !important;
                                                        margin-top: 0.5rem !important;
                                                        margin-bottom: 0.5rem !important;
                                                    }
                                                    .tiptap ol {
                                                        list-style-type: decimal !important;
                                                        padding-left: 1.5rem !important;
                                                        margin-top: 0.5rem !important;
                                                        margin-bottom: 0.5rem !important;
                                                    }
                                                    .tiptap li {
                                                        display: list-item !important;
                                                        margin-top: 0.25rem !important;
                                                        margin-bottom: 0.25rem !important;
                                                    }
                                                    .tiptap blockquote {
                                                        border-left: 3px solid #D4AF37 !important;
                                                        padding-left: 1rem !important;
                                                        font-style: italic !important;
                                                        color: rgba(255, 255, 255, 0.8) !important;
                                                        margin: 1rem 0 !important;
                                                    }
                                                    .tiptap h1 {
                                                        font-size: 1.5rem !important;
                                                        font-weight: bold !important;
                                                        margin-top: 1.5rem !important;
                                                        margin-bottom: 0.5rem !important;
                                                    }
                                                    .tiptap h2 {
                                                        font-size: 1.25rem !important;
                                                        font-weight: bold !important;
                                                        margin-top: 1.25rem !important;
                                                        margin-bottom: 0.5rem !important;
                                                    }
                                                `
                                            }}
                                        />
                                    )}

                                    <div className='flex flex-wrap items-center gap-3'>
                                        <span className='text-slr-gold-label border-slr-gold-label/50 bg-slr-gold-label/10 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase'>
                                            Ch. {chapter.num}
                                        </span>
                                        {(chapter.readMinutes !== undefined || chapter.tag) && (
                                            <p className='text-slr-dim text-[10px] font-semibold tracking-[0.15em] uppercase'>
                                                {chapter.readMinutes !== undefined && `${chapter.readMinutes} Min Read`}
                                                {chapter.readMinutes !== undefined && chapter.tag && ' · '}
                                                {chapter.tag}
                                            </p>
                                        )}
                                    </div>

                                    <h3 className='font-bebas-neue mt-3 text-3xl tracking-wide text-white uppercase sm:text-4xl md:text-5xl'>
                                        {chapter.heading}
                                    </h3>

                                    {chapter.image && (
                                        <div className='relative mx-auto mt-6 aspect-square w-full max-w-180 overflow-hidden rounded-3xl ring-1 ring-white/10'>
                                            <Image
                                                src={chapter.image}
                                                alt=''
                                                fill
                                                unoptimized
                                                sizes='(max-width: 768px) 100vw, 720px'
                                                className='object-contain'
                                            />
                                        </div>
                                    )}

                                    <div className='mt-6 space-y-5'>
                                        {isHtml ? (
                                            <div
                                                className='tiptap text-slr-muted max-w-none space-y-5 text-sm leading-relaxed md:text-base'
                                                dangerouslySetInnerHTML={{ __html: chapter.body[0] }}
                                            />
                                        ) : (
                                            <>
                                                <p className='text-slr-muted text-sm leading-relaxed md:text-base'>
                                                    {chapter.body[0]}
                                                </p>
                                                {chapter.quote && (
                                                    <blockquote className='border-slr-gold-label text-slr-gold-label border-l-[3px] py-1 pl-4 text-base font-semibold italic md:text-lg'>
                                                        &ldquo;{chapter.quote}&rdquo;
                                                    </blockquote>
                                                )}
                                                {chapter.body.slice(1).map((paragraph) => (
                                                    <p
                                                        key={paragraph}
                                                        className='text-slr-muted text-sm leading-relaxed md:text-base'>
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </>
                                        )}

                                        {chapter.quote && isHtml && (
                                            <blockquote className='border-slr-gold-label text-slr-gold-label my-6 border-l-[3px] py-1 pl-4 text-base font-semibold italic md:text-lg'>
                                                &ldquo;{chapter.quote}&rdquo;
                                            </blockquote>
                                        )}
                                    </div>
                                </article>
                            </Fragment>
                        );
                    })}

                    <DiamondSeparator className='mt-12 md:mt-16' />

                    <div className='mt-10 flex flex-row items-center justify-between gap-4'>
                        <button
                            type='button'
                            onClick={scrollToTop}
                            className='inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-white/80 uppercase transition-colors hover:bg-white/10'>
                            <ArrowUp className='h-4 w-4' />
                            Back to Top
                        </button>

                        <p className='text-slr-gold-label flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase'>
                            <Check className='h-4 w-4' strokeWidth={3} />
                            {finishLabel}
                        </p>

                        {nextHref && (
                            <Link
                                href={nextHref}
                                style={goldButtonStyle}
                                className='inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-90'>
                                {nextLabel}
                                <ArrowRight className='h-4 w-4' />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
