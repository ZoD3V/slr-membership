'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { SafeHoursConfig, SafeHoursDay, SafeHoursOverride, SafeHoursUpdatePayload } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { saveSafeHoursAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const WEEKDAYS: SafeHoursDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OVERRIDE_OPTIONS: { value: SafeHoursOverride; label: string; description: string }[] = [
    { value: 'NONE', label: 'None', description: 'Follow the automatic schedule below.' },
    {
        value: 'FORCE_LOCK',
        label: 'Force lock',
        description: 'Block sign-up & plan changes right now, regardless of schedule.'
    },
    {
        value: 'FORCE_UNLOCK',
        label: 'Force unlock',
        description: 'Force the platform open even during the scheduled window.'
    }
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeField = (label: string) => z.string().regex(TIME_PATTERN, `${label} must be HH:MM, 24h`);

const formSchema = z
    .object({
        day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        start_time: timeField('Start time'),
        end_time: timeField('End time'),
        is_active: z.boolean(),
        manual_override: z.enum(['NONE', 'FORCE_LOCK', 'FORCE_UNLOCK'])
    })
    // Safe as a plain string compare: both sides are always zero-padded
    // 'HH:MM', so lexicographic order matches time-of-day order.
    .refine((values) => values.end_time > values.start_time, {
        message: 'End time must be after start time',
        path: ['end_time']
    });

type FormValues = z.infer<typeof formSchema>;

function toFormValues(config: SafeHoursConfig): FormValues {
    return {
        day_of_week: config.day_of_week,
        start_time: config.start_time,
        end_time: config.end_time,
        is_active: config.is_active,
        manual_override: config.manual_override
    };
}

export function SafeHoursClient({ config, isPlaceholder }: { config: SafeHoursConfig; isPlaceholder: boolean }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(config)
    });

    const onSubmit = (values: FormValues) => {
        const payload: SafeHoursUpdatePayload = values;

        startTransition(async () => {
            const result = await saveSafeHoursAction(payload);

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
        <div className='mx-auto w-full max-w-4xl space-y-4'>
            <p className='text-slr-muted text-sm'>
                Currently locked:{' '}
                {isPlaceholder ? (
                    <span
                        className='text-slr-dim font-semibold'
                        title="Couldn't load live data — this value is unknown, not a real reading.">
                        &mdash;
                    </span>
                ) : (
                    <span
                        className={
                            config.is_currently_locked ? 'font-semibold text-red-400' : 'font-semibold text-emerald-400'
                        }>
                        {config.is_currently_locked ? 'Yes' : 'No'}
                    </span>
                )}
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Lockout window</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='day_of_week'
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
                                                        <SelectItem key={day} value={day}>
                                                            {day}
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
                                        name='start_time'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start time</FormLabel>
                                                <FormControl>
                                                    <Input type='time' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='end_time'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End time</FormLabel>
                                                <FormControl>
                                                    <Input type='time' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name='is_active'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-center justify-between'>
                                            <FormLabel>Window active</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Manual override</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name='manual_override'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Override</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select override' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className='dashboard-theme dark'>
                                                    {OVERRIDE_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {OVERRIDE_OPTIONS.find((opt) => opt.value === field.value)?.description}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Button type='submit' disabled={isPending}>
                        {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                        Save changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
