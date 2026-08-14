'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MIN_PASSWORD_LENGTH } from '@/constant/password';
import { resetPassword } from '@/lib/api/resources/auth';
import { ApiError } from '@/lib/api/types';
import { goldButtonStyle } from '@/lib/styles';

import { CheckCircle2, EyeIcon, EyeOffIcon, Loader2Icon, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(117.58deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(50px)',
    WebkitBackdropFilter: 'blur(50px)'
};

const inputClass =
    'h-11 rounded-lg border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20';

const ResetPasswordForm = ({ token }: { token: string }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');

            return;
        }
        setError(null);
        setPending(true);
        try {
            await resetPassword(token, password, confirm);
            setDone(true);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : 'Could not reset your password. Please try again.');
        } finally {
            setPending(false);
        }
    };

    if (!token) {
        return (
            <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
                <CardContent className='py-10 text-center'>
                    <div className='mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10'>
                        <TriangleAlert className='h-6 w-6 text-red-400' />
                    </div>
                    <h3 className='font-bebas-neue mt-4 text-2xl tracking-wider text-white uppercase'>
                        Invalid reset link
                    </h3>
                    <p className='text-slr-muted mt-2 text-sm'>
                        This link is missing its token or has expired. Request a fresh one to continue.
                    </p>
                    <Link
                        href='/forgot-password'
                        className='mt-6 inline-block text-xs font-semibold text-[#FFDC75] hover:underline'>
                        Request a new link
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (done) {
        return (
            <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
                <CardContent className='py-10 text-center'>
                    <div className='bg-gold-tint mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                        <CheckCircle2 className='h-6 w-6 text-[#FFDC75]' />
                    </div>
                    <h3 className='font-bebas-neue mt-4 text-2xl tracking-wider text-white uppercase'>
                        Password updated
                    </h3>
                    <p className='text-slr-muted mt-2 text-sm'>
                        Your password has been changed. You can now sign in with your new password.
                    </p>
                    <Link href='/sign-in' className='mt-6 inline-block'>
                        <Button
                            type='button'
                            style={goldButtonStyle}
                            className='h-11 rounded-xl px-8 font-bold uppercase shadow-md transition-opacity hover:opacity-90'>
                            Sign in
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card style={glassStyle} className='gap-4 border-0 text-white shadow-2xl'>
            <CardHeader>
                <CardTitle className='font-bebas-neue text-3xl tracking-wider text-white md:text-4xl'>
                    Set a new password
                </CardTitle>
                <CardDescription className='text-slr-muted'>
                    Choose a strong password you haven&apos;t used before.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-5'>
                        <div className='grid gap-2'>
                            <Label htmlFor='password' className='text-sm font-medium text-white'>
                                New password
                            </Label>
                            <div className='relative isolate'>
                                <Input
                                    id='password'
                                    type={show ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    required
                                    placeholder='Minimum 8 characters'
                                    autoComplete='new-password'
                                    className={inputClass}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShow((s) => !s)}
                                    className='absolute top-1/2 right-3 -translate-y-1/2 text-white/50 transition-colors hover:text-white focus:outline-none'
                                    aria-label={show ? 'Hide password' : 'Show password'}>
                                    {show ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
                                </button>
                            </div>
                        </div>

                        <div className='grid gap-2'>
                            <Label htmlFor='confirm' className='text-sm font-medium text-white'>
                                Confirm password
                            </Label>
                            <Input
                                id='confirm'
                                type={show ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => {
                                    setConfirm(e.target.value);
                                    if (error) setError(null);
                                }}
                                required
                                placeholder='Re-enter your password'
                                autoComplete='new-password'
                                className={inputClass}
                            />
                        </div>

                        {error && <span className='text-xs text-red-400'>{error}</span>}

                        <Button
                            type='submit'
                            disabled={pending}
                            style={goldButtonStyle}
                            className='h-11 w-full rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                            {pending ? (
                                <>
                                    <Loader2Icon className='animate-spin' /> Updating
                                </>
                            ) : (
                                'Update password'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ResetPasswordForm;
