'use client';

import { useEffect, useState, useTransition } from 'react';

import { ImageUploadField } from '@/components/common/image-upload-field';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import type { EbookChapter } from '@/lib/api/resources/ebooks';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { createChapterAction, updateChapterAction } from '../actions';
import { uploadEbookAsset } from './upload-asset';
import { ChevronRight, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const chapterSchema = z.object({
    chapterNumber: z.number().int().positive('Chapter number must be positive'),
    title: z.string().min(1, 'Title is required').max(300, 'Title is too long'),
    imageUrl: z.string().max(500, 'URL is too long').optional().or(z.literal('')),
    pullQuote: z.string().max(500, 'Pull quote is too long').optional().or(z.literal('')),
    body: z.string().min(1, 'Body content is required')
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ebookId: string;
    chapter?: EbookChapter | null;
    onSuccess: () => void;
}

export function ChapterDialog({ isOpen, onClose, ebookId, chapter, onSuccess }: ChapterDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const isEdit = !!chapter;
    const title = isEdit ? 'Edit Chapter' : 'Add Chapter';
    const description = isEdit ? 'Modify the details of this chapter.' : 'Add a new chapter to this ebook.';

    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(chapterSchema),
        defaultValues: {
            chapterNumber: 1,
            title: '',
            imageUrl: '',
            pullQuote: '',
            body: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            setShowAdvanced(false);
            if (chapter) {
                form.reset({
                    chapterNumber: chapter.chapter_number,
                    title: chapter.title,
                    imageUrl: chapter.image_url ?? '',
                    pullQuote: chapter.pull_quote ?? '',
                    body: chapter.body
                });
            } else {
                form.reset({
                    chapterNumber: 1,
                    title: '',
                    imageUrl: '',
                    pullQuote: '',
                    body: ''
                });
            }
        }
    }, [isOpen, chapter, form]);

    const onSubmit = (values: ChapterFormValues) => {
        startTransition(async () => {
            const payload = {
                chapterNumber: values.chapterNumber,
                title: values.title,
                body: values.body,
                imageUrl: values.imageUrl || null,
                pullQuote: values.pullQuote || null,
                sortOrder: values.chapterNumber
            };

            let res;
            if (isEdit && chapter) {
                if (!chapter.chapter_id) {
                    toast.error('Cannot edit: Chapter ID (UUID) is missing in backend data.', {
                        description: 'Please request backend developers to expose the chapter ID.'
                    });

                    return;
                }
                res = await updateChapterAction(ebookId, chapter.chapter_id, payload);
            } else {
                res = await createChapterAction(ebookId, payload);
            }

            if (res.ok) {
                toast.success(res.message);
                onSuccess();
                onClose();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className='dashboard-theme dark text-foreground flex h-full w-full flex-col overflow-y-auto p-6 sm:max-w-2xl'>
                <SheetHeader className='border-border border-b pb-4'>
                    <div className='flex items-center gap-2'>
                        <span className='bg-primary h-4 w-1 rounded-full' />
                        <SheetTitle className='font-bebas-neue text-foreground text-xl tracking-wide uppercase'>
                            {title}
                        </SheetTitle>
                    </div>
                    <SheetDescription className='text-muted-foreground mt-0.5 text-xs'>{description}</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='mt-4 flex flex-1 flex-col justify-between space-y-6'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
                                <FormField
                                    control={form.control}
                                    name='chapterNumber'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-muted-foreground text-xs'>Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    min={1}
                                                    placeholder='Ch. #'
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-[10px]' />
                                        </FormItem>
                                    )}
                                />
                                <div className='sm:col-span-3'>
                                    <FormField
                                        control={form.control}
                                        name='title'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-muted-foreground text-xs'>
                                                    Chapter Title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder='e.g. The Shift' {...field} />
                                                </FormControl>
                                                <FormMessage className='text-[10px]' />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name='body'
                                render={({ field }) => (
                                    <FormItem className='flex flex-col'>
                                        <FormLabel className='text-muted-foreground text-xs'>
                                            Content / Description
                                        </FormLabel>
                                        <FormControl>
                                            <WysiwygEditor
                                                placeholder='Write your chapter body content here. Paragraphs split by double line breaks...'
                                                onImageUpload={uploadEbookAsset}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-[10px]' />
                                    </FormItem>
                                )}
                            />

                            <div className='space-y-4'>
                                <button
                                    type='button'
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className='text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 py-1 text-xs transition-colors focus:outline-hidden'>
                                    <ChevronRight
                                        className={cn(
                                            'size-3.5 transition-transform duration-200',
                                            showAdvanced && 'rotate-90'
                                        )}
                                    />
                                    <span>
                                        {showAdvanced
                                            ? 'Hide Optional Fields'
                                            : 'Show Optional Fields (Image, Pull Quote)'}
                                    </span>
                                </button>

                                {showAdvanced && (
                                    <div className='animate-in fade-in-0 slide-in-from-top-1 border-border space-y-4 border-t pt-4 duration-200'>
                                        <FormField
                                            control={form.control}
                                            name='imageUrl'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-muted-foreground text-xs'>
                                                        Feature Image
                                                    </FormLabel>
                                                    <FormControl>
                                                        <ImageUploadField
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            onUpload={uploadEbookAsset}
                                                            placeholder='https://example.com/image.webp'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-[10px]' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='pullQuote'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-muted-foreground text-xs'>
                                                        Pull Quote
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='An inspiring quote to highlight inside the chapter'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='text-[10px]' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='border-border mt-auto flex items-center justify-end gap-3 border-t pt-6'>
                            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isPending} className='min-w-32'>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                Save Chapter
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
