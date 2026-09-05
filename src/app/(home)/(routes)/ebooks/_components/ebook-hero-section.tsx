import Image from 'next/image';
import Link from 'next/link';

import AnchorLink from '@/components/common/anchor-link';

import { chapters, totalReadMinutes } from './ebook-chapters';
import { BookMarked, CalendarDays, Clock } from 'lucide-react';

const meta = [
    { icon: BookMarked, label: `${chapters.length} Chapters` },
    { icon: Clock, label: `~${totalReadMinutes} Min Read` },
    { icon: CalendarDays, label: 'Published Oct 2026' }
];

const EbookHeroSection = () => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-12 md:py-20'>
            <div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[1.4fr_1fr] lg:gap-14'>
                <div className='text-center lg:text-left'>
                    <div className='flex items-center justify-center gap-3 lg:justify-start'>
                        <span
                            aria-hidden='true'
                            className='h-px w-8 bg-[linear-gradient(270deg,#B08A20_0%,rgba(255,255,255,0)_100%)]'
                        />
                        <p className='text-slr-gold-label text-[11px] font-semibold tracking-[0.22em] uppercase md:text-xs'>
                            Ebook 01 · Lifestyle Initiatives
                        </p>
                        <span
                            aria-hidden='true'
                            className='h-px w-8 bg-[linear-gradient(90deg,#B08A20_0%,rgba(255,255,255,0)_100%)]'
                        />
                    </div>

                    <h1 className='font-bebas-neue mt-5 text-[56px] leading-[0.92] tracking-wider uppercase sm:text-[72px] md:text-[80px] xl:text-[96px]'>
                        <span className='text-gradient-silver block'>Smart Living</span>
                        <span className='text-gradient-gold block'>Blueprint</span>
                    </h1>

                    <p className='text-slr-muted mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg lg:mx-0'>
                        A six-chapter guide to living smarter, not harder — covering home, money, time, habits and the
                        quiet power of awareness.
                    </p>

                    <div className='mt-8 flex flex-wrap justify-center gap-3 lg:justify-start'>
                        {meta.map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                className='inline-flex items-center gap-1.5 rounded-full border border-[#403314] bg-[#1A1C1F] px-3 py-1'>
                                <Icon className='text-slr-gold-label h-3.5 w-3.5' />
                                <span className='text-slr-muted text-[10px] font-semibold tracking-[0.12em] uppercase'>
                                    {label}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

                <AnchorLink
                    href='#guide'
                    aria-label='Read the Smart Living Blueprint'
                    className='mx-auto block w-full max-w-md transition-opacity hover:opacity-95 lg:mr-0 lg:ml-auto'>
                    <Image
                        src='/images/everyday-fitness-ebook.webp'
                        alt='Everyday Fitness Blueprint — SLR exclusive digital good'
                        width={1122}
                        height={1402}
                        priority
                        className='h-auto w-full'
                    />
                </AnchorLink>
            </div>
        </section>
    );
};

export default EbookHeroSection;
