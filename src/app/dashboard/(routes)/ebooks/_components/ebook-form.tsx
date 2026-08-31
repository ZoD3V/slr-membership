'use client';

import { useEffect, useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ImageUploadField } from '@/components/common/image-upload-field';
import { PdfUploadField } from '@/components/common/pdf-upload-field';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import type { EbookChapter, EbookTier } from '@/lib/api/resources/ebooks';
import { type EbookContentMode, isExternalReadUrl, resolveEbookMode } from '@/lib/ebook-mode';
import { zodResolver } from '@hookform/resolvers/zod';

import { createEbookAction, deleteChapterAction, updateEbookAction } from '../actions';
import { ChapterDialog } from './chapter-dialog';
import { uploadEbookAsset } from './upload-asset';
import { ArrowLeft, Info, Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const TIERS: EbookTier[] = ['VISITOR', 'RED', 'BLUE'];

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),

    coverUrl: z.string().min(1, 'Cover image is required'),
    pdfUrl: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    footnote: z.string().optional(),
    tierAccess: z.enum(['VISITOR', 'RED', 'BLUE']),
    readingTimeMinutes: z.number().min(0, 'Must be 0 or more')
});

type FormValues = z.infer<typeof formSchema>;

interface EbookFormProps {
    initialData?: {
        id: string;
        title: string;
        subtitle: string;
        description: string;
        coverUrl: string;
        pdfUrl: string;
        category: string;
        footnote: string;
        tierAccess: EbookTier;
        readingTimeMinutes: number;
        chapters: EbookChapter[];
    };
}

export function EbookForm({ initialData }: EbookFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [chapters, setChapters] = useState<EbookChapter[]>(initialData?.chapters || []);
    const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<EbookChapter | null>(null);
    const [chapterPendingDelete, setChapterPendingDelete] = useState<EbookChapter | null>(null);

    const [contentMode, setContentMode] = useState<EbookContentMode>(
        initialData ? resolveEbookMode(initialData.pdfUrl) : 'chapters'
    );
    const isEditing = Boolean(initialData);

    useEffect(() => {
        if (initialData?.chapters) {
            setChapters(initialData.chapters);
        }
    }, [initialData?.chapters]);

    const handleRefreshChapters = () => {
        router.refresh();
    };

    const requestDeleteChapter = (chapter: EbookChapter) => {
        if (!chapter.chapter_id) {
            toast.error('Cannot delete: Chapter ID (UUID) is missing in backend data.', {
                description: 'Please request backend developers to expose the chapter ID.'
            });

            return;
        }

        setChapterPendingDelete(chapter);
    };

    const confirmDeleteChapter = () => {
        const chapter = chapterPendingDelete;
        if (!chapter?.chapter_id) return;

        startTransition(async () => {
            const res = await deleteChapterAction(initialData!.id, chapter.chapter_id!);
            setChapterPendingDelete(null);
            if (res.ok) {
                toast.success('Chapter deleted successfully');
                handleRefreshChapters();
            } else {
                toast.error(res.message);
            }
        });
    };

    const sortedChapters = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);

    const title = initialData ? 'Edit Ebook' : 'New Ebook';
    const description = initialData ? 'Update details of the ebook.' : 'Add a new ebook to the library.';

    const defaultValues: FormValues = initialData
        ? {
              title: initialData.title,
              subtitle: initialData.subtitle,
              coverUrl: initialData.coverUrl,
              pdfUrl: initialData.pdfUrl,
              description: initialData.description,
              category: initialData.category,
              footnote: initialData.footnote,
              tierAccess: initialData.tierAccess,
              readingTimeMinutes: initialData.readingTimeMinutes
          }
        : {
              title: '',
              subtitle: '',
              coverUrl: '',
              pdfUrl: '',
              description: '',
              category: '',
              footnote: '',
              tierAccess: 'RED',
              readingTimeMinutes: 0
          };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues
    });

    const onSubmit = (values: FormValues) => {
        if (contentMode === 'pdf' && !values.pdfUrl) {
            form.setError('pdfUrl', { message: 'Upload a PDF or paste its URL.' });

            return;
        }

        const externalUrl = values.pdfUrl?.trim() ?? '';

        if (contentMode === 'external') {
            if (!externalUrl) {
                form.setError('pdfUrl', { message: 'Paste the URL where members read this book.' });

                return;
            }

            if (!isExternalReadUrl(externalUrl)) {
                form.setError('pdfUrl', {
                    message: 'Use a full http(s) link to a reading page. A .pdf link belongs in the PDF mode.'
                });

                return;
            }
        }

        let payload: FormValues;
        if (contentMode === 'pdf') {
            payload = { ...values, pdfUrl: values.pdfUrl, description: '' };
        } else if (contentMode === 'external') {
            payload = { ...values, pdfUrl: externalUrl };
        } else {
            payload = { ...values, pdfUrl: null as unknown as string };
        }

        startTransition(async () => {
            const res = initialData
                ? await updateEbookAction(initialData.id, payload)
                : await createEbookAction(payload);

            if (res.ok) {
                toast.success(res.message);
                router.push('/dashboard/ebooks');
                router.refresh();
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
            <div className='flex items-center gap-4'>
                <Button variant='outline' size='icon' asChild>
                    <Link href='/dashboard/ebooks'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <Heading title={title} description={description} />
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm font-medium text-white/80'>Content type</span>
                            <ToggleGroup
                                type='single'
                                value={contentMode}
                                onValueChange={(v) => {
                                    if (v && !isEditing) setContentMode(v as EbookContentMode);
                                }}
                                disabled={isEditing}
                                className='w-fit'>
                                <ToggleGroupItem value='chapters'>Chapters</ToggleGroupItem>
                                <ToggleGroupItem value='pdf'>PDF</ToggleGroupItem>
                                <ToggleGroupItem value='external'>External link</ToggleGroupItem>
                            </ToggleGroup>
                            <p className='text-xs text-white/40'>
                                {isEditing
                                    ? 'Content type is fixed after creation.'
                                    : 'Multi-chapter reader, a single uploaded PDF, or a landing page that sends members to another site to read.'}
                            </p>
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Smart Money Essentials' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='subtitle'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Optional subtitle' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {contentMode !== 'pdf' && (
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {contentMode === 'external'
                                                ? 'Description (landing page body)'
                                                : 'Content / Description'}
                                        </FormLabel>
                                        <FormControl>
                                            <WysiwygEditor
                                                placeholder={
                                                    contentMode === 'external'
                                                        ? 'Describe the book — this is the whole body of the member landing page...'
                                                        : 'Write the ebook content or description...'
                                                }
                                                onImageUpload={uploadEbookAsset}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {contentMode === 'pdf' && (
                            <FormField
                                control={form.control}
                                name='pdfUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PDF file</FormLabel>
                                        <FormControl>
                                            <PdfUploadField
                                                value={field.value}
                                                onChange={field.onChange}
                                                onUpload={uploadEbookAsset}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {contentMode === 'external' && (
                            <FormField
                                control={form.control}
                                name='pdfUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>External read URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='url'
                                                inputMode='url'
                                                placeholder='https://www.free-ebooks.net/self-help/Becoming-Mindful'
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className='text-xs text-white/40'>
                                            Members see a landing page with the cover, title and description, then this
                                            link opens in a new tab. A URL ending in .pdf is not accepted here — upload
                                            it through the PDF mode instead.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name='coverUrl'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover image</FormLabel>
                                    <FormControl>
                                        <ImageUploadField
                                            value={field.value}
                                            onChange={field.onChange}
                                            onUpload={uploadEbookAsset}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='category'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Finance' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='footnote'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Footnote</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Optional footnote' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='readingTimeMinutes'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reading (min)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tierAccess'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='flex items-center gap-1.5'>
                                            Tier access
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className='h-3.5 w-3.5 cursor-help text-white/50 transition-colors hover:text-white' />
                                                </TooltipTrigger>
                                                <TooltipContent className='dashboard-theme dark max-w-[250px] border border-white/10 bg-black p-2 text-xs text-white'>
                                                    {initialData
                                                        ? 'Re-select the tier if editing a previously listed ebook.'
                                                        : 'Select access level.'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select tier' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {TIERS.map((t) => (
                                                    <SelectItem key={t} value={t}>
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {initialData ? (
                                            <p className='text-xs text-amber-400'>
                                                ⚠ Not loaded from the server — confirm the correct tier before saving,
                                                or you may change this ebook&apos;s access unintentionally.
                                            </p>
                                        ) : null}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='flex justify-end gap-3 border-t border-white/10 pt-6'>
                            <Button type='button' variant='outline' asChild>
                                <Link href='/dashboard/ebooks'>Cancel</Link>
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                {initialData ? 'Save Changes' : 'Create Ebook'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {initialData && contentMode === 'chapters' && (
                <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                    <div className='mb-6 flex items-center justify-between border-b border-white/10 pb-4'>
                        <div>
                            <h3 className='font-bebas-neue text-2xl tracking-wide text-white uppercase'>
                                Chapters & Sections
                            </h3>
                            <p className='text-xs text-white/50'>Manage the chapters and content of this e-book.</p>
                        </div>
                        <Button
                            type='button'
                            onClick={() => {
                                setSelectedChapter(null);
                                setIsChapterDialogOpen(true);
                            }}>
                            + Add Chapter
                        </Button>
                    </div>

                    {sortedChapters.length === 0 ? (
                        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-12 text-center'>
                            <p className='mb-2 text-sm text-white/40'>No chapters added yet</p>
                            <p className='max-w-sm text-xs text-white/30'>
                                Create chapters to structure the e-book. They will be displayed in the long-form member
                                reader.
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-2 shadow-sm'>
                            <table className='w-full table-auto border-collapse text-left text-sm text-white/80'>
                                <thead>
                                    <tr className='border-b border-white/10 bg-white/5 text-xs font-semibold text-white/40 uppercase'>
                                        <th className='w-20 px-3 py-3'>No.</th>
                                        <th className='px-3 py-3'>Title</th>
                                        <th className='max-w-xs px-3 py-3'>Pull Quote</th>
                                        <th className='px-3 py-3'>Body Preview</th>
                                        <th className='w-36 px-3 py-3 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-white/5'>
                                    {sortedChapters.map((ch) => (
                                        <tr key={ch.chapter_number} className='transition-colors hover:bg-white/5'>
                                            <td className='px-3 py-4 font-semibold text-[#D4AF37]'>
                                                Ch. {String(ch.chapter_number).padStart(2, '0')}
                                            </td>
                                            <td className='px-3 py-4 font-medium text-white'>{ch.title}</td>
                                            <td className='max-w-xs truncate px-3 py-4 text-xs text-white/60 italic'>
                                                {ch.pull_quote ? `“${ch.pull_quote}”` : '-'}
                                            </td>
                                            <td className='max-w-md truncate px-3 py-4 text-xs text-white/40'>
                                                {ch.body
                                                    ? ch.body.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                                                    : '-'}
                                            </td>
                                            <td className='px-3 py-4 text-right'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => {
                                                            setSelectedChapter(ch);
                                                            setIsChapterDialogOpen(true);
                                                        }}
                                                        className='h-8 text-white/70 hover:bg-white/10 hover:text-white'>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => requestDeleteChapter(ch)}
                                                        className='h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300'>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <ChapterDialog
                        isOpen={isChapterDialogOpen}
                        onClose={() => setIsChapterDialogOpen(false)}
                        ebookId={initialData.id}
                        chapter={selectedChapter}
                        onSuccess={handleRefreshChapters}
                    />

                    <ConfirmDialog
                        open={chapterPendingDelete !== null}
                        onOpenChange={(open) => {
                            if (!open) setChapterPendingDelete(null);
                        }}
                        className='dashboard-theme dark'
                        title='Delete this chapter?'
                        destructive
                        isLoading={isPending}
                        confirmText='Delete'
                        desc={`Chapter ${chapterPendingDelete?.chapter_number} — "${chapterPendingDelete?.title}" will be permanently removed.`}
                        handleConfirm={confirmDeleteChapter}
                    />
                </div>
            )}
        </div>
    );
}
