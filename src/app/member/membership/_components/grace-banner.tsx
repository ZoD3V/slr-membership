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

export function GraceBanner({ expiresAt }: GraceBannerProps) {
    const [pending, startTransition] = useTransition();

    const pay = () => {
        startTransition(async () => {
            const res = await payGraceInvoiceAction();
            if (res.ok) {
                window.open(res.url, '_blank', 'noopener,noreferrer');
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[Grace Payment Error]', {
                        endpoint: 'POST /api/v1/billing/pay-manual',
                        error: res
                    });
                }
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
