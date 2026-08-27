import type { Metadata } from 'next';
import Image from 'next/image';

import { auth } from '@/auth';
import { SUB_TIERS } from '@/constant/tiers';
import { handleApiAuthError } from '@/lib/api/guard';
import { getMe } from '@/lib/api/resources/auth';
import { getMyMembership } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { subTierCodeOf } from '@/lib/member';

import ActivatedRedirect from './_components/activated-redirect';
import CompletePaymentClient from './_components/complete-payment-client';

export const metadata: Metadata = {
    title: 'Complete your payment',
    robots: { index: false }
};

type SearchParams = { status?: string };

export default async function CompletePaymentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const { status } = await searchParams;
    const session = await auth();
    const token = await getAccessToken();

    let subTierId: string | undefined;

    let alreadyPaid = false;
    if (token) {
        try {
            const [membership, me] = await Promise.all([getMyMembership(token), getMe(token).catch(() => null)]);
            subTierId = membership.subTierId;
            alreadyPaid = me ? me.requires_payment !== true : membership.billingStatus?.toLowerCase() === 'active';
        } catch (error) {
            handleApiAuthError(error);
        }
    }

    if (alreadyPaid) {
        return (
            <main className='dark bg-slr-navy-deep flex min-h-svh flex-col items-center justify-center px-4 py-12'>
                <ActivatedRedirect />
            </main>
        );
    }

    const subTier = subTierCodeOf(subTierId ?? (session?.user as { sub_tier?: string } | undefined)?.sub_tier);
    const meta = SUB_TIERS[subTier];
    const firstName = (session?.user?.name ?? '').trim().split(' ')[0];
    const price = (meta.price_cents / 100).toFixed(0);
    const planLine = `SLR ${meta.group === 'red' ? 'RED' : 'BLUE'} · ${meta.marketingName} — $${price} / 28-day cycle`;

    const expired = status === 'expired';
    const cancelled = status === 'cancelled';

    return (
        <main className='dark bg-slr-navy-deep flex min-h-svh flex-col items-center justify-center px-4 py-12'>
            <div className='w-full max-w-lg rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-8'>
                <h1 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    {expired
                        ? 'Payment link expired'
                        : cancelled
                          ? 'No worries — nothing has been charged'
                          : `Almost there${firstName ? `, ${firstName}` : ''}`}
                </h1>

                <p className='text-slr-muted mt-2 text-sm'>
                    {expired
                        ? 'Your payment link has expired — no problem. Tap below to start a fresh checkout.'
                        : cancelled
                          ? 'Your account is saved. You can complete your payment whenever you’re ready, or pick a different plan.'
                          : 'Your SLR account is ready — just one step left. Complete your payment to activate your membership and start entering draws.'}
                </p>

                {expired ? null : (
                    <div className='border-slr-navy-border mt-6 flex items-center gap-3 rounded-xl border bg-white/2 p-4'>
                        {meta.badgeIcon && (
                            <Image
                                src={meta.badgeIcon}
                                alt=''
                                width={96}
                                height={96}
                                className='size-10 shrink-0 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                            />
                        )}
                        <div>
                            <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>
                                Your selected plan
                            </p>
                            <p className='mt-1 text-sm font-medium text-white'>{planLine}</p>
                        </div>
                    </div>
                )}

                <div className='mt-6'>
                    <CompletePaymentClient
                        subTier={subTier}
                        ctaLabel={expired ? 'Continue to payment' : 'Complete payment'}
                        showChangePlan={!expired}
                    />
                </div>
            </div>
        </main>
    );
}
