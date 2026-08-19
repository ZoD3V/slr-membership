'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { goldButtonStyle } from '@/lib/styles';
import { zodResolver } from '@hookform/resolvers/zod';

import { submitContactAction } from '../actions';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const subjects = [
    'General enquiry',
    'Membership & billing',
    'Draws & prizes',
    'Discounts & BENY',
    'Technical issue',
    'Partnership opportunity'
];

const formSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().trim().max(20, 'Phone must be 20 characters or fewer').optional(),
    subject: z.string().min(1, 'Select a subject'),
    message: z
        .string()
        .trim()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be 5000 characters or fewer')
});

type FormValues = z.infer<typeof formSchema>;

const fieldNameMap: Record<string, keyof FormValues> = {
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    phone: 'phone',
    subject: 'subject',
    message: 'message'
};

const ContactForm = () => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        }
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                const res = await submitContactAction(values);

                if (res.ok) {
                    toast.success(res.message);
                    form.reset();
                } else {
                    if (res.fieldErrors) {
                        for (const [backendField, message] of Object.entries(res.fieldErrors)) {
                            const field = fieldNameMap[backendField];
                            if (field) form.setError(field, { type: 'server', message });
                        }
                    }
                    toast.error(res.message);
                }
            } catch {
                toast.error('Something went wrong. Please try again.');
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
                <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='firstName'
                        render={({ field }) => (
                            <FormItem className='grid gap-2'>
                                <FormLabel className='text-sm font-medium text-white'>First name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='Jane'
                                        className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='lastName'
                        render={({ field }) => (
                            <FormItem className='grid gap-2'>
                                <FormLabel className='text-sm font-medium text-white'>Last name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='Smith'
                                        className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem className='grid gap-2'>
                                <FormLabel className='text-sm font-medium text-white'>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type='email'
                                        placeholder='you@example.com'
                                        className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem className='grid gap-2'>
                                <FormLabel className='text-sm font-medium text-white'>
                                    Phone <span className='text-white/40'>(optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type='tel'
                                        placeholder='04xx xxx xxx'
                                        className='h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[#D4AF37]/20'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name='subject'
                    render={({ field }) => (
                        <FormItem className='grid gap-2'>
                            <FormLabel className='text-sm font-medium text-white'>Subject</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className='h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus-visible:border-[#D4AF37]/60 focus-visible:ring-[3px] focus-visible:ring-[#D4AF37]/20 focus-visible:outline-none'>
                                    <option value='' disabled className='bg-[#141820]'>
                                        Select a subject…
                                    </option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s} className='bg-[#141820]'>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='message'
                    render={({ field }) => (
                        <FormItem className='grid gap-2'>
                            <FormLabel className='text-sm font-medium text-white'>Message</FormLabel>
                            <FormControl>
                                <textarea
                                    {...field}
                                    rows={5}
                                    placeholder='How can we help?'
                                    className='rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus-visible:border-[#D4AF37]/60 focus-visible:ring-[3px] focus-visible:ring-[#D4AF37]/20 focus-visible:outline-none'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type='submit'
                    disabled={isPending}
                    style={goldButtonStyle}
                    className='h-11 w-full rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                    {isPending ? (
                        <>
                            <Loader2Icon className='animate-spin' />
                            Sending
                        </>
                    ) : (
                        'Send message'
                    )}
                </Button>

                <p className='text-center text-xs text-white/50'>
                    By submitting this form you agree to our{' '}
                    <a href='/privacy' className='text-[#FFDC75] hover:underline'>
                        Privacy Policy
                    </a>
                    .
                </p>
            </form>
        </Form>
    );
};

export default ContactForm;
