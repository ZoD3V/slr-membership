'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';

import { payGraceInvoiceAction } from '../actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

interface GraceBannerProps {
    expiresAt: string | null;
}

// Shown when billing_status === 'grace'. "Pay now" opens the hosted Stripe
// checkout for the overdue invoice; on success the browser redirects there.
export function GraceBanner({ expiresAt }: GraceBannerProps) {
    const [pending, startTransition] = useTransition();

    const pay = () => {
        startTransition(async () => {
            const res = await payGraceInvoiceAction();
            if (res.ok) {
                window.location.href = res.url; // hosted Stripe payment
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <section className='rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 md:p-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                    <h2 className='font-bebas-neue text-xl tracking-wide text-amber-300 uppercase'>Payment overdue</h2>
                    <p className='text-slr-muted mt-1 text-sm'>
                        Your renewal payment failed. Pay now to keep your membership active
                        {expiresAt ? <> — access ends {formatShortDate(expiresAt)}</> : null}.
                    </p>
                </div>
                <Button
                    className='h-11 rounded-xl font-bold uppercase'
                    style={goldButtonStyle}
                    disabled={pending}
                    onClick={pay}>
                    {pending ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : null}
                    Pay now
                </Button>
            </div>
        </section>
    );
}
