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

// The three rows are fixed — never added, removed or reordered.
//
// Only the weekly/monthly prize copy is editable. PRD §"Implementation Note:
// Static vs CMS" lists tier names and sub-tier prices under STATIC ("this data
// rarely changes. If it does, just edit the code + re-deploy"), and its MINIMAL
// CMS list covers only the pool headline, prize count, stage label, the per-tier
// weekly/monthly breakdown and the odds. So tier_label and price_label are shown
// as context and round-tripped untouched, never rendered as inputs.
//
// Visitor carries no monthly bonus: PRD's breakdown table shows "—" for it and
// its CMS list names a single "Visitor prize (text)".
const TIER_ROWS = [
    { tier_group: 'visitor', heading: 'Visitor', hasMonthly: false },
    { tier_group: 'red', heading: 'SLR RED', hasMonthly: true },
    { tier_group: 'blue', heading: 'SLR BLUE', hasMonthly: true }
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
                // Carried through the form untouched so a save cannot drop them.
                // Static per PRD — see TIER_ROWS above. No input renders them.
                tier_label: z.string(),
                price_label: z.string(),
                weekly: z.string().min(1, 'Required'),
                // Visitor has none — empty is serialised back to null.
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

    // Price labels are static per PRD, so reading them once from the incoming
    // document is enough — nothing in this form can change them.
    const staticLabels = TIER_ROWS.map(
        ({ tier_group }) => (pool.tiers ?? []).find((tier) => tier.tier_group === tier_group)?.price_label ?? ''
    );

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
                    {/* Headline and sub-label are both short, plain values — paired on
                        one row. Odds and paid members each get a full-width row of
                        their own instead of pairing with one another: a CSS grid
                        stretches every cell in a row to the tallest one, and paid
                        members' derived stage line can run to two lines, which left
                        odds looking oddly padded when the two shared a row. */}
                    <CardContent className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='headline'
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
                            name='prizes_sublabel'
                            render={({ field }) => (
                                <FormItem className='min-w-0'>
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
                                <FormItem className='min-w-0 sm:col-span-2'>
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
                                <FormItem className='min-w-0 sm:col-span-2'>
                                    <FormLabel>Paid members</FormLabel>
                                    <FormControl>
                                        <Input type='number' min={0} step={1} className='max-w-40' {...field} />
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
                                <legend className='flex flex-wrap items-baseline gap-x-2 text-sm font-semibold'>
                                    {row.heading}
                                    <span className='text-muted-foreground text-xs font-normal'>
                                        {staticLabels[index]}
                                    </span>
                                </legend>
                                {/* Weekly keeps the first column on every row so the three
                                    tiers line up, including Visitor, which has no monthly. */}
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.weekly`}
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
                                    {row.hasMonthly ? (
                                        <FormField
                                            control={form.control}
                                            name={`tiers.${index}.monthly`}
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
                                    ) : null}
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
