'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminGiveawayPayload, AdminGiveawayTier, AdminGiveawayType } from '@/lib/api/resources/giveaways';
import { zodResolver } from '@hookform/resolvers/zod';

import { createGiveawayAction, updateGiveawayAction } from '../actions';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// UPPERCASE — the admin endpoints reject lowercase enums with a 400.
const TIER_OPTIONS: { value: AdminGiveawayTier; label: string }[] = [
    { value: 'VISITOR', label: 'Visitor' },
    { value: 'RED', label: 'SLR Red' },
    { value: 'BLUE', label: 'SLR Blue' }
];

const TYPE_OPTIONS: { value: AdminGiveawayType; label: string }[] = [
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' }
];

// All three dates are required server-side; a partial body is rejected.
const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    tier: z.enum(['VISITOR', 'RED', 'BLUE']),
    type: z.enum(['WEEKLY', 'MONTHLY']),
    prize: z.string().min(1, 'Prize is required'),
    opensAt: z.string().min(1, 'Opening time is required'),
    closesAt: z.string().min(1, 'Closing time is required'),
    drawsAt: z.string().min(1, 'Draw time is required')
});

type FormValues = z.infer<typeof formSchema>;

export interface GiveawayFormInitialData {
    id: string;
    name: string;
    tier: AdminGiveawayTier;
    type: AdminGiveawayType;
    prize: string;
    opensAt: string;
    closesAt: string;
    drawsAt: string;
}

/** ISO → the `YYYY-MM-DDTHH:mm` a datetime-local input expects, in local time. */
const toLocalInput = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIso = (local: string): string => new Date(local).toISOString();

export function GiveawayForm({ initialData }: { initialData?: GiveawayFormInitialData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const title = initialData ? 'Edit Giveaway' : 'New Giveaway';
    const description = initialData ? 'Update this draw’s schedule and prize' : 'Schedule a new tier draw';

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: initialData
            ? {
                  name: initialData.name,
                  tier: initialData.tier,
                  type: initialData.type,
                  prize: initialData.prize,
                  opensAt: toLocalInput(initialData.opensAt),
                  closesAt: toLocalInput(initialData.closesAt),
                  drawsAt: toLocalInput(initialData.drawsAt)
              }
            : { name: '', tier: 'RED', type: 'MONTHLY', prize: '', opensAt: '', closesAt: '', drawsAt: '' }
    });

    const onSubmit = (values: FormValues) => {
        const opens = toIso(values.opensAt);
        const closes = toIso(values.closesAt);
        const draws = toIso(values.drawsAt);

        // Entries close before the draw runs, and the window has to open first.
        if (opens >= closes) {
            form.setError('closesAt', { message: 'Closing time must be after the opening time' });

            return;
        }
        if (draws < closes) {
            form.setError('drawsAt', { message: 'Draw time cannot be before entries close' });

            return;
        }

        startTransition(async () => {
            const payload: AdminGiveawayPayload = {
                name: values.name,
                tier: values.tier,
                type: values.type,
                prize: values.prize,
                opens_at: opens,
                closes_at: closes,
                draws_at: draws
            };

            const res = initialData
                ? await updateGiveawayAction(initialData.id, payload)
                : await createGiveawayAction(payload);

            if (res.ok) {
                toast.success(res.message);
                router.push('/dashboard/giveaways');
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
            <div className='flex items-center gap-4'>
                <Button variant='outline' size='icon' asChild>
                    <Link href='/dashboard/giveaways'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <Heading title={title} description={description} />
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='SLR Red Monthly' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='prize'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prize</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Toyota HiLux SR5' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tier'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tier</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a tier' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {TIER_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        {o.label}
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
                                name='type'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {TYPE_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 items-start gap-6 sm:grid-cols-3'>
                            <FormField
                                control={form.control}
                                name='opensAt'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opens at</FormLabel>
                                        <FormControl>
                                            <Input type='datetime-local' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='closesAt'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Closes at</FormLabel>
                                        <FormControl>
                                            <Input type='datetime-local' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='drawsAt'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Draws at</FormLabel>
                                        <FormControl>
                                            <Input type='datetime-local' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='flex justify-end gap-3 border-t border-white/10 pt-6'>
                            <Button variant='outline' asChild>
                                <Link href='/dashboard/giveaways'>Cancel</Link>
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                {initialData ? 'Save Changes' : 'Create Giveaway'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
