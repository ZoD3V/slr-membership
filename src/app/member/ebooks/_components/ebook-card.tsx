import Image from 'next/image';
import Link from 'next/link';

import type { EbookListItem } from '@/lib/api/resources/ebooks';
import { resolveEbookMode } from '@/lib/ebook-mode';
import { goldButtonStyle } from '@/lib/styles';

import { ArrowRight, BookOpen, Clock, Globe, Layers, Lock } from 'lucide-react';

export function EbookCard({ ebook }: { ebook: EbookListItem }) {
    const { ebook_id, title, subtitle, cover_url, category, reading_time_minutes, chapter_count, is_locked } = ebook;
    const isExternal = resolveEbookMode(ebook.pdf_url) === 'external';

    return (
        <article className='bg-card-dark-navy border-slr-navy-border shadow-card-soft flex flex-col overflow-hidden rounded-2xl border'>
            <div className='relative aspect-16/10 w-full overflow-hidden'>
                {cover_url ? (
                    <Image
                        src={cover_url}
                        alt={title}
                        fill
                        unoptimized
                        sizes='(max-width: 768px) 100vw, 33vw'
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
                {category && (
                    <span className='text-slr-gold-label absolute bottom-3 left-3 rounded-md border border-[#D4AF3759] bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase backdrop-blur'>
                        {category}
                    </span>
                )}
            </div>

            <div className='flex flex-1 flex-col gap-3 p-4 md:p-5'>
                <div className='space-y-1'>
                    <h3 className='line-clamp-1 text-base font-semibold text-white md:text-lg'>{title}</h3>
                    <p className='text-slr-muted line-clamp-2 min-h-[2lh] text-sm'>{subtitle}</p>
                </div>

                <div className='text-slr-dim flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                    <span className='inline-flex items-center gap-1'>
                        <Clock className='size-3.5' />
                        {reading_time_minutes} min
                    </span>
                    {isExternal ? (
                        <span className='inline-flex items-center gap-1'>
                            <Globe className='size-3.5' />
                            Web
                        </span>
                    ) : (
                        <span className='inline-flex items-center gap-1'>
                            <Layers className='size-3.5' />
                            {chapter_count} {chapter_count === 1 ? 'chapter' : 'chapters'}
                        </span>
                    )}
                </div>

                <div className='mt-auto pt-2'>
                    {is_locked && isExternal ? (
                        <Link
                            href={`/member/ebooks/${ebook_id}`}
                            className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#FFD147] bg-[#FFD1471A] text-sm font-bold text-[#FFDC75] uppercase transition-opacity hover:opacity-90'>
                            View details <ArrowRight className='size-4' />
                        </Link>
                    ) : is_locked ? (
                        <Link
                            href='/member/membership'
                            className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#FFD147] bg-[#FFD1471A] text-sm font-bold text-[#FFDC75] uppercase transition-opacity hover:opacity-90'>
                            <Lock className='size-4' /> Upgrade to read
                        </Link>
                    ) : (
                        <Link
                            href={`/member/ebooks/${ebook_id}`}
                            style={goldButtonStyle}
                            className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase transition-opacity hover:opacity-90'>
                            Read <ArrowRight className='size-4' />
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
