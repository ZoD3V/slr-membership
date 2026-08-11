'use client';

import { useEffect, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NotificationChannel, NotificationTemplate, RecipientOption } from '@/types/member';

import { RecipientPickerDialog } from './_components/recipient-picker-dialog';
import { sendNotificationsAction } from './actions';
import { MAX_SEND_RECIPIENTS } from './seed';
import { X } from 'lucide-react';
import { toast } from 'sonner';

/** A resend arrives with only a user_id in the URL, so there is no email to
 *  show yet. Label the chip by whatever identity we actually have rather than
 *  printing a uuid in the email slot. */
function recipientLabel(recipient: RecipientOption) {
    return recipient.email || recipient.name || recipient.user_id;
}

export function SendClient({
    templates,
    prefillUserId,
    prefillTemplateId
}: {
    templates: NotificationTemplate[];
    prefillUserId?: string;
    prefillTemplateId?: string;
}) {
    const [recipients, setRecipients] = useState<RecipientOption[]>([]);
    const [templateId, setTemplateId] = useState<string>(prefillTemplateId ?? '');
    const [channel, setChannel] = useState<NotificationChannel>('email');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // A Resend click lands here with only an id in the URL. Seed a chip from
    // it so the recipient is visible immediately; the real name and email
    // fill in when the admin opens the picker and selects them.
    useEffect(() => {
        if (!prefillUserId) return;

        setRecipients((current) =>
            current.some((r) => r.user_id === prefillUserId)
                ? current
                : [
                      ...current,
                      {
                          user_id: prefillUserId,
                          name: `Member ${prefillUserId.slice(0, 8)}…`,
                          email: ''
                      }
                  ]
        );
    }, [prefillUserId]);

    // A resend can carry a template_id whose template is not in the loaded
    // list (deleted, or the list itself failed to load). Don't leave the
    // Select showing an id it can't resolve.
    const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
    const hasUnresolvedTemplate = templateId !== '' && selectedTemplate === null;
    const canSend = recipients.length > 0 && selectedTemplate !== null && !isSending;

    const onSend = async () => {
        if (!selectedTemplate) return;

        setIsSending(true);
        const result = await sendNotificationsAction({
            user_ids: recipients.map((r) => r.user_id),
            template_id: selectedTemplate.id,
            channel
        });
        setIsSending(false);
        setConfirmOpen(false);

        if (result.ok) {
            toast.success(result.message);
            if (result.data.skipped > 0) {
                toast.warning(
                    `${result.data.skipped} recipient${result.data.skipped === 1 ? '' : 's'} were skipped. The API does not report why.`
                );
            }
            setRecipients([]);

            return;
        }

        toast.error(result.message);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-base'>Send a notification manually</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='space-y-2'>
                    <Label>
                        Recipients ({recipients.length} / {MAX_SEND_RECIPIENTS})
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                        {recipients.map((r) => (
                            <span
                                key={r.user_id}
                                className='border-slr-navy-border bg-slr-navy-card flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs'>
                                {recipientLabel(r)}
                                <button
                                    type='button'
                                    aria-label={`Remove ${recipientLabel(r)}`}
                                    onClick={() =>
                                        setRecipients((current) => current.filter((c) => c.user_id !== r.user_id))
                                    }>
                                    <X className='size-3' />
                                </button>
                            </span>
                        ))}
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={() => setPickerOpen(true)}>
                        Choose recipients
                    </Button>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Template</Label>
                        <Select value={selectedTemplate?.id ?? ''} onValueChange={setTemplateId}>
                            <SelectTrigger>
                                <SelectValue placeholder='Pick a template' />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.type}
                                        {t.is_active ? '' : ' — inactive'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasUnresolvedTemplate ? (
                            <p className='text-xs text-amber-400'>
                                The template this resend referenced isn&apos;t in the loaded list. Pick one.
                            </p>
                        ) : null}
                        {selectedTemplate && !selectedTemplate.is_active ? (
                            <p className='text-xs text-amber-400'>
                                This template is inactive. Sending it is probably a mistake.
                            </p>
                        ) : null}
                    </div>

                    <div className='space-y-2'>
                        <Label>Channel</Label>
                        <Select value={channel} onValueChange={(v) => setChannel(v as NotificationChannel)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                <SelectItem value='email'>Email</SelectItem>
                                <SelectItem value='sms'>SMS — not yet verified in production</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button type='button' disabled={!canSend} onClick={() => setConfirmOpen(true)}>
                    {isSending ? 'Sending…' : 'Send'}
                </Button>
            </CardContent>

            <RecipientPickerDialog
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selected={recipients}
                onConfirm={setRecipients}
            />

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className='dashboard-theme dark'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Send to {recipients.length} member{recipients.length === 1 ? '' : 's'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This sends the <strong>{selectedTemplate?.type ?? 'selected'}</strong> template over{' '}
                            {channel} to {recipients.length} real member
                            {recipients.length === 1 ? '' : 's'}. It cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onSend}>Send now</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
