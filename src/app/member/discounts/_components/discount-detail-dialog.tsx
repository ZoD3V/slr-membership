'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Discount } from '@/lib/api/resources/discounts';

import { Check, Copy, ExternalLink, MapPin, Star, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PLACEHOLDER_CODE = 'SLR-XXXXXX';

export function DiscountDetailDialog({ discount, onClose }: { discount: Discount | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const code = discount?.code?.trim() || PLACEHOLDER_CODE;

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success('Code copied');
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Could not copy code');
        }
    };

    return (
        <Dialog open={discount !== null} onOpenChange={(open) => (open ? null : onClose())}>
            <DialogContent className='slr-member dark border-slr-navy-border bg-slr-navy-deep max-h-[90vh] overflow-y-auto sm:max-w-4xl lg:max-w-5xl'>
                {discount ? (
                    <div className='grid gap-6 p-1 md:grid-cols-2 md:gap-8 md:p-2'>
                        <div className='space-y-4'>
                            <div
                                className={
                                    discount.thumbnail_url
                                        ? 'relative aspect-video overflow-hidden rounded-xl'
                                        : 'bg-card-dark-navy border-slr-navy-border relative aspect-video overflow-hidden rounded-xl border'
                                }>
                                {discount.thumbnail_url ? (
                                    <Image
                                        src={discount.thumbnail_url}
                                        alt=''
                                        fill
                                        unoptimized
                                        className='object-contain'
                                    />
                                ) : (
                                    <span className='text-slr-dim flex h-full w-full items-center justify-center text-3xl font-bold'>
                                        {(discount.partner_name || '?').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className='text-slr-dim text-xs'>Partner</p>
                                <DialogTitle className='text-xl font-semibold text-white md:text-2xl'>
                                    {discount.partner_name || '-'}
                                </DialogTitle>
                                <p className='text-gradient-gold mt-1 text-2xl font-bold md:text-3xl'>
                                    {discount.title || '-'}
                                </p>
                            </div>

                            <button
                                type='button'
                                onClick={copyCode}
                                className='border-slr-navy-border flex w-full items-center justify-between gap-2 rounded-lg border border-dashed bg-black/20 px-3 py-2.5 transition-colors hover:border-[#D4AF3759]'>
                                <span className='font-mono text-sm tracking-wider text-white/90'>{code}</span>
                                {copied ? (
                                    <Check className='size-4 shrink-0 text-emerald-400' />
                                ) : (
                                    <Copy className='text-slr-dim size-4 shrink-0' />
                                )}
                            </button>
                            {discount.description ? (
                                <p className='text-slr-muted text-sm leading-relaxed'>{discount.description}</p>
                            ) : null}
                        </div>

                        <div className='space-y-4'>
                            <div className='flex flex-wrap items-center gap-2'>
                                <span className='text-slr-dim inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-xs'>
                                    <Tag className='size-3' /> {discount.category || '-'}
                                </span>
                                {discount.is_featured ? (
                                    <span className='text-slr-gold-label inline-flex items-center gap-1 text-xs font-semibold'>
                                        <Star className='size-3' /> Featured
                                    </span>
                                ) : null}
                            </div>

                            {discount.terms ? (
                                <p className='text-slr-muted text-sm leading-relaxed whitespace-pre-line md:text-base'>
                                    {discount.terms}
                                </p>
                            ) : null}

                            <div className='divide-y divide-white/5 border-t border-white/5'>
                                {discount.website_url ? (
                                    <LinkRow href={discount.website_url} icon={ExternalLink} label='Website' />
                                ) : null}
                                {discount.maps_url ? (
                                    <LinkRow href={discount.maps_url} icon={MapPin} label='View on map' />
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function LinkRow({ href, icon: Icon, label }: { href: string; icon: typeof MapPin; label: string }) {
    return (
        <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-slr-muted flex items-center justify-between gap-2 py-3 text-sm transition-colors hover:text-white'>
            <span className='inline-flex items-center gap-2'>
                <Icon className='text-slr-gold-label size-4' /> {label}
            </span>
            <ExternalLink className='text-slr-dim size-3.5' />
        </a>
    );
}
