'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminWinnerPayload } from '@/lib/api/resources/giveaways';
import { zodResolver } from '@hookform/resolvers/zod';

import { createWinnerAction, updateWinnerAction } from '../../giveaways/actions';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// The API accepts only these three fields — name and state are read from the
// member record behind user_id, so collecting them here would be ignored.
const formSchema = z.object({
    giveawayId: z.string().min(1, 'Giveaway is required'),
    userId: z.string().min(1, 'Member ID is required'),
    prize: z.string().min(1, 'Prize is required')
});

type FormValues = z.infer<typeof formSchema>;

export interface WinnerFormInitialData {
    winnerId: string;
    giveawayId: string;
    userId: string;
    prize: string;
}

export interface GiveawayOption {
    id: string;
    label: string;
}

export function WinnerForm({
    giveaways,
    initialData,
    defaultGiveawayId
}: {
    giveaways: GiveawayOption[];
    initialData?: WinnerFormInitialData;
    defaultGiveawayId?: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const title = initialData ? 'Edit Winner' : 'Record Winner';
    const description = initialData
        ? 'Correct a recorded draw result'
        : 'Record the result of a draw run at randomdraws.com/au';

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: initialData
            ? { giveawayId: initialData.giveawayId, userId: initialData.userId, prize: initialData.prize }
            : { giveawayId: defaultGiveawayId ?? '', userId: '', prize: '' }
    });

    // API Contract §13: recording a winner sets draw_pass = 0, which drops the member
    // from the rest of the cycle's giveaways — admin must confirm before it happens.
    const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

    const submit = (values: FormValues) => {
        startTransition(async () => {
            const payload: AdminWinnerPayload = {
                giveaway_id: values.giveawayId,
                user_id: values.userId,
                prize: values.prize
            };

            const res = initialData
                ? await updateWinnerAction(initialData.winnerId, payload)
                : await createWinnerAction(payload);

            setPendingValues(null);

            if (res.ok) {
                toast.success(res.message);
                router.push('/dashboard/winners');
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    // Editing an existing row does not re-trigger the draw_pass side effect.
    const onSubmit = (values: FormValues) => (initialData ? submit(values) : setPendingValues(values));

    const giveawayLabel = (id: string) => giveaways.find((g) => g.id === id)?.label ?? id;

    return (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
            <div className='flex items-center gap-4'>
                <Button variant='outline' size='icon' asChild>
                    <Link href='/dashboard/winners'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <Heading title={title} description={description} />
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <FormField
                            control={form.control}
                            name='giveawayId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giveaway</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select the giveaway that was drawn' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='dashboard-theme dark'>
                                            {giveaways.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='userId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Member ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder='019f…' {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Copy this from the member’s admin detail page URL. Their name and state are
                                            filled in automatically.
                                        </FormDescription>
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
                                        <FormDescription>
                                            What this member actually won. Defaults are not copied from the giveaway.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='flex justify-end gap-3 border-t border-white/10 pt-6'>
                            <Button variant='outline' asChild>
                                <Link href='/dashboard/winners'>Cancel</Link>
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                {initialData ? 'Save Changes' : 'Record Winner'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <ConfirmDialog
                open={pendingValues !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingValues(null);
                }}
                className='dashboard-theme dark'
                title='Record this winner?'
                isLoading={isPending}
                confirmText='Record Winner'
                desc={
                    <span className='flex flex-col gap-2'>
                        <span>
                            Recording a winner removes them from the remaining giveaways in this cycle. Check the member
                            ID before continuing.
                        </span>
                        <span className='text-white/80'>
                            {giveawayLabel(pendingValues?.giveawayId ?? '')} · {pendingValues?.prize} · member{' '}
                            {pendingValues?.userId}
                        </span>
                    </span>
                }
                handleConfirm={() => {
                    if (pendingValues) submit(pendingValues);
                }}
            />
        </div>
    );
}
