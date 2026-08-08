'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { activeStage, nextStageNumber, stageLabel, stageProgress } from '@/lib/prizes';
import type { PrizePool } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { savePrizePoolAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// tier_group is fixed: the three rows always exist and are never added or
// removed, so the form edits their copy only.
const TIER_ROWS = [
    { tier_group: 'visitor', heading: 'Visitor' },
    { tier_group: 'red', heading: 'SLR RED' },
    { tier_group: 'blue', heading: 'SLR BLUE' }
] as const;

const formSchema = z.object({
    headline: z.string().min(1, 'Headline is required'),
    prizes_sublabel: z.string().min(1, 'Sub-label is required'),
    odds_label: z.string().min(1, 'Odds label is required'),
    // Require a non-empty value before coercion: z.coerce.number() alone turns
    // "" and "   " into 0, which passes .min(0) and silently zeroes a
    // TPAL-regulated figure. Coerce to string first so blank input is rejected,
    // then parse/validate manually (z.coerce.number() doesn't type-check as a
    // .pipe() target here).
    current_members: z.coerce
        .string()
        .trim()
        .min(1, 'Required')
        .transform((value, ctx) => {
            const parsed = Number(value);

            if (!Number.isInteger(parsed)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a whole number' });

                return z.NEVER;
            }

            if (parsed < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be 0 or more' });

                return z.NEVER;
            }

            return parsed;
        }),
    tiers: z
        .array(
            z.object({
                tier_group: z.enum(['visitor', 'red', 'blue']),
                tier_label: z.string().min(1, 'Required'),
                price_label: z.string().min(1, 'Required'),
                weekly: z.string().min(1, 'Required'),
                // Visitor has no monthly bonus — empty is serialised back to null.
                monthly: z.string()
            })
        )
        .length(3)
        // RED/BLUE require a non-empty monthly bonus; Visitor stays optional.
        .superRefine((tiers, ctx) => {
            tiers.forEach((tier, index) => {
                if (tier.tier_group !== 'visitor' && tier.monthly.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Required',
                        path: [index, 'monthly']
                    });
                }
            });
        })
});

type FormValues = z.infer<typeof formSchema>;

// Shared by defaultValues and the post-save reset, so the form always mirrors
// the document it was seeded from rather than diverging from it.
function toFormValues(pool: PrizePool): FormValues {
    return {
        headline: pool.headline,
        prizes_sublabel: pool.prizes_sublabel,
        odds_label: pool.odds_label,
        current_members: pool.current_members,
        tiers: TIER_ROWS.map(({ tier_group }) => {
            const existing = (pool.tiers ?? []).find((tier) => tier.tier_group === tier_group);

            return {
                tier_group,
                tier_label: existing?.tier_label ?? '',
                price_label: existing?.price_label ?? '',
                weekly: existing?.weekly ?? '',
                monthly: existing?.monthly ?? ''
            };
        })
    };
}

export function PrizesClient({ pool }: { pool: PrizePool }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(pool)
    });

    // Recomputed as the admin types, so the effect of current_members is visible
    // without letting them desynchronise the stage by hand.
    const members = Number(useWatch({ control: form.control, name: 'current_members' })) || 0;
    const stage = activeStage(members);
    const progress = stageProgress(members);
    const nextStage = nextStageNumber(members);

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await savePrizePoolAction({
                headline: values.headline,
                prizes_sublabel: values.prizes_sublabel,
                odds_label: values.odds_label,
                current_members: values.current_members,
                tiers: values.tiers.map((tier) => ({
                    ...tier,
                    monthly: tier.monthly.trim() === '' ? null : tier.monthly
                }))
            });

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
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-4xl space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Prize pool</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='headline'
                            render={({ field }) => (
                                <FormItem>
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
                            name='prizes_sublabel'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sub-label</FormLabel>
                                    <FormControl>
                                        <Input placeholder='@ 22 Prizes • One Month' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='odds_label'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Odds</FormLabel>
                                    <FormControl>
                                        <Input placeholder='9 in 10 wins yearly' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='current_members'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paid members</FormLabel>
                                    <FormControl>
                                        <Input type='number' min={0} step={1} {...field} />
                                    </FormControl>
                                    <FormDescription aria-live='polite'>
                                        {stageLabel(stage)} · progress {progress.pct}%
                                        {nextStage !== null
                                            ? ` · ${progress.remaining.toLocaleString('en-AU')} more until Stage ${nextStage}${nextStage === stage.stage ? ' opens' : ''}`
                                            : ' · top stage reached'}
                                    </FormDescription>
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
                        {TIER_ROWS.map((row, index) => (
                            <fieldset key={row.tier_group} className='min-w-0 space-y-3'>
                                <legend className='text-sm font-semibold'>{row.heading}</legend>
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.tier_label`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tier label</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.price_label`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price label</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.weekly`}
                                        render={({ field }) => (
                                            <FormItem>
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
                                        name={`tiers.${index}.monthly`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormDescription>Leave empty when the tier has none.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </fieldset>
                        ))}
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
