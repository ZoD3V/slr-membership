import Image from 'next/image';
import Link from 'next/link';

import type { EbookListItem } from '@/lib/api/resources/ebooks';
import { externalHostLabel } from '@/lib/ebook-mode';
import { goldButtonStyle } from '@/lib/styles';

import { ArrowRight, BookOpen, Clock, ExternalLink, Globe, Lock } from 'lucide-react';

function isHtml(value: string): boolean {
    return /<[a-z][\s\S]*>/i.test(value);
}

function toParagraphs(value: string): string[] {
    return value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function LongDescription({ description }: { description: string }) {
    if (isHtml(description)) {
        return (
            <div
                className='prose prose-invert text-slr-muted tiptap max-w-none space-y-5 text-sm leading-relaxed md:text-base'
                dangerouslySetInnerHTML={{ __html: description }}
            />
        );
    }

    const paragraphs = toParagraphs(description);

    return (
        <div className='space-y-4'>
            {paragraphs.map((paragraph, index) => (
                <p key={index} className='text-slr-muted text-sm leading-relaxed whitespace-pre-line md:text-base'>
                    {paragraph}
                </p>
            ))}
        </div>
    );
}

export function ExternalEbookLanding({ ebook, readUrl }: { ebook: EbookListItem; readUrl: string }) {
    const { title, subtitle, cover_url, category, footnote, reading_time_minutes, is_locked, description } = ebook;
    const host = externalHostLabel(readUrl);

    return (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10'>
            <div className='mx-auto w-full max-w-[260px] lg:mx-0'>
                <div className='lg:sticky lg:top-24'>
                    <div className='border-slr-navy-border bg-card-dark-navy shadow-card-soft relative aspect-3/4 w-full overflow-hidden rounded-xl border'>
                        {cover_url ? (
                            <Image
                                src={cover_url}
                                alt={title}
                                fill
                                unoptimized
                                sizes='260px'
                                className='object-cover'
                            />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)]'>
                                <BookOpen className='text-slr-gold-label/40 size-12' />
                            </div>
                        )}
                        {is_locked && (
                            <span className='absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur'>
                                <Lock className='size-3' /> Locked
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='min-w-0'>
                <h1 className='font-bebas-neue text-4xl tracking-wide text-white uppercase md:text-6xl'>{title}</h1>
                {subtitle && <p className='text-slr-muted mt-2 text-base md:text-lg'>{subtitle}</p>}

                <div className='text-slr-dim mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
                    {category && (
                        <span className='text-slr-gold-label rounded-md border border-[#D4AF3759] px-2 py-0.5 text-[10px] font-semibold uppercase'>
                            {category}
                        </span>
                    )}
                    <span className='inline-flex items-center gap-1.5'>
                        <Clock className='size-4' />
                        {reading_time_minutes} min read
                    </span>
                    {host && (
                        <span className='inline-flex items-center gap-1.5'>
                            <Globe className='size-4' />
                            {host}
                        </span>
                    )}
                </div>

                <div className='mt-6 h-px w-full bg-[linear-gradient(90deg,#B08A20_0%,rgba(255,255,255,0)_100%)]' />

                <div className='mt-6'>
                    {description ? (
                        <LongDescription description={description} />
                    ) : (
                        <p className='text-slr-muted text-sm leading-relaxed md:text-base'>-</p>
                    )}
                </div>

                {footnote && (
                    <p className='text-slr-dim mt-6 max-w-2xl border-l border-white/10 pl-3 text-xs leading-relaxed italic'>
                        * {footnote}
                    </p>
                )}

                <div className='mt-8'>
                    <ReadCta isLocked={is_locked} readUrl={readUrl} />
                </div>
            </div>
        </div>
    );
}

function ReadCta({ isLocked, readUrl }: { isLocked: boolean; readUrl: string }) {
    if (isLocked) {
        return (
            <div className='space-y-2'>
                <Link
                    href='/member/membership'
                    className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 text-sm font-bold text-[#FFDC75] uppercase transition-opacity hover:opacity-90 sm:w-auto'>
                    <Lock className='size-4' /> Upgrade to read
                </Link>
                <p className='text-slr-dim text-[11px] leading-relaxed'>
                    Reading this title is unlocked for SLR RED and BLUE members.
                </p>
            </div>
        );
    }

    return (
        <a
            href={readUrl}
            target='_blank'
            rel='noopener noreferrer'
            style={goldButtonStyle}
            className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold uppercase transition-opacity hover:opacity-90 sm:w-auto'>
            Read More <ExternalLink className='size-4' />
        </a>
    );
}

export function NextEbookLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className='border-slr-navy-border bg-card-dark-navy hover:border-slr-gold-label/40 mt-10 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-colors'>
            <span className='min-w-0'>
                <span className='text-slr-dim block text-[10px] tracking-widest uppercase'>Next E-Book</span>
                <span className='block truncate text-sm font-semibold text-white md:text-base'>{label}</span>
            </span>
            <ArrowRight className='text-slr-gold-label size-5 shrink-0' />
        </Link>
    );
}
