'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { goldBgStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { SignInSchema } from '@/lib/zod';

import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { getSession, signIn } from 'next-auth/react';

// Glassmorphism style per design system
const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(117.58deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(50px)',
    WebkitBackdropFilter: 'blur(50px)'
};

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // `busy` covers both the sign-in request AND the redirect that follows, so the
    // button never flips back to idle between success and the page swap.
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const paramEmail = searchParams?.get('email');
        if (paramEmail) {
            setEmail(paramEmail);
        } else if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('slr_registered_email');
            if (stored) setEmail(stored);
        }
    }, [searchParams]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Client-side login: signIn() hits the stable /api/auth route (NOT a build-hashed
    // server action), so a redeploy can't strand this call — no post-update crash at
    // the login gate. Redirect via full-page load so we land on the live deployment.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const form = new FormData(event.currentTarget);
        const parsed = SignInSchema.safeParse(Object.fromEntries(form));
        if (!parsed.success) {
            setError('Please enter a valid email and password (min 10 characters).');

            return;
        }

        setBusy(true);
        const res = await signIn('credentials', { ...parsed.data, redirect: false });
        if (!res || res.error) {
            setBusy(false);
            setError('Invalid credentials. Please try again.');

            return;
        }

        const session = await getSession();
        const role = String((session?.user as { role?: string })?.role ?? '').toLowerCase();
        window.location.href = role.includes('admin') ? '/dashboard' : '/member';
    };

    return (
        <div className={cn('font-body flex flex-col gap-6', className)} {...props}>
            <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
                <CardHeader>
                    <CardTitle className='font-bebas-neue text-3xl tracking-wider text-white md:text-4xl'>
                        Sign In
                    </CardTitle>
                    <CardDescription className='text-slr-muted'>
                        Enter your email below to login to your account
                    </CardDescription>
                    {error && (
                        <div className='mt-2 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400'>
                            {error}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col gap-5'>
                            <div className='grid gap-2'>
                                <Label htmlFor='email' className='text-sm font-medium text-white'>
                                    Email
                                </Label>
                                <Input
                                    id='email'
                                    type='text'
                                    name='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='email@example.com'
                                    required
                                    className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                />
                            </div>

                            <div className='grid gap-2'>
                                <div className='flex items-baseline justify-between'>
                                    <Label htmlFor='password' className='text-sm font-medium text-white'>
                                        Password
                                    </Label>
                                    <Link
                                        href='/forgot-password'
                                        className='text-xs font-medium text-[#FFDC75] hover:underline'>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className='relative isolate'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        name='password'
                                        required
                                        placeholder='Enter your password'
                                        className='h-11 rounded-lg border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                    />
                                    <button
                                        type='button'
                                        onClick={togglePasswordVisibility}
                                        className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-white/50 transition-colors hover:text-white focus:outline-none'
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? (
                                            <EyeOffIcon className='h-4 w-4' />
                                        ) : (
                                            <EyeIcon className='h-4 w-4' />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 pt-2'>
                                {busy ? (
                                    <Button
                                        disabled
                                        style={goldBgStyle}
                                        className='h-11 w-full rounded-full font-bold text-[#1a1408] opacity-80 shadow-md'>
                                        <Loader2Icon className='animate-spin' />
                                        Loading
                                    </Button>
                                ) : (
                                    <Button
                                        type='submit'
                                        style={goldBgStyle}
                                        className='h-11 w-full rounded-xl font-bold text-[#1a1408] shadow-md transition-opacity hover:opacity-90'>
                                        Login
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
