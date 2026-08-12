'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { verifyEmail } from '@/lib/api/resources/auth';
import { ApiError } from '@/lib/api/types';
import { goldButtonStyle } from '@/lib/styles';

import { CheckCircle2, Loader2Icon, TriangleAlert } from 'lucide-react';

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

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        const run = async () => {
            try {
                await verifyEmail(token);
                if (!cancelled) setStatus('success');
            } catch (err) {
                if (cancelled) return;
                // The backend's error path currently 500s for both an expired
                // and an invalid token instead of a distinct 400/404 (verified
                // live 2026-08-12, see BACKEND-ISSUES.md) — one generic message
                // for now rather than guessing which case it is.
                setErrorMessage(
                    err instanceof ApiError
                        ? 'This verification link is invalid or has expired.'
                        : 'Could not verify your email. Please try again.'
                );
                setStatus('error');
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [token]);

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
                <Link href='/member' className='mt-6 inline-block text-xs font-semibold text-[#FFDC75] hover:underline'>
                    Back to dashboard
                </Link>
            </CardContent>
        </Card>
    );
};

export default VerifyEmailPanel;
