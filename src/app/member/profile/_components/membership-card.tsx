'use client';

import React from 'react';

import Image from 'next/image';

import { TIER_VISUALS } from '@/constant/tiers';
import { formatShortDate } from '@/lib/member';
import { cn } from '@/lib/utils';
import type { SubTierCode } from '@/types/member';

import { QRCodeSVG } from 'qrcode.react';

interface MembershipCardProps {
    name: string;
    subTier: SubTierCode;
    memberId: string;
    joinedAt: string | null;
}

export function MembershipCard({ name, subTier, memberId, joinedAt }: MembershipCardProps) {
    const isRed = subTier.startsWith('R');
    const isBlue = subTier.startsWith('B');

    let cardBgStyle = 'border-[#A0B4D2]/25';
    let textAccent = 'text-[#8EA0B8]';
    let borderAccent = 'rgba(255,255,255,0.08)';
    let inlineBg = {};

    if (isRed) {
        inlineBg = {
            background: 'linear-gradient(154.36deg, #1C0308 0.82%, #2A0810 49.73%, #1A0306 98.65%)'
        };
        cardBgStyle = 'border-[#C8152E]/40';
        textAccent = 'text-[#E88888]';
        borderAccent = 'rgba(200, 21, 46, 0.2)';
    } else if (isBlue) {
        inlineBg = {
            background: 'linear-gradient(154.36deg, #0E1828 0.82%, #142034 49.73%, #0E1828 98.65%)'
        };
        cardBgStyle = 'border-[#2878E8]/30';
        textAccent = 'text-[#2878E8]';
        borderAccent = 'rgba(40, 120, 232, 0.2)';
    } else if (subTier.toLowerCase().includes('gold')) {
        inlineBg = {
            background: 'linear-gradient(89.12deg, #1A150A 3.07%, #2B210B 41.36%, #1A150A 98.79%)'
        };
        cardBgStyle = 'border-[#D4AF37]/40';
        textAccent =
            'text-gradient-gold bg-[linear-gradient(89.12deg,#F5D78E_3.07%,#D4AF37_41.36%,#FFE066_60.5%,#A07018_98.79%)] bg-clip-text text-transparent';
        borderAccent = 'rgba(212, 175, 55, 0.2)';
    } else {
        inlineBg = {
            background: 'linear-gradient(154.36deg, #141820 0.82%, #1E2530 49.73%, #141820 98.65%)'
        };
    }

    return (
        <div
            style={inlineBg}
            className={cn(
                'group relative flex min-h-[210px] w-full cursor-default flex-col justify-between gap-8 overflow-hidden rounded-2xl border p-5 shadow-2xl transition-all duration-300 sm:p-6',
                cardBgStyle
            )}>
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:12px_12px] opacity-40' />

            <div className='pointer-events-none absolute -top-14 -right-14 size-44 rounded-full bg-white/5 blur-3xl' />

            <div className='absolute top-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent' />

            <div className='relative z-10 flex items-start justify-between gap-2'>
                <Image
                    src='/images/slr-rewards-logo.webp'
                    alt='SLR Rewards'
                    width={250}
                    height={250}
                    className='h-6 w-auto object-contain brightness-95'
                    priority
                />
                <div
                    className={cn(
                        'rounded-full border border-white/5 bg-white/3 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase',
                        textAccent
                    )}>
                    {subTierNameFormat(subTier)}
                </div>
            </div>

            <div className='relative z-10 flex items-end justify-between gap-3'>
                <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-[8px] font-semibold tracking-widest text-white/30 uppercase'>Member</p>
                    <p className='font-bebas-neue truncate text-xl leading-none font-bold tracking-wider text-white uppercase md:text-2xl'>
                        {name}
                    </p>
                    <p className='mt-0.5 font-mono text-[9px] font-semibold tracking-wider text-white/60'>{memberId}</p>
                    {joinedAt && (
                        <p className='text-slr-dim mt-1 text-[9px] tracking-wide'>
                            Member since {formatShortDate(joinedAt)}
                        </p>
                    )}
                </div>

                <div
                    style={{ borderColor: borderAccent }}
                    className='shrink-0 rounded-lg border bg-white p-1.5 shadow-md'>
                    <QRCodeSVG
                        value={memberId}
                        size={56}
                        level='M'
                        bgColor='#FFFFFF'
                        fgColor='#000000'
                        includeMargin={false}
                    />
                </div>
            </div>
        </div>
    );
}

function subTierNameFormat(code: SubTierCode): string {
    return `SLR ${code}`;
}
