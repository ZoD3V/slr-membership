import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import EmptyState from '@/components/common/empty-state';
import GoldCtaButton from '@/components/common/gold-cta-button';

import { XCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Payment Cancelled',
    robots: { index: false }
};

// Stripe Checkout cancel return (STRIPE_CANCEL_URL). Public, but a member who
// signed up and then backed out still has an account — send them where they can
// finish paying instead of to the marketing page.
export default async function PaymentCancelPage() {
    const session = await auth();
    if ((session?.user as { requiresPayment?: boolean } | undefined)?.requiresPayment) {
        redirect('/complete-payment?status=cancelled');
    }

    return (
        <main className='dark bg-slr-ink flex min-h-svh flex-col items-center justify-center px-4 py-12'>
            <EmptyState
                icon={XCircle}
                title='No worries — nothing has been charged'
                description='Your account is saved. You can complete your payment whenever you’re ready, or pick a different plan.'
                action={
                    <div className='flex flex-col items-center gap-3'>
                        <GoldCtaButton href='/membership' className='w-full max-w-xs'>
                            Choose a plan
                        </GoldCtaButton>
                        <Link href='/sign-in' className='text-slr-dim text-sm transition-colors hover:text-white'>
                            Log in to finish your payment
                        </Link>
                    </div>
                }
            />
        </main>
    );
}
