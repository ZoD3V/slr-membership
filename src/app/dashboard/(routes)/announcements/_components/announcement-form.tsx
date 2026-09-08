'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { ANNOUNCEMENT_TYPES, type AnnouncementPayload, RUNNING_TEXT_TYPE } from '@/lib/api/resources/announcements';
import { zodResolver } from '@hookform/resolvers/zod';

import { createAnnouncementAction, updateAnnouncementAction } from '../actions';
import { uploadAnnouncementAsset } from './upload-asset';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// The API accepts a missing type, an unknown type, a negative sort_order and a
// non-URL link_url without complaint (verified live 2026-09-01), so these rules are
// the only thing standing between the admin form and malformed rows.
function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);

        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function hasText(value: string): boolean {
    return (
        value
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .trim().length > 0
    );
}

const formSchema = z.object({
    type: z.string().trim().min(1, 'Type is required').max(64, 'Type is too long'),
    title: z.string().trim().max(200, 'Keep the title under 200 characters').optional(),
    content: z
        .string()
        .min(1, 'Content is required')
        .refine(hasText, 'Content is required')
        .refine((value) => value.length <= 50000, 'Keep the content under 50,000 characters'),
    linkUrl: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || isHttpUrl(value), 'Use a full http(s) URL, e.g. https://example.com/page'),
    isActive: z.boolean(),
    sortOrder: z
        .number({ message: 'Enter a number' })
        .int('Use a whole number')
        .min(0, 'Must be 0 or more')
        .max(9999, 'Must be 9999 or less')
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
    initialData?: {
        id: string;
        type: string;
        title: string;
        content: string;
        linkUrl: string;
        isActive: boolean;
        sortOrder: number;
    };
}

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const heading = initialData ? 'Edit Announcement' : 'New Announcement';
    const description = initialData
        ? 'Update this announcement.'
        : 'Add running text or an announcement to the platform.';

    const defaultValues: FormValues = initialData
        ? {
              type: initialData.type,
              title: initialData.title,
              content: initialData.content,
              linkUrl: initialData.linkUrl,
              isActive: initialData.isActive,
              sortOrder: initialData.sortOrder
          }
        : {
              type: 'RUNNING_TEXT',
              title: '',
              content: '',
              linkUrl: '',
              isActive: true,
              sortOrder: 0
          };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    // A record may already carry a type this build doesn't know about. Offer it in the
    // list so editing that record can't quietly rewrite its type; new records can only
    // ever pick from the known set.
    const typeOptions: string[] =
        initialData && !ANNOUNCEMENT_TYPES.includes(initialData.type as (typeof ANNOUNCEMENT_TYPES)[number])
            ? [initialData.type, ...ANNOUNCEMENT_TYPES]
            : [...ANNOUNCEMENT_TYPES];

    // Running text ends up in the hero marquee as plain text split on “•”, so it stays
    // a textarea — editor markup would leak into the ticker. Every other type is
    // rendered as a rich block and gets the full editor.
    const isRunningText = form.watch('type') === RUNNING_TEXT_TYPE;

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const payload: AnnouncementPayload = {
                type: values.type,
                title: values.title?.trim() ? values.title.trim() : null,
                content: values.content.trim(),
                link_url: values.linkUrl?.trim() ? values.linkUrl.trim() : null,
                is_active: values.isActive,
                sort_order: values.sortOrder
            };

            const res = initialData
                ? await updateAnnouncementAction(initialData.id, payload)
                : await createAnnouncementAction(payload);

            if (!res.ok) {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);

                return;
            }

            toast.success(res.message);
            // push() alone: calling refresh() straight after cancels the navigation, which
            // left the button spinning on a page that never moved.
            router.push('/dashboard/announcements');
        });
    };

    return (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
            <div className='flex items-center gap-4'>
                <Button variant='outline' size='icon' asChild>
                    <Link href='/dashboard/announcements'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <Heading title={heading} description={description} />
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='type'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {typeOptions.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            RUNNING_TEXT feeds the ticker on the landing page hero.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Internal label (optional)' {...field} />
                                        </FormControl>
                                        <FormDescription>Admin-only label — members never see it.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='content'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        {isRunningText ? (
                                            <Textarea
                                                rows={4}
                                                placeholder='$2,100 PRIZE POOL • ONLY 100 MEMBERS COMPETING • ODDS 9 IN 10 P/A'
                                                {...field}
                                            />
                                        ) : (
                                            <WysiwygEditor
                                                placeholder='Write the announcement…'
                                                onImageUpload={uploadAnnouncementAsset}
                                                {...field}
                                            />
                                        )}
                                    </FormControl>
                                    <FormDescription>
                                        {isRunningText
                                            ? 'Plain text only — separate ticker segments with “•”, each becomes its own block on the hero marquee.'
                                            : 'Rich text — formatting and images are kept as written.'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='linkUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='url'
                                                inputMode='url'
                                                placeholder='https://smartliferewards.com.au/membership'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Optional — leave empty for plain text.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='sortOrder'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sort order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={9999}
                                                step={1}
                                                {...field}
                                                onChange={(e) => {
                                                    const next = e.target.valueAsNumber;
                                                    field.onChange(Number.isFinite(next) ? Math.trunc(next) : 0);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Lower numbers are shown first.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='isActive'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-between gap-4'>
                                    <div className='space-y-1'>
                                        <FormLabel>Active</FormLabel>
                                        <FormDescription>Inactive announcements are not published.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-3 border-t border-white/10 pt-6'>
                            <Button type='button' variant='outline' asChild>
                                <Link href='/dashboard/announcements'>Cancel</Link>
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                {initialData ? 'Save Changes' : 'Create Announcement'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
