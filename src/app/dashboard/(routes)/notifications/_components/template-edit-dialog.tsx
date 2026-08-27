'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { NotificationTemplate } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { saveNotificationTemplateAction } from '../actions';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    subject: z.string().trim().min(1, 'Subject is required.').max(255, 'Subject must be 255 characters or fewer.'),
    body: z.string().trim().min(1, 'Body is required.'),
    is_active: z.boolean()
});

type FormValues = z.infer<typeof schema>;

function toFormValues(template: NotificationTemplate): FormValues {
    return { subject: template.subject, body: template.body, is_active: template.is_active };
}

export function TemplateEditDialog({
    template,
    open,
    onOpenChange
}: {
    template: NotificationTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { subject: '', body: '', is_active: true }
    });

    useEffect(() => {
        if (template) form.reset(toFormValues(template));
    }, [template, form]);

    const onSubmit = async (values: FormValues) => {
        if (!template) return;

        setIsSaving(true);
        const result = await saveNotificationTemplateAction(template.id, values);
        setIsSaving(false);

        if (result.ok) {
            form.reset(toFormValues(result.data));
            toast.success(result.message);
            onOpenChange(false);

            return;
        }

        toast.error(result.message);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='dashboard-theme dark sm:max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Edit template</DialogTitle>
                    <DialogDescription>{template ? `${template.type} · ${template.channel}` : ''}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='subject'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={255} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='body'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={12} className='font-mono text-xs' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='is_active'
                            render={({ field }) => (
                                <FormItem className='border-slr-navy-border flex items-center justify-between rounded-lg border p-3'>
                                    <div className='space-y-0.5'>
                                        <FormLabel>Active</FormLabel>
                                        <p className='text-muted-foreground text-xs'>
                                            Turning this off stops this notification from being sent at all.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSaving || !form.formState.isDirty}>
                                {isSaving ? 'Saving…' : 'Save template'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
