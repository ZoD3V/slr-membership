'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NotificationTemplate } from '@/types/member';

import { TemplateEditDialog } from './_components/template-edit-dialog';
import { MailX, Pencil, TriangleAlert } from 'lucide-react';

export function TemplatesClient({
    templates,
    isPlaceholder
}: {
    templates: NotificationTemplate[];
    isPlaceholder: boolean;
}) {
    const [editing, setEditing] = useState<NotificationTemplate | null>(null);

    return (
        <div className='space-y-4'>
            {isPlaceholder ? (
                <p className='text-muted-foreground flex items-start gap-2 text-sm'>
                    <TriangleAlert className='mt-0.5 size-4 shrink-0 text-amber-400/70' />
                    <span>
                        Couldn&apos;t load the notification templates — the cards below are placeholders, not what the
                        server holds. The editor still opens so the form can be reviewed, but a save is very likely to
                        fail.
                    </span>
                </p>
            ) : null}

            {!isPlaceholder && templates.length === 0 ? (
                <div className='border-slr-navy-border flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center'>
                    <MailX className='size-8 opacity-40' />
                    <p className='text-foreground text-sm font-semibold'>No templates configured</p>
                    <p className='text-muted-foreground max-w-md text-xs leading-relaxed'>
                        The endpoint loaded successfully and returned an empty list, so the platform currently has no
                        notification templates to edit. Manual sends need at least one, since the send API requires a
                        template id.
                    </p>
                </div>
            ) : null}

            <div className='grid gap-4 lg:grid-cols-2'>
                {templates.map((template) => (
                    <Card key={template.id}>
                        <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0'>
                            <div className='space-y-1'>
                                <CardTitle className='text-base'>{template.subject || '—'}</CardTitle>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge variant='outline'>{template.type}</Badge>
                                    <Badge variant='outline'>{template.channel}</Badge>
                                    <Badge
                                        className={
                                            template.is_active
                                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                                : 'border-slate-500/40 bg-slate-500/10 text-slate-300'
                                        }>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                type='button'
                                size='sm'
                                variant='outline'
                                onClick={() => setEditing(template)}
                                title={
                                    isPlaceholder
                                        ? 'This is a placeholder — the editor opens, but saving will very likely fail.'
                                        : undefined
                                }>
                                <Pencil className='size-3.5' />
                                Edit
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div
                                className='text-muted-foreground pointer-events-none max-h-32 overflow-hidden text-xs **:max-w-full'
                                // Admin-authored template content, not user input — safe to render.
                                // Clipped + non-interactive so a stray link/button in the markup
                                // can't be clicked from the card preview.
                                dangerouslySetInnerHTML={{ __html: template.body }}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <TemplateEditDialog
                template={editing}
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
            />
        </div>
    );
}
