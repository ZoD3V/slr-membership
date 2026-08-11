'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NotificationTemplate } from '@/types/member';

import { TemplateEditDialog } from './_components/template-edit-dialog';
import { Pencil, TriangleAlert } from 'lucide-react';

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
                        Couldn&apos;t load the notification templates — showing placeholders. Saving will fail until the
                        endpoint recovers.
                    </span>
                </p>
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
                                disabled={isPlaceholder}
                                title={
                                    isPlaceholder
                                        ? 'Editing is unavailable while the templates endpoint is failing.'
                                        : undefined
                                }>
                                <Pencil className='size-3.5' />
                                Edit
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <pre className='text-muted-foreground max-h-32 overflow-hidden text-xs whitespace-pre-wrap'>
                                {template.body}
                            </pre>
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
