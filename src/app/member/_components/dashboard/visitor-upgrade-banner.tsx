import Image from 'next/image';
import Link from 'next/link';

import { TIER_VISUALS } from '@/constant/tiers';
import { goldButtonStyle } from '@/lib/styles';

import { ArrowRight, BookOpen, Gift, Sparkles, TicketPercent } from 'lucide-react';

const PERKS = [
    { icon: TicketPercent, label: 'Partner discounts' },
    { icon: Gift, label: 'RED & BLUE cash draws' },
    { icon: BookOpen, label: 'Full e-books' },
    { icon: Sparkles, label: 'BENY add-on' }
];

export function VisitorUpgradeBanner() {
    return (
        <section className='relative isolate rounded-2xl p-px'>
            <div aria-hidden className='bg-frame-gold absolute inset-0 -z-10 rounded-2xl' />
            <div className='bg-card-gold shadow-card-warm relative isolate overflow-hidden rounded-[calc(1rem-1px)] p-5 md:p-6'>
                <div aria-hidden className='slr-stars-overlay pointer-events-none absolute inset-0 -z-10 opacity-40' />
                <div
                    aria-hidden
                    className='bg-slr-gold-metal/10 pointer-events-none absolute -top-16 -right-16 -z-10 size-56 rounded-full blur-3xl'
                />

                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className='max-w-xl'>
                        <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>
                            Visitor Pass
                        </p>
                        <h2 className='font-bebas-neue mt-1 text-2xl tracking-wide text-white uppercase md:text-3xl'>
                            Unlock the full membership
                        </h2>
                        <p className='text-slr-muted mt-1 text-sm md:text-base'>
                            You&apos;re on the free Visitor pass — upgrade to SLR RED or BLUE to unlock partner
                            discounts, e-books, cash draws and the BENY add-on.
                        </p>
                    </div>

                    {TIER_VISUALS.red.cardArt && TIER_VISUALS.blue.cardArt && (
                        <div aria-hidden className='pointer-events-none hidden shrink-0 items-center xl:flex'>
                            <Image
                                src={TIER_VISUALS.red.cardArt}
                                alt=''
                                width={220}
                                height={180}
                                className='w-28 -rotate-6 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
                            />
                            <Image
                                src={TIER_VISUALS.blue.cardArt}
                                alt=''
                                width={220}
                                height={180}
                                className='-ml-10 w-28 rotate-6 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
                            />
                        </div>
                    )}

                    <Link
                        href='/member/membership'
                        className='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase transition-opacity hover:opacity-90'
                        style={goldButtonStyle}>
                        Upgrade now <ArrowRight className='size-4' />
                    </Link>
                </div>

                <div className='mt-4 flex flex-wrap gap-2'>
                    {PERKS.map((perk) => (
                        <span
                            key={perk.label}
                            className='text-slr-muted inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-xs'>
                            <perk.icon className='text-slr-gold-label size-3.5' />
                            {perk.label}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
