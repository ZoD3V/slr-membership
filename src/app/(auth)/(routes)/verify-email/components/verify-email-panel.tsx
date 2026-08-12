'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { resendVerification, verifyEmail } from '@/lib/api/resources/auth';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { goldButtonStyle } from '@/lib/styles';

import { CheckCircle2, Loader2Icon, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(117.58deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(50px)',
    WebkitBackdropFilter: 'blur(50px)'
};

type Status = 'loading' | 'success' | 'error';

const VerifyEmailPanel = ({ token }: { token: string }) => {
    const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
    const [errorMessage, setErrorMessage] = useState('This link is missing its token.');
    // A broken/expired link may be opened on a device where the member was
    // never signed in, so resend can't read the email from a session — it
    // has to be typed here. The API takes a bare email, no auth required.
    const [resendEmail, setResendEmail] = useState('');
    const [resendPending, setResendPending] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        const run = async () => {
            try {
                await verifyEmail(token);
                if (!cancelled) setStatus('success');
            } catch (err) {
                if (cancelled) return;
                // Backend now answers a proper 400 with a specific message
                // (fixed 2026-08-12, was a generic 500 earlier the same day)
                // — surface it as-is instead of a guessed generic string.
                setErrorMessage(
                    err instanceof ApiError ? apiErrorMessage(err) : 'Could not verify your email. Please try again.'
                );
                setStatus('error');
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const onResendSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResendPending(true);
        try {
            const result = await resendVerification(resendEmail);
            setResendSent(true);
            toast.success(result.message);
        } catch (err) {
            toast.error(err instanceof ApiError ? apiErrorMessage(err) : 'Could not resend the verification email.');
        } finally {
            setResendPending(false);
        }
    };

    if (status === 'loading') {
        return (
            <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
                <CardContent className='py-14 text-center'>
                    <Loader2Icon className='mx-auto size-8 animate-spin text-[#FFDC75]' />
                    <p className='text-slr-muted mt-4 text-sm'>Verifying your email…</p>
                </CardContent>
            </Card>
        );
    }

    if (status === 'success') {
        return (
            <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
                <CardContent className='py-10 text-center'>
                    <div className='bg-gold-tint mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                        <CheckCircle2 className='h-6 w-6 text-[#FFDC75]' />
                    </div>
                    <h3 className='font-bebas-neue mt-4 text-2xl tracking-wider text-white uppercase'>
                        Email verified
                    </h3>
                    <p className='text-slr-muted mt-2 text-sm'>
                        Email verified successfully! You&apos;re all set — we can now reach you if you win.
                    </p>
                    <Link href='/member' className='mt-6 inline-block'>
                        <Button
                            type='button'
                            style={goldButtonStyle}
                            className='h-11 rounded-xl px-8 font-bold uppercase shadow-md transition-opacity hover:opacity-90'>
                            Go to dashboard
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
            <CardContent className='py-10 text-center'>
                <div className='mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10'>
                    <TriangleAlert className='h-6 w-6 text-red-400' />
                </div>
                <h3 className='font-bebas-neue mt-4 text-2xl tracking-wider text-white uppercase'>
                    Verification failed
                </h3>
                <p className='text-slr-muted mt-2 text-sm'>{errorMessage}</p>

                {resendSent ? (
                    <p className='mt-6 text-sm text-emerald-400'>A new verification link has been sent.</p>
                ) : (
                    <form onSubmit={onResendSubmit} className='mt-6 flex flex-col gap-2 text-left'>
                        <label htmlFor='resend-email' className='text-slr-muted text-xs'>
                            Get a new link sent to your email
                        </label>
                        <div className='flex gap-2'>
                            <Input
                                id='resend-email'
                                type='email'
                                required
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder='you@example.com'
                                className='h-10 border-white/10 bg-white/5 text-white placeholder:text-white/40'
                            />
                            <Button
                                type='submit'
                                disabled={resendPending}
                                style={goldButtonStyle}
                                className='h-10 shrink-0 rounded-lg px-4 text-xs font-bold uppercase'>
                                {resendPending ? 'Sending…' : 'Resend link'}
                            </Button>
                        </div>
                    </form>
                )}

                <Link href='/' className='mt-6 inline-block text-xs font-semibold text-[#FFDC75] hover:underline'>
                    Back to Home
                </Link>
            </CardContent>
        </Card>
    );
};

export default VerifyEmailPanel;
