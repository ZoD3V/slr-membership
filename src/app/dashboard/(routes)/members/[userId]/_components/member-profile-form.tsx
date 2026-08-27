'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AU_STATES, AU_STATE_CODES, type AuStateCode } from '@/constant/au-states';
import type { AdminMemberProfilePayload } from '@/lib/api/resources/admin';
import { zodResolver } from '@hookform/resolvers/zod';

import { updateMemberProfileAction } from '../../actions';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    full_name: z.string().trim().min(1, 'Full name is required').max(200, 'Full name is too long'),
    email: z.string().trim().email('Enter a valid email address').max(255, 'Email is too long'),
    phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9]{8,15}$/, 'Enter 8–15 digits, optionally starting with +')
        .or(z.literal('')),
    state: z.enum(AU_STATE_CODES).or(z.literal('')),
    dob: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker')
        .or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

export type MemberProfileInitialValues = {
    full_name: string;
    email: string;
    phone: string;
    state: string;
    dob: string;
};

const toStateValue = (state: string): AuStateCode | '' =>
    AU_STATE_CODES.includes(state?.toUpperCase() as AuStateCode) ? (state.toUpperCase() as AuStateCode) : '';

const toDateInput = (dob: string): string => (dob ? dob.slice(0, 10) : '');

export function MemberProfileForm({ userId, initial }: { userId: string; initial: MemberProfileInitialValues }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const defaults: FormValues = {
        full_name: initial.full_name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        state: toStateValue(initial.state ?? ''),
        dob: toDateInput(initial.dob ?? '')
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaults
    });

    const changedFields = (values: FormValues): AdminMemberProfilePayload => {
        const payload: AdminMemberProfilePayload = {};

        if (values.full_name !== defaults.full_name) payload.full_name = values.full_name;
        if (values.email !== defaults.email) payload.email = values.email;
        if (values.phone !== defaults.phone) payload.phone = values.phone;
        if (values.state !== defaults.state && values.state) payload.state = values.state;

        if (values.dob !== defaults.dob) payload.dob = values.dob || null;

        return payload;
    };

    const onSubmit = (values: FormValues) => {
        const payload = changedFields(values);

        if (Object.keys(payload).length === 0) {
            toast.info('No changes to save.');

            return;
        }

        startTransition(async () => {
            const res = await updateMemberProfileAction(userId, payload);

            if (res.ok) {
                toast.success(res.message);
                form.reset(values);
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Edit profile</CardTitle>
                <CardDescription>
                    Update the member&apos;s personal details and draw-pool state. Only changed fields are sent.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='grid items-start gap-x-4 gap-y-3 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='full_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Member name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='phone'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input inputMode='tel' placeholder='+61400000000' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='dob'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of birth</FormLabel>
                                    <FormControl>
                                        <Input type='date' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='state'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Draw-pool state</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select state' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='dashboard-theme dark'>
                                            {AU_STATES.map((s) => (
                                                <SelectItem key={s.code} value={s.code}>
                                                    {s.code} — {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type='email' placeholder='member@example.com' {...field} />
                                    </FormControl>
                                    <FormDescription>Must be unique across the platform.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='sm:col-span-2'>
                            <Button type='submit' disabled={pending || !form.formState.isDirty}>
                                {pending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : 'Save profile'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
