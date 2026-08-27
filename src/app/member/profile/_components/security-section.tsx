'use client';

import { useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';
import { MIN_PASSWORD_LENGTH } from '@/constant/password';
import { goldButtonStyle, inputClassName } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { changePasswordAction } from '../actions';
import { Check, EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';

function PasswordInput({
    value,
    onChange,
    placeholder,
    autoComplete,
    disabled
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoComplete: string;
    disabled: boolean;
}) {
    const [show, setShow] = useState(false);

    return (
        <div className='relative isolate'>
            <Input
                required
                disabled={disabled}
                type={show ? 'text' : 'password'}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(inputClassName, 'pr-10')}
            />
            <button
                type='button'
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-white/50 transition-colors hover:text-white focus:outline-none'>
                {show ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
            </button>
        </div>
    );
}

const EMPTY = { current: '', next: '', confirm: '' };

export function SecuritySection() {
    const [pw, setPw] = useState(EMPTY);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [pending, startTransition] = useTransition();

    const validate = (): string => {
        if (pw.next.length < MIN_PASSWORD_LENGTH) {
            return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        }
        if (pw.next !== pw.confirm) return 'New passwords do not match.';
        if (pw.next === pw.current) return 'New password must be different from your current password.';

        return '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(false);

        const invalid = validate();
        setError(invalid);
        if (invalid) return;

        startTransition(async () => {
            const res = await changePasswordAction({
                currentPassword: pw.current,
                newPassword: pw.next,
                confirmPassword: pw.confirm
            });
            if (res.ok) {
                setPw(EMPTY);
                setSaved(true);
            } else {
                setError(res.message);
            }
        });
    };

    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>Security</h2>

            <form onSubmit={submit} className='mt-4 space-y-3 border-t border-white/5 pt-4'>
                <p className='text-slr-dim text-xs tracking-widest uppercase'>Change password</p>
                <PasswordInput
                    value={pw.current}
                    onChange={(v) => setPw({ ...pw, current: v })}
                    placeholder='Current password'
                    autoComplete='current-password'
                    disabled={pending}
                />
                <PasswordInput
                    value={pw.next}
                    onChange={(v) => setPw({ ...pw, next: v })}
                    placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                    autoComplete='new-password'
                    disabled={pending}
                />
                <PasswordInput
                    value={pw.confirm}
                    onChange={(v) => setPw({ ...pw, confirm: v })}
                    placeholder='Confirm new password'
                    autoComplete='new-password'
                    disabled={pending}
                />
                {error ? <p className='text-sm text-red-400'>{error}</p> : null}
                {saved ? (
                    <p className='inline-flex items-center gap-1.5 text-sm text-emerald-400'>
                        <Check className='size-4' /> Password updated. Use it the next time you sign in.
                    </p>
                ) : null}
                <button
                    type='submit'
                    disabled={pending}
                    className='inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold uppercase disabled:opacity-70'
                    style={goldButtonStyle}>
                    {pending ? (
                        <>
                            <Loader2Icon className='size-4 animate-spin' /> Updating
                        </>
                    ) : (
                        'Update password'
                    )}
                </button>
            </form>
        </section>
    );
}
