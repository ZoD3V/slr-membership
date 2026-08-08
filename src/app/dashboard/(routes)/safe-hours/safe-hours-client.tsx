'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SafeHoursConfig, Weekday } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { saveSafeHoursAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const WEEKDAYS: { value: Weekday; label: string }[] = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
];

// Blank input must be rejected, not coerced to 0 — see prizes-client.tsx's
// current_members field for the same reasoning applied to a different value.
const hourField = (label: string) =>
    z.coerce
        .string()
        .trim()
        .min(1, 'Required')
        .transform((value, ctx) => {
            const parsed = Number(value);

            if (!Number.isInteger(parsed)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be a whole number` });

                return z.NEVER;
            }

            if (parsed < 0 || parsed > 23) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be between 0 and 23` });

                return z.NEVER;
            }

            return parsed;
        });

const formSchema = z
    .object({
        weekday: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        start_hour: hourField('Start hour'),
        end_hour: hourField('End hour')
    })
    .refine((values) => values.end_hour > values.start_hour, {
        message: 'End hour must be after start hour',
        path: ['end_hour']
    });

type FormValues = z.infer<typeof formSchema>;

function toFormValues(config: SafeHoursConfig): FormValues {
    return {
        weekday: config.weekday,
        start_hour: config.start_hour,
        end_hour: config.end_hour
    };
}

export function SafeHoursClient({ config }: { config: SafeHoursConfig }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(config)
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await saveSafeHoursAction(values);

            if (result.ok) {
                toast.success(result.message);
                form.reset(toFormValues(result.data));
            } else {
                toast.error(result.message, {
                    description: result.status ? `status ${result.status} · ${result.code ?? 'no code'}` : undefined
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-md space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Lockout window</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='weekday'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select day' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='dashboard-theme dark'>
                                            {WEEKDAYS.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='start_hour'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start hour</FormLabel>
                                        <FormControl>
                                            <Input type='number' min={0} max={23} step={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='end_hour'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End hour</FormLabel>
                                        <FormControl>
                                            <Input type='number' min={0} max={23} step={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type='submit' disabled={isPending}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </form>
        </Form>
    );
}
