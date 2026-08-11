'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { PrizeContent } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { savePrizeContentAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    prize_pool_headline: z.string().min(1, 'Required'),
    prize_count: z.string().min(1, 'Required'),
    stage_label: z.string().min(1, 'Required'),
    odds: z.string().min(1, 'Required'),
    visitor_prize: z.string().min(1, 'Required'),
    red_weekly: z.string().min(1, 'Required'),
    red_monthly: z.string().min(1, 'Required'),
    blue_weekly: z.string().min(1, 'Required'),
    blue_monthly: z.string().min(1, 'Required')
});

type FormValues = z.infer<typeof formSchema>;

function toFormValues(content: PrizeContent): FormValues {
    return {
        prize_pool_headline: content.prize_pool_headline,
        prize_count: content.prize_count,
        stage_label: content.stage_label,
        odds: content.odds,
        visitor_prize: content.visitor_prize,
        red_weekly: content.red_weekly,
        red_monthly: content.red_monthly,
        blue_weekly: content.blue_weekly,
        blue_monthly: content.blue_monthly
    };
}

export function PrizesClient({ content }: { content: PrizeContent }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(content)
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await savePrizeContentAction(values);

            if (result.ok) {
                toast.success(result.message);
                // Reset from the saved document, not the submitted values — any
                // backend normalisation must be reflected, not silently dropped.
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
            <form onSubmit={form.handleSubmit(onSubmit)} className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
                <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                    <div className='flex flex-col gap-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Prize pool</CardTitle>
                            </CardHeader>
                            <CardContent className='grid gap-4 sm:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='prize_pool_headline'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
                                            <FormLabel>Headline</FormLabel>
                                            <FormControl>
                                                <Input placeholder='$2,100' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='prize_count'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
                                            <FormLabel>Prize count</FormLabel>
                                            <FormControl>
                                                <Input placeholder='@ 22 Prizes • One Month' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='stage_label'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0 sm:col-span-2'>
                                            <FormLabel>Stage label</FormLabel>
                                            <FormControl>
                                                <Input placeholder='For 100 Members • Stage 1' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='odds'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0 sm:col-span-2'>
                                            <FormLabel>Odds</FormLabel>
                                            <FormControl>
                                                <Input placeholder='9 in 10 wins yearly' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prize breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <fieldset className='min-w-0 space-y-3'>
                                    <legend className='text-sm font-semibold'>Visitor</legend>
                                    <FormField
                                        control={form.control}
                                        name='visitor_prize'
                                        render={({ field }) => (
                                            <FormItem className='min-w-0'>
                                                <FormLabel>Prize</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </fieldset>

                                <fieldset className='min-w-0 space-y-3'>
                                    <legend className='text-sm font-semibold'>SLR RED</legend>
                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <FormField
                                            control={form.control}
                                            name='red_weekly'
                                            render={({ field }) => (
                                                <FormItem className='min-w-0'>
                                                    <FormLabel>Weekly</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='red_monthly'
                                            render={({ field }) => (
                                                <FormItem className='min-w-0'>
                                                    <FormLabel>Monthly</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </fieldset>

                                <fieldset className='min-w-0 space-y-3'>
                                    <legend className='text-sm font-semibold'>SLR BLUE</legend>
                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <FormField
                                            control={form.control}
                                            name='blue_weekly'
                                            render={({ field }) => (
                                                <FormItem className='min-w-0'>
                                                    <FormLabel>Weekly</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='blue_monthly'
                                            render={({ field }) => (
                                                <FormItem className='min-w-0'>
                                                    <FormLabel>Monthly</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </fieldset>
                            </CardContent>
                        </Card>

                        <div className='flex justify-end border-t border-white/10 pt-6'>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                Save changes
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
