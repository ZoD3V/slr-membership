'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import type { SubTierCode } from '@/types/member';
import { MembershipCard } from './membership-card';
import { ChevronRight, CreditCard } from 'lucide-react';

interface MembershipCardDialogProps {
    name: string;
    subTier: SubTierCode;
    userId: string;
    state: string;
    joinedAt: string | null;
}

export function MembershipCardDialog({ name, subTier, userId, state, joinedAt }: MembershipCardDialogProps) {
    // Generates a mock format SLR-[STATE]-[UUID_SHORT] for partner cashiers
    const stateCode = state ? state.toUpperCase() : 'AU';
    const shortId = userId ? userId.substring(0, 8).toUpperCase() : 'MEMBER';
    const memberId = `SLR-${stateCode}-${shortId}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type='button'
                    className='bg-card-dark-navy border-slr-navy-border flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors cursor-pointer focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none'
                >
                    <span className='bg-white/5 flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10'>
                        <CreditCard className='text-slr-gold-label size-5' />
                    </span>
                    <span className='min-w-0'>
                        <span className='block font-semibold text-white'>Membership card</span>
                        <span className='text-slr-dim block text-xs'>Tap to view your digital card &amp; QR</span>
                    </span>
                    <ChevronRight className='text-slr-dim ml-auto size-5 shrink-0' />
                </button>
            </DialogTrigger>

            {/* Explicit dark page dialog wrapper styling */}
            <DialogContent className='border-slr-navy-border bg-[#131619] text-white sm:max-w-xl focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none'>
                <DialogHeader className='text-left'>
                    <DialogTitle className='font-bebas-neue text-2xl tracking-wide uppercase'>
                        Membership Card
                    </DialogTitle>
                    <DialogDescription className='text-slr-dim text-xs'>
                        Show this tag at check-out in local partner stores for cashier validation.
                    </DialogDescription>
                </DialogHeader>
                <div className='w-full py-2'>
                    <MembershipCard
                        name={name}
                        subTier={subTier}
                        memberId={memberId}
                        joinedAt={joinedAt}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
