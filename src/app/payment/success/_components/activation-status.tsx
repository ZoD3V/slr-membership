'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import EmptyState from '@/components/common/empty-state';
import GoldCtaButton from '@/components/common/gold-cta-button';
import { formatShortDate } from '@/lib/member';

import { type ActivationState, checkActivation } from '../actions';
import { CheckCircle2, Loader2 } from 'lucide-react';

const MAX_TRIES = 10;
const INTERVAL_MS = 2000;

type Phase = 'polling' | 'active' | 'timeout' | 'unauthed';

const SecondaryLink = ({ href, children }: { href: string; children: string }) => (
    <Link href={href} className='text-slr-dim text-sm transition-colors hover:text-white'>
        {children}
    </Link>
);

// Polls the backend until the Stripe webhook flips billing to active (webhook can
// lag 1–5s). Confirms via GET /billing/status rather than parsing `session_id` —
// same outcome, and it doesn't depend on the redirect carrying the id.
export function ActivationStatus() {
    const [phase, setPhase] = useState<Phase>('polling');
    const [detail, setDetail] = useState<ActivationState | null>(null);

    useEffect(() => {
        let cancelled = false;
        let tries = 0;
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            const res = await checkActivation();
            if (cancelled) return;
            setDetail(res);

            if (!res.authed) return setPhase('unauthed');
            if (res.active) return setPhase('active');

            tries += 1;
            if (tries >= MAX_TRIES) return setPhase('timeout');
            timer = setTimeout(poll, INTERVAL_MS);
        };

        poll();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    if (phase === 'polling') {
        return (
            <div className='border-slr-navy-border bg-slr-navy-card mx-auto flex max-w-md flex-col items-center rounded-2xl border px-6 py-12 text-center'>
                <div className='bg-gold-tint mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                    <Loader2 className='text-slr-gold-label size-7 animate-spin' />
                </div>
                <h3 className='font-bebas-neue text-2xl tracking-wider text-white uppercase'>Confirming Payment</h3>
                <p className='text-slr-muted mt-2 text-sm leading-relaxed'>
                    Activating your membership — this takes a few seconds while we confirm your payment.
                </p>
            </div>
        );
    }

    if (phase === 'active') {
        const tier = detail?.tierLabel ?? 'SLR';
        const renewal = detail?.nextRenewalAt ? ` Next billing ${formatShortDate(detail.nextRenewalAt)}.` : '';

        return (
            <EmptyState
                icon={CheckCircle2}
                title='Payment Successful'
                description={`Your ${tier} membership is now active — tokens and draw entries are allocated for this cycle.${renewal}`}
                action={
                    <div className='flex flex-col items-center gap-3'>
                        <GoldCtaButton href='/api/auth/logout' className='w-full max-w-xs'>
                            Sign In to Dashboard
                        </GoldCtaButton>
                    </div>
                }
            />
        );
    }

    if (phase === 'unauthed') {
        return (
            <EmptyState
                icon={CheckCircle2}
                title='Payment Successful'
                description='Your payment went through. Sign in to see your membership and start entering draws.'
                action={
                    <div className='flex flex-col items-center gap-3'>
                        <GoldCtaButton href='/sign-in' className='w-full max-w-xs'>
                            Sign in
                        </GoldCtaButton>
                        <SecondaryLink href='/'>Return home</SecondaryLink>
                    </div>
                }
            />
        );
    }

    // timeout — payment received but activation still settling
    return (
        <EmptyState
            icon={CheckCircle2}
            title='Payment Received'
            description='Your payment went through — activation is taking a moment. Head to your dashboard; it’ll update shortly.'
            action={
                <div className='flex flex-col items-center gap-3'>
                    <GoldCtaButton href='/api/auth/logout' className='w-full max-w-xs'>
                        Sign In to Dashboard
                    </GoldCtaButton>
                </div>
            }
        />
    );
}
