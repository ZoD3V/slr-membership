'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';

import { resendVerificationEmailAction } from '../../verification-actions';
import { MailWarning } from 'lucide-react';
import { toast } from 'sonner';

/** Dashboard banner for a paid member (RED/BLUE) whose email is unverified —
 *  Visitor is OTP-verified at signup and never sees this (PRD: link-based
 *  verification is paid-tier only). */
export function EmailVerificationBanner() {
    const [isPending, startTransition] = useTransition();
    const [sent, setSent] = useState(false);

    const onResend = () => {
        startTransition(async () => {
            const result = await resendVerificationEmailAction();

            if (result.ok) {
                setSent(true);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className='rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 md:p-5'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='flex items-start gap-3'>
                    <MailWarning className='mt-0.5 size-5 shrink-0 text-amber-400' />
                    <div>
                        <h3 className='text-sm font-semibold text-amber-100'>Verify your email</h3>
                        <p className='text-slr-muted mt-1 text-sm leading-relaxed'>
                            Verify your email so we can reach you if you win.
                        </p>
                    </div>
                </div>
                <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={isPending || sent}
                    onClick={onResend}
                    className='shrink-0 border-amber-500/40 text-amber-100 hover:bg-amber-500/10'>
                    {sent ? 'Link sent' : isPending ? 'Sending…' : 'Resend Verification'}
                </Button>
            </div>
        </div>
    );
}
