'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';

import { saveDrawRulesAction } from './actions';
import { uploadPrizeAsset } from './upload-asset';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

function hasText(value: string): boolean {
    return (
        value
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .trim().length > 0
    );
}

export function DrawRulesCard({ initialContent, existingId }: { initialContent: string; existingId: string | null }) {
    const [content, setContent] = useState(initialContent);
    const [id, setId] = useState(existingId);
    const [isPending, startTransition] = useTransition();

    const dirty = content !== initialContent;

    const handleSave = () => {
        if (!hasText(content)) {
            toast.error('Write the draw rules before saving.');

            return;
        }

        startTransition(async () => {
            const res = await saveDrawRulesAction(content, id);

            if (res.ok) {
                setId(res.data.id);
                toast.success(res.message);
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Draw rules</CardTitle>
                <p className='text-muted-foreground text-sm'>
                    Shown on <span className='font-medium'>/member/prizes</span> and on every prize draw detail page.
                    Stored in Announcements as <span className='font-mono text-xs'>DRAW_RULES</span>, so it can be
                    updated as often as the rules change.
                </p>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
                <WysiwygEditor
                    value={content}
                    onChange={setContent}
                    placeholder='Entries are allocated automatically each 28-day cycle…'
                    onImageUpload={uploadPrizeAsset}
                />

                <div className='flex items-center justify-end gap-3'>
                    {dirty ? <span className='text-muted-foreground text-xs'>Unsaved changes</span> : null}
                    <Button type='button' onClick={handleSave} disabled={isPending || !dirty}>
                        {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                        Save draw rules
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
