'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AU_STATES, AuStateCode } from '@/constant/au-states';
import { MIN_PASSWORD_LENGTH } from '@/constant/password';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { SignUpSchema } from '@/lib/zod';

import { SignUpFormData } from './types';
import { format } from 'date-fns';
import { CalendarIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

type StepAccountProps = {
    data: SignUpFormData;
    onNext: (patch: Partial<SignUpFormData>) => void;
};

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'state' | 'phone' | 'dob' | 'agreedToTerms', string>>;

const StepAccount = ({ data, onNext }: StepAccountProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [values, setValues] = useState({
        name: data.name,
        email: data.email,
        password: data.password,
        state: data.state,
        phone: data.phone,
        dob: data.dob,
        agreedToTerms: data.agreedToTerms ?? false
    });

    const update = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
        setValues((v) => ({ ...v, [key]: value }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            update('dob', format(date, 'yyyy-MM-dd'));
        } else {
            update('dob', '');
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = SignUpSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({
                name: fieldErrors.name?.[0],
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
                state: fieldErrors.state?.[0],
                phone: fieldErrors.phone?.[0],
                dob: fieldErrors.dob?.[0],
                agreedToTerms: fieldErrors.agreedToTerms?.[0]
            });

            return;
        }
        onNext(values);
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    Create your account
                </h2>
                <p className='text-slr-muted mt-1 text-sm'>
                    Tell us a bit about you. We use your state to assign you to the correct draw pool.
                </p>
            </div>

            <div className='grid gap-2'>
                <Label htmlFor='name' className='text-sm font-medium text-white'>
                    Full name
                </Label>
                <Input
                    id='name'
                    type='text'
                    placeholder='Jane Smith'
                    value={values.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoComplete='name'
                    className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                />
                {errors.name && <span className='text-xs text-red-400'>{errors.name}</span>}
            </div>

            <div className='grid gap-2'>
                <Label htmlFor='email' className='text-sm font-medium text-white'>
                    Email
                </Label>
                <Input
                    id='email'
                    type='email'
                    placeholder='you@example.com'
                    value={values.email}
                    onChange={(e) => update('email', e.target.value)}
                    autoComplete='email'
                    className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                />
                {errors.email && <span className='text-xs text-red-400'>{errors.email}</span>}
            </div>

            <div className='grid gap-2'>
                <Label htmlFor='password' className='text-sm font-medium text-white'>
                    Password
                </Label>
                <div className='relative isolate'>
                    <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                        value={values.password}
                        onChange={(e) => update('password', e.target.value)}
                        autoComplete='new-password'
                        className='h-11 rounded-lg border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                    />
                    <button
                        type='button'
                        onClick={() => setShowPassword((s) => !s)}
                        className='absolute top-1/2 right-3 -translate-y-1/2 text-white/50 transition-colors hover:text-white focus:outline-none'
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
                    </button>
                </div>
                {errors.password && <span className='text-xs text-red-400'>{errors.password}</span>}
            </div>

            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                <div className='grid gap-2'>
                    <Label htmlFor='state' className='text-sm font-medium text-white'>
                        State / territory
                    </Label>
                    <Select value={values.state || undefined} onValueChange={(v) => update('state', v as AuStateCode)}>
                        <SelectTrigger
                            id='state'
                            className='h-11 w-full rounded-lg border-white/10 bg-white/5 text-white focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20 data-placeholder:text-white/40'>
                            <SelectValue placeholder='Select…' />
                        </SelectTrigger>
                        <SelectContent className='border-white/10 bg-[#141820] text-white'>
                            {AU_STATES.map((s) => (
                                <SelectItem
                                    key={s.code}
                                    value={s.code}
                                    className='text-white focus:bg-white/10 focus:text-white'>
                                    {s.code} · {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.state && <span className='text-xs text-red-400'>{errors.state}</span>}
                </div>

                <div className='grid gap-2'>
                    <Label htmlFor='phone' className='text-sm font-medium text-white'>
                        Phone
                    </Label>
                    <Input
                        id='phone'
                        type='tel'
                        inputMode='numeric'
                        placeholder='0412345678'
                        value={values.phone}
                        onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                        autoComplete='tel'
                        className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                    />
                    {errors.phone && <span className='text-xs text-red-400'>{errors.phone}</span>}
                </div>
            </div>

            <div className='grid gap-2'>
                <Label htmlFor='dob' className='text-sm font-medium text-white'>
                    Date of birth
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id='dob'
                            type='button'
                            variant='outline'
                            className={cn(
                                'h-11 w-full justify-between rounded-lg border-white/10 bg-white/5 px-3 text-left font-normal text-white hover:bg-white/10 hover:text-white focus:border-[#D4AF37]/60 focus:ring-[#D4AF37]/20 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/60 focus-visible:outline-none',
                                !values.dob && 'text-white/40'
                            )}>
                            {values.dob ? format(new Date(values.dob), 'dd/MM/yyyy') : <span>Select date…</span>}
                            <CalendarIcon className='h-4 w-4 text-white/50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto border-white/10 bg-[#141820] p-0 text-white' align='start'>
                        <Calendar
                            mode='single'
                            captionLayout='dropdown'
                            selected={values.dob ? new Date(values.dob) : undefined}
                            onSelect={handleDateSelect}
                            startMonth={new Date(1900, 0)}
                            endMonth={new Date()}
                            className='bg-[#141820] text-white'
                        />
                    </PopoverContent>
                </Popover>
                {errors.dob && <span className='text-xs text-red-400'>{errors.dob}</span>}
            </div>

            <div className='grid gap-1.5'>
                <div
                    className={cn(
                        'flex items-start gap-3 rounded-lg border p-3.5 transition-colors',
                        errors.agreedToTerms
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    )}>
                    <Checkbox
                        id='agreedToTerms'
                        checked={values.agreedToTerms}
                        onCheckedChange={(checked) => {
                            const next = checked === true;
                            setValues((v) => ({ ...v, agreedToTerms: next }));
                            if (errors.agreedToTerms) setErrors((e) => ({ ...e, agreedToTerms: undefined }));
                        }}
                        className='mt-0.5 shrink-0 border-white/20 focus-visible:ring-[#D4AF37]/30 data-[state=checked]:border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-[#131619]'
                        aria-invalid={!!errors.agreedToTerms}
                    />
                    <label
                        htmlFor='agreedToTerms'
                        className='cursor-pointer text-xs leading-relaxed text-white/85 select-none'>
                        I agree to the{' '}
                        <a
                            href='/terms'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='font-medium text-[#FFDC75] underline decoration-[#FFDC75]/40 underline-offset-2 hover:text-[#FFE066] hover:decoration-[#FFE066]'>
                            Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a
                            href='/privacy'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='font-medium text-[#FFDC75] underline decoration-[#FFDC75]/40 underline-offset-2 hover:text-[#FFE066] hover:decoration-[#FFE066]'>
                            Privacy Policy
                        </a>
                        , and consent to receiving weekly prize draw results, merchant reward updates, and member
                        communications from Smart Life Rewards.
                    </label>
                </div>
                {errors.agreedToTerms && <span className='text-xs text-red-400'>{errors.agreedToTerms}</span>}
            </div>

            <Button
                type='submit'
                style={goldButtonStyle}
                className='mt-2 h-11 w-full rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90'>
                Continue
            </Button>
        </form>
    );
};

export default StepAccount;
