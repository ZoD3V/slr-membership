'use client';

import Image from 'next/image';

import type { Discount } from '@/lib/api/resources/discounts';
import { goldButtonStyle } from '@/lib/styles';

import { Tag } from 'lucide-react';

export function DiscountCard({ discount, onSelect }: { discount: Discount; onSelect: (d: Discount) => void }) {
    const initial = (discount.partner_name || discount.title || '?').charAt(0).toUpperCase();

    return (
        <div className='bg-card-dark-navy shadow-card-warm border-slr-navy-border hover:border-slr-gold-edge flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-[0_0_28px_rgba(212,175,55,0.15)]'>
            <div className='relative flex h-40 w-full items-center justify-center overflow-hidden bg-[linear-gradient(154.36deg,#10141b_0.82%,#1a2029_49.73%,#10141b_98.65%)]'>
                {discount.thumbnail_url ? (
                    <Image src={discount.thumbnail_url} alt='' fill unoptimized className='object-cover' />
                ) : (
                    <>
                        <span
                            aria-hidden
                            className='slr-stars-overlay pointer-events-none absolute inset-0 opacity-40'
                        />
                        <span
                            aria-hidden
                            className='bg-slr-gold-metal/15 pointer-events-none absolute size-24 rounded-full blur-2xl'
                        />
                        <span className='text-gradient-gold font-bebas-neue relative text-5xl'>{initial}</span>
                    </>
                )}
            </div>

            <div className='flex flex-col gap-2 p-4'>
                <h3 className='line-clamp-1 text-base font-semibold text-white'>{discount.title || '-'}</h3>
                <p className='text-slr-muted truncate text-sm'>{discount.partner_name || '-'}</p>

                <p className='text-slr-dim line-clamp-2 min-h-[2lh] text-xs'>{discount.description}</p>

                <span className='text-slr-dim inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-xs'>
                    <Tag className='text-slr-gold-label size-3' /> {discount.category || '-'}
                </span>

                <button
                    type='button'
                    onClick={() => onSelect(discount)}
                    className='mt-1 h-11 w-full rounded-xl text-sm font-bold uppercase'
                    style={goldButtonStyle}>
                    Claim Deal
                </button>
            </div>
        </div>
    );
}
