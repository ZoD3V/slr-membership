'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { goldButtonStyle } from '@/lib/styles';

import { openBillingPortal } from '../actions';
import { ArrowRight, CreditCard, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

export function ManageBillingButton() {
    const [pending, startTransition] = useTransition();

    const open = () => {
        startTransition(async () => {
            const res = await openBillingPortal();
            if (res.ok) {
                window.open(res.url, '_blank', 'noopener,noreferrer'); // open hosted Stripe portal in new tab
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <Button
            onClick={open}
            disabled={pending}
            className='h-10 rounded-xl font-bold uppercase'
            style={goldButtonStyle}>
            {pending ? <Loader2Icon className='size-4 animate-spin' /> : <CreditCard className='size-4' />}
            Manage Billing
            {!pending && <ArrowRight className='size-4' />}
        </Button>
    );
}
